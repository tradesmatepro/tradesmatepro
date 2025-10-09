import React, { useEffect, useMemo, useState } from 'react';
import { supaFetch } from '../utils/supaFetch';
import { useUser } from '../contexts/UserContext';

/**
 * Reusable SkillsPicker component
 * - Loads company skills catalog
 * - Supports optional level (1-5) and quantity controls
 * - Allows creating new skills inline when allowCreate=true
 *
 * value: Array<{ skill_id: string, name?: string, level?: number, quantity?: number }>
 * onChange: (next: value) => void
 */
export default function SkillsPicker({
  value = [],
  onChange,
  showLevel = true,
  showQuantity = false,
  allowCreate = true,
}) {
  const { user } = useUser();
  const companyId = user?.company_id;

  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');

  // Load catalog
  useEffect(() => {
    if (!companyId) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await supaFetch(`skills?company_id=eq.${companyId}&active=eq.true&select=id,name&order=name.asc`, { method: 'GET' }, companyId);
        if (!cancelled && res.ok) {
          const list = await res.json();
          setSkills(list || []);
        }
      } catch (e) {
        console.warn('Skills load failed', e);
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [companyId]);

  const options = useMemo(() => skills.map(s => ({ id: s.id, name: s.name })), [skills]);

  const addSkill = async (skillIdOrName) => {
    if (!skillIdOrName) return;

    // If a name that doesn't match existing, create it (when allowed)
    const existing = options.find(o => o.id === skillIdOrName || o.name.toLowerCase() === String(skillIdOrName).toLowerCase());
    let skillId = existing?.id;

    if (!skillId && allowCreate) {
      // Create new skill in catalog
      try {
        const body = { name: String(skillIdOrName).trim(), company_id: companyId };
        const res = await supaFetch('skills', { method: 'POST', body }, companyId);
        if (res.ok) {
          const [created] = await res.json();
          setSkills(prev => [...prev, created]);
          skillId = created.id;
        }
      } catch (e) {
        console.error('Failed to create skill', e);
      }
    }

    if (!skillId) return;

    // Skip duplicates
    if (value.some(v => v.skill_id === skillId)) return;
    const next = [...value, { skill_id: skillId, name: existing?.name || newSkillName || '', level: showLevel ? 1 : undefined, quantity: showQuantity ? 1 : undefined }];
    onChange && onChange(next);
    setNewSkillName('');
  };

  const removeSkill = (skillId) => {
    const next = value.filter(v => v.skill_id !== skillId);
    onChange && onChange(next);
  };

  const setLevel = (skillId, lvl) => {
    const next = value.map(v => v.skill_id === skillId ? { ...v, level: Math.min(5, Math.max(1, Number(lvl) || 1)) } : v);
    onChange && onChange(next);
  };

  const setQuantity = (skillId, qty) => {
    const n = Math.max(1, Math.floor(Number(qty) || 1));
    const next = value.map(v => v.skill_id === skillId ? { ...v, quantity: n } : v);
    onChange && onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <select
          className="flex-1 border rounded px-2 py-1"
          disabled={loading}
          value=""
          onChange={(e) => addSkill(e.target.value)}
        >
          <option value="" disabled>Select a skill...</option>
          {options.map(o => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
        {allowCreate && (
          <>
            <input
              className="flex-1 border rounded px-2 py-1"
              placeholder="Add new skill"
              value={newSkillName}
              onChange={(e)=>setNewSkillName(e.target.value)}
            />
            <button type="button" className="btn-secondary" onClick={()=>addSkill(newSkillName.trim())} disabled={!newSkillName.trim()}>Add</button>
          </>
        )}
      </div>

      {/* Selected list */}
      <div className="space-y-2">
        {value.length === 0 ? (
          <div className="text-xs text-gray-500">No skills selected</div>
        ) : value.map(v => {
          const displayName = v.name || options.find(o=>o.id===v.skill_id)?.name || v.skill_id;
          return (
            <div key={v.skill_id} className="flex items-center gap-3 border rounded p-2">
              <div className="flex-1 text-sm text-gray-800">{displayName}</div>
              {showLevel && (
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-gray-500">Level</span>
                  <select className="border rounded px-1 py-0.5" value={v.level || 1} onChange={(e)=>setLevel(v.skill_id, e.target.value)}>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              )}
              {showQuantity && (
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-gray-500">Qty</span>
                  <input className="w-16 border rounded px-1 py-0.5" type="number" min={1} step={1} value={v.quantity || 1} onChange={(e)=>setQuantity(v.skill_id, e.target.value)} />
                </div>
              )}
              <button type="button" className="btn-secondary" onClick={()=>removeSkill(v.skill_id)}>Remove</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

