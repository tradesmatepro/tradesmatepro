// Pure helpers for saved views and keyboard shortcut decisions

export function renameViewList(savedViews, name, newName) {
  if (!newName || newName === name) return { list: savedViews, changed: false };
  if (savedViews.some(v => v.name === newName)) return { list: savedViews, changed: false, error: 'duplicate' };
  const list = savedViews.map(v => v.name === name ? { ...v, name: newName } : v);
  return { list, changed: true };
}

export function deleteViewFromList(savedViews, name) {
  const list = savedViews.filter(v => v.name !== name);
  return { list, removed: savedViews.length !== list.length };
}

export function decideShortcutAction(eLike) {
  // eLike: { key: string, shiftKey?: boolean, altKey?: boolean }
  const k = (eLike.key || '').toLowerCase();
  if (eLike.shiftKey && k === 's') return 'quickSave';
  if (eLike.shiftKey && k === 'v') return 'openManageViews';
  if (eLike.altKey && k === 'v') return 'focusSavedViewsDropdown';
  if (k === ',') return 'prevPage';
  if (k === '.') return 'nextPage';
  return null;
}

