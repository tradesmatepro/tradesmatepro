// WorkOrderCompletionService
// Phase 2 wiring: persist checklist, photos, signatures on job completion

import { supaFetch, SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/supaFetch';
import { supabase } from '../utils/supabaseClient';
import DocumentsService from './DocumentsService';
import CloseoutPDFService from './CloseoutPDFService';

const WorkOrderCompletionService = {
  async saveChecklist(companyId, workOrderId, checklistItems) {
    try {
      if (!Array.isArray(checklistItems) || checklistItems.length === 0) return { success: true };
      // Create a new checklist container for this completion event (idempotent enough for v1)
      const checklistRes = await supaFetch('work_order_checklists', {
        method: 'POST',
        body: {
          company_id: companyId,
          work_order_id: workOrderId,
          name: 'Completion Checklist'
        },
        headers: { 'Prefer': 'return=representation' }
      }, companyId);
      if (!checklistRes.ok) throw new Error('Failed to create checklist');
      const checklist = await checklistRes.json();
      const checklistId = checklist?.[0]?.id;
      if (!checklistId) throw new Error('Checklist ID missing');

      // Insert items
      const itemsPayload = checklistItems.map((it) => ({
        checklist_id: checklistId,
        description: it.description || '',
        required: !!it.required,
        completed: !!it.completed
      }));
      if (itemsPayload.length > 0) {
        const itemsRes = await supaFetch('work_order_checklist_items', {
          method: 'POST',
          body: itemsPayload,
          headers: { 'Prefer': 'return=representation' }
        }, companyId);
        if (!itemsRes.ok) throw new Error('Failed to save checklist items');
      }
      return { success: true, checklistId };
    } catch (e) {
      console.warn('[WorkOrderCompletionService] saveChecklist failed', e);
      return { success: false, error: e.message };
    }
  },

  async uploadPhotos(companyId, workOrderId, files = [], uploadedBy) {
    try {
      if (!Array.isArray(files) || files.length === 0) return { success: true, photos: [] };
      const results = [];
      for (const f of files) {
        const res = await DocumentsService.uploadJobPhoto(companyId, workOrderId, f, uploadedBy, []);
        if (res?.success) results.push(res.photo);
      }
      return { success: true, photos: results };
    } catch (e) {
      console.warn('[WorkOrderCompletionService] uploadPhotos failed', e);
      return { success: false, error: e.message };
    }
  },

  async saveSignature(companyId, workOrderId, signerName) {
    try {
      if (!signerName) return { success: true };
      const sigRes = await supaFetch('work_order_signatures', {
        method: 'POST',
        body: {
          company_id: companyId,
          work_order_id: workOrderId,
          signer_name: signerName,
          signature_type: 'typed',
          signature_data: signerName
        },
        headers: { 'Prefer': 'return=representation' }
      }, companyId);
      if (!sigRes.ok) throw new Error('Failed to save signature');
      const data = await sigRes.json();
      return { success: true, signature: data?.[0] };
    } catch (e) {
      console.warn('[WorkOrderCompletionService] saveSignature failed', e);
      return { success: false, error: e.message };
    }
  },

  async saveAll({ companyId, workOrderId, userId, checklist, photos, signature, closeoutSummary }) {
    // Run in sequence; if any fails, continue and report best-effort
    const out = { checklist: null, photos: null, signature: null, pdf: null };
    out.checklist = await this.saveChecklist(companyId, workOrderId, checklist);
    out.photos = await this.uploadPhotos(companyId, workOrderId, photos, userId);
    out.signature = await this.saveSignature(companyId, workOrderId, signature);

    try {
      // Attempt to generate a closeout PDF (stub)
      out.pdf = await CloseoutPDFService.generate(workOrderId, closeoutSummary || {});
    } catch (e) {
      console.warn('[WorkOrderCompletionService] PDF generation failed', e);
      out.pdf = { success: false, error: e.message };
    }

    return out;
  }
};

export default WorkOrderCompletionService;

