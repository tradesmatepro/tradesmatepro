import { supabase } from '../utils/supabaseClient';
import { supaFetch } from '../utils/supaFetch';

class JobTemplatesService {
  // Get all job templates for a company
  static async getJobTemplates(companyId, category = null) {
    try {
      let query = 'job_templates?is_active=eq.true&order=usage_count.desc,name.asc';
      if (category && category !== 'all') {
        query += `&category=eq.${category}`;
      }

      const response = await supaFetch(query, { method: 'GET' }, companyId);
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to fetch job templates');
      }
    } catch (error) {
      console.error('Error fetching job templates:', error);
      throw error;
    }
  }

  // Get a specific template with all its items and checklist
  static async getJobTemplateWithItems(templateId, companyId) {
    try {
      // Use the custom function to get template with related data
      const { data, error } = await supabase.rpc('get_job_template_with_items', {
        template_uuid: templateId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching job template with items:', error);
      throw error;
    }
  }

  // Create a new job template with items and checklists
  static async createJobTemplate(templateData, companyId) {
    try {
      // Extract items and checklists from template data
      const { template_items, template_checklists, ...templateInfo } = templateData;

      const template = {
        company_id: companyId,
        name: templateInfo.name,
        description: templateInfo.description,
        category: templateInfo.category,
        default_duration: templateInfo.default_duration || 0,
        default_crew_size: templateInfo.default_crew_size || 1,
        default_hourly_rate: templateInfo.default_hourly_rate,
        default_markup_percentage: templateInfo.default_markup_percentage || 30.00,
        default_pricing_model: templateInfo.default_pricing_model || 'TIME_MATERIALS',
        created_by: templateInfo.created_by,
        is_active: templateInfo.is_active !== false,
        is_company_wide: true
      };

      const response = await supaFetch('job_templates', {
        method: 'POST',
        body: template
      }, companyId);

      if (!response.ok) {
        throw new Error('Failed to create job template');
      }

      const createdTemplate = await response.json();
      const templateId = createdTemplate[0]?.id;

      if (!templateId) {
        throw new Error('Template creation failed - no ID returned');
      }

      // Create template items if provided
      if (template_items && template_items.length > 0) {
        try {
          await this.addTemplateItems(templateId, template_items, companyId);
        } catch (error) {
          console.warn('Failed to create template items:', error);
        }
      }

      // Create template checklists if provided
      if (template_checklists && template_checklists.length > 0) {
        try {
          await this.addTemplateChecklist(templateId, template_checklists, companyId);
        } catch (error) {
          console.warn('Failed to create template checklists:', error);
        }
      }

      return createdTemplate[0];
    } catch (error) {
      console.error('Error creating job template:', error);
      throw error;
    }
  }

  // Add items to a job template
  static async addTemplateItems(templateId, items, companyId) {
    try {
      const templateItems = items.map((item, index) => ({
        template_id: templateId,
        item_type: item.item_type,
        name: item.name,
        description: item.description || '',
        unit_price: item.unit_price || 0,
        quantity: item.quantity || 1,
        unit: item.unit || 'each',
        labor_rate: item.labor_rate || null,
        estimated_hours: item.estimated_hours || null,
        sort_order: index
      }));

      const response = await supaFetch('job_template_items', {
        method: 'POST',
        body: templateItems
      }, companyId);

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to add template items');
      }
    } catch (error) {
      console.error('Error adding template items:', error);
      throw error;
    }
  }

  // Add checklist items to a job template
  static async addTemplateChecklist(templateId, checklistItems, companyId) {
    try {
      const checklist = checklistItems.map((item, index) => ({
        template_id: templateId,
        title: item.title,
        description: item.description || '',
        is_required: item.is_required || false,
        stage: item.stage || 'EXECUTION',
        estimated_minutes: item.estimated_minutes || 0,
        sort_order: index
      }));

      const response = await supaFetch('job_template_checklists', {
        method: 'POST',
        body: checklist
      }, companyId);

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to add template checklist');
      }
    } catch (error) {
      console.error('Error adding template checklist:', error);
      throw error;
    }
  }

  // Apply a template to create a new job
  static async applyTemplateToJob(templateId, jobData, companyId) {
    try {
      // First, get the template with all its items
      const templateWithItems = await this.getJobTemplateWithItems(templateId, companyId);
      
      if (!templateWithItems) {
        throw new Error('Template not found');
      }

      const template = templateWithItems.template;
      const items = templateWithItems.items || [];
      const checklist = templateWithItems.checklist || [];

      // Create the job with template defaults
      const jobWithTemplate = {
        ...jobData,
        template_id: templateId,
        estimated_duration: template.default_duration,
        // Apply template defaults if not already set
        job_title: jobData.job_title || template.name,
        description: jobData.description || template.description,
      };

      // Create the work order
      const workOrderResponse = await supaFetch('work_orders', {
        method: 'POST',
        body: jobWithTemplate
      }, companyId);

      if (!workOrderResponse.ok) {
        throw new Error('Failed to create job from template');
      }

      const createdJob = await workOrderResponse.json();
      const jobId = createdJob[0].id;

      // Add template items as work order items
      if (items.length > 0) {
        const workOrderItems = items.map(item => ({
          work_order_id: jobId,
          item_type: item.item_type,
          description: item.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          unit: item.unit,
          labor_hours: item.estimated_hours || 0,
          labor_rate: item.labor_rate || template.default_hourly_rate || 75.00
        }));

        await supaFetch('work_order_items', {
          method: 'POST',
          body: workOrderItems
        }, companyId);
      }

      // Increment template usage count
      await supabase.rpc('increment_template_usage', {
        template_uuid: templateId
      });

      return {
        job: createdJob[0],
        items: items,
        checklist: checklist
      };
    } catch (error) {
      console.error('Error applying template to job:', error);
      throw error;
    }
  }

  // Get template categories
  static async getTemplateCategories(companyId) {
    try {
      const response = await supaFetch(
        'job_templates?select=category&is_active=eq.true', 
        { method: 'GET' }, 
        companyId
      );
      
      if (response.ok) {
        const templates = await response.json();
        const categories = [...new Set(templates.map(t => t.category).filter(Boolean))];
        return categories.sort();
      } else {
        throw new Error('Failed to fetch template categories');
      }
    } catch (error) {
      console.error('Error fetching template categories:', error);
      return ['HVAC', 'Plumbing', 'Electrical', 'General']; // fallback
    }
  }

  // Update template
  static async updateJobTemplate(templateId, templateData, companyId) {
    try {
      const response = await supaFetch(`job_templates?id=eq.${templateId}`, {
        method: 'PATCH',
        body: {
          ...templateData,
          updated_at: new Date().toISOString()
        }
      }, companyId);

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to update job template');
      }
    } catch (error) {
      console.error('Error updating job template:', error);
      throw error;
    }
  }

  // Delete template
  static async deleteJobTemplate(templateId, companyId) {
    try {
      // Soft delete by setting is_active to false
      const response = await supaFetch(`job_templates?id=eq.${templateId}`, {
        method: 'PATCH',
        body: {
          is_active: false,
          updated_at: new Date().toISOString()
        }
      }, companyId);

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to delete job template');
      }
    } catch (error) {
      console.error('Error deleting job template:', error);
      throw error;
    }
  }

  // Get template usage statistics
  static async getTemplateStats(companyId) {
    try {
      const response = await supaFetch(
        'job_templates?select=category,usage_count&is_active=eq.true', 
        { method: 'GET' }, 
        companyId
      );
      
      if (response.ok) {
        const templates = await response.json();
        const stats = {
          total_templates: templates.length,
          total_usage: templates.reduce((sum, t) => sum + (t.usage_count || 0), 0),
          by_category: {}
        };

        templates.forEach(template => {
          const category = template.category || 'Other';
          if (!stats.by_category[category]) {
            stats.by_category[category] = { count: 0, usage: 0 };
          }
          stats.by_category[category].count++;
          stats.by_category[category].usage += template.usage_count || 0;
        });

        return stats;
      } else {
        throw new Error('Failed to fetch template stats');
      }
    } catch (error) {
      console.error('Error fetching template stats:', error);
      throw error;
    }
  }
}

export default JobTemplatesService;
