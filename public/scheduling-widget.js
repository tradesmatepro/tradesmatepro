/**
 * SchedulingWidget - Vanilla JavaScript Version
 * 
 * Standalone scheduling widget that can be used in any HTML page
 * Mirrors the React SchedulingWidget component functionality
 * 
 * Usage:
 * <div id="scheduling-widget"></div>
 * <script>
 *   const widget = new SchedulingWidget({
 *     containerId: 'scheduling-widget',
 *     companyId: 'abc-123',
 *     employeeIds: ['emp-1', 'emp-2'],
 *     durationMinutes: 120,
 *     supabaseUrl: 'https://...',
 *     supabaseAnonKey: 'eyJ...',
 *     onSlotSelected: (slot) => console.log('Selected:', slot),
 *     onAutoSchedule: (slot) => console.log('Auto-scheduled:', slot),
 *     showAutoSchedule: true,
 *     maxDaysAhead: 90
 *   });
 * </script>
 */

class SchedulingWidget {
  constructor(options) {
    // Required options
    this.containerId = options.containerId;
    this.companyId = options.companyId;
    this.employeeIds = options.employeeIds || [];
    this.durationMinutes = options.durationMinutes || 120;
    this.supabaseUrl = options.supabaseUrl;
    this.supabaseAnonKey = options.supabaseAnonKey;
    
    // Optional options
    this.onSlotSelected = options.onSlotSelected || (() => {});
    this.onAutoSchedule = options.onAutoSchedule || (() => {});
    this.showAutoSchedule = options.showAutoSchedule !== false;
    this.maxDaysAhead = options.maxDaysAhead || 90;
    
    // State
    this.availableSlots = [];
    this.filteredSlots = [];
    this.selectedSlot = null;
    this.weekFilter = 0; // 0 = this week, 1 = next week, etc.
    this.showCustomRange = false;
    this.loading = true;
    this.error = null;
    this.earliestSlot = null;
    
    // Initialize
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.error(`Container #${this.containerId} not found`);
      return;
    }
    
    this.render();
    this.loadAvailableSlots();
  }
  
  async loadAvailableSlots() {
    this.loading = true;
    this.error = null;
    this.render();
    
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + this.maxDaysAhead);
      
      const requestBody = {
        employeeIds: this.employeeIds,
        durationMinutes: this.durationMinutes,
        companyId: this.companyId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };
      
      const response = await fetch(
        `${this.supabaseUrl}/functions/v1/smart-scheduling`,
        {
          method: 'POST',
          headers: {
            'apikey': this.supabaseAnonKey,
            'Authorization': `Bearer ${this.supabaseAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to load slots: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Flatten all slots from all employees
      const allSlots = [];
      Object.values(data.suggestions || {}).forEach(employeeData => {
        (employeeData.available_slots || []).forEach(slot => {
          allSlots.push({
            ...slot,
            employee_id: employeeData.employee_id,
            start_time: new Date(slot.start_time),
            end_time: new Date(slot.end_time)
          });
        });
      });
      
      // Sort by date/time
      allSlots.sort((a, b) => a.start_time - b.start_time);
      
      this.availableSlots = allSlots;
      
      if (allSlots.length > 0) {
        this.earliestSlot = allSlots[0];
      } else {
        this.error = 'No available time slots found. Please contact us to schedule.';
      }
      
      this.filterSlotsByWeek(this.weekFilter);
    } catch (err) {
      console.error('Error loading slots:', err);
      this.error = 'Unable to load available times. Please try again or contact us.';
    } finally {
      this.loading = false;
      this.render();
    }
  }
  
  filterSlotsByWeek(offset) {
    this.weekFilter = offset;
    this.showCustomRange = false;
    
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + (offset * 7));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    
    this.filteredSlots = this.availableSlots.filter(slot => {
      return slot.start_time >= startOfWeek && slot.start_time < endOfWeek;
    });
    
    this.render();
  }
  
  filterByCustomRange(startDateStr, endDateStr) {
    if (!startDateStr || !endDateStr) {
      alert('Please select both start and end dates');
      return;
    }
    
    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDateStr);
    end.setHours(23, 59, 59, 999);
    
    this.filteredSlots = this.availableSlots.filter(slot => {
      return slot.start_time >= start && slot.start_time <= end;
    });
    
    this.showCustomRange = false;
    this.render();
  }
  
  selectSlot(slot) {
    this.selectedSlot = slot;
    this.onSlotSelected(slot);
    this.render();
  }

  selectSlotById(slotId) {
    const slot = this[slotId];
    if (slot) {
      this.selectSlot(slot);
    }
  }
  
  autoSchedule() {
    if (this.earliestSlot) {
      this.selectedSlot = this.earliestSlot;
      this.onAutoSchedule(this.earliestSlot);
      this.render();
    }
  }
  
  formatSlotDateTime(date) {
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${dateStr} at ${timeStr}`;
  }
  
  formatSlotTime(date) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  
  groupSlotsByDay() {
    const grouped = {};
    this.filteredSlots.forEach(slot => {
      const dayKey = slot.start_time.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(slot);
    });
    return grouped;
  }
  
  render() {
    if (!this.container) return;
    
    if (this.loading) {
      this.container.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
          <div style="border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; width: 3rem; height: 3rem; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
          <p style="color: #666;">Loading available times...</p>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;
      return;
    }
    
    if (this.error) {
      this.container.innerHTML = `
        <div style="background: #fee; border: 2px solid #f88; color: #c33; padding: 1.5rem; border-radius: 0.5rem;">
          ${this.error}
        </div>
      `;
      return;
    }
    
    const groupedSlots = this.groupSlotsByDay();
    
    let html = '<div class="scheduling-widget">';
    
    // Auto-Schedule ASAP Button
    if (this.showAutoSchedule && this.earliestSlot) {
      html += `
        <div style="margin-bottom: 1.5rem; padding: 1rem; background: linear-gradient(to right, #ede9fe, #ddd6fe); border-radius: 0.5rem; border: 1px solid #c4b5fd;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <svg style="width: 1.5rem; height: 1.5rem; color: #7c3aed;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
              </svg>
              <div>
                <p style="font-weight: 600; color: #111; margin: 0;">Auto-Schedule ASAP</p>
                <p style="font-size: 0.875rem; color: #666; margin: 0;">Next available: ${this.formatSlotDateTime(this.earliestSlot.start_time)}</p>
              </div>
            </div>
            <button 
              onclick="window.schedulingWidget.autoSchedule()"
              style="padding: 0.5rem 1rem; background: #7c3aed; color: white; border: none; border-radius: 0.5rem; font-weight: 500; cursor: pointer; transition: background 0.2s;"
              onmouseover="this.style.background='#6d28d9'"
              onmouseout="this.style.background='#7c3aed'"
            >
              Schedule Now
            </button>
          </div>
        </div>
      `;
    }
    
    // Week Filters
    html += `
      <div style="margin-bottom: 1.5rem;">
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
          <button 
            onclick="window.schedulingWidget.filterSlotsByWeek(0)"
            style="padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 500; border: none; cursor: pointer; ${this.weekFilter === 0 && !this.showCustomRange ? 'background: #7c3aed; color: white;' : 'background: #f3f4f6; color: #374151;'}"
          >
            This Week
          </button>
          <button 
            onclick="window.schedulingWidget.filterSlotsByWeek(1)"
            style="padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 500; border: none; cursor: pointer; ${this.weekFilter === 1 && !this.showCustomRange ? 'background: #7c3aed; color: white;' : 'background: #f3f4f6; color: #374151;'}"
          >
            Next Week
          </button>
          <button 
            onclick="window.schedulingWidget.filterSlotsByWeek(2)"
            style="padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 500; border: none; cursor: pointer; ${this.weekFilter === 2 && !this.showCustomRange ? 'background: #7c3aed; color: white;' : 'background: #f3f4f6; color: #374151;'}"
          >
            2 Weeks Out
          </button>
          <button 
            onclick="window.schedulingWidget.showCustomRange = true; window.schedulingWidget.render();"
            style="padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 500; border: none; cursor: pointer; ${this.showCustomRange ? 'background: #7c3aed; color: white;' : 'background: #f3f4f6; color: #374151;'}"
          >
            Custom Range
          </button>
        </div>
    `;
    
    // Custom Date Range Picker
    if (this.showCustomRange) {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDays = new Date();
      thirtyDays.setDate(thirtyDays.getDate() + 30);
      const thirtyDaysStr = thirtyDays.toISOString().split('T')[0];
      
      html += `
        <div style="background: #f9fafb; border-radius: 0.5rem; padding: 1rem; border: 1px solid #e5e7eb;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
            <div>
              <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem;">Start Date</label>
              <input type="date" id="custom-start-date" value="${today}" style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem;">
            </div>
            <div>
              <label style="display: block; font-size: 0.875rem; font-weight: 500; color: #374151; margin-bottom: 0.25rem;">End Date</label>
              <input type="date" id="custom-end-date" value="${thirtyDaysStr}" style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem;">
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button 
              onclick="window.schedulingWidget.filterByCustomRange(document.getElementById('custom-start-date').value, document.getElementById('custom-end-date').value)"
              style="padding: 0.5rem 1rem; background: #7c3aed; color: white; border: none; border-radius: 0.5rem; font-weight: 500; cursor: pointer;"
            >
              Apply Range
            </button>
            <button 
              onclick="window.schedulingWidget.filterSlotsByWeek(0)"
              style="padding: 0.5rem 1rem; background: #e5e7eb; color: #374151; border: none; border-radius: 0.5rem; font-weight: 500; cursor: pointer;"
            >
              Cancel
            </button>
          </div>
        </div>
      `;
    }
    
    html += '</div>'; // Close week filters div
    
    // Available Slots Grouped by Day
    html += '<div style="display: flex; flex-direction: column; gap: 1.5rem;">';
    
    if (Object.keys(groupedSlots).length === 0) {
      html += `
        <div style="text-align: center; padding: 2rem; color: #6b7280;">
          No available slots for this time period. Try a different week.
        </div>
      `;
    } else {
      Object.entries(groupedSlots).forEach(([day, slots]) => {
        html += `
          <div style="border: 1px solid #e5e7eb; border-radius: 0.5rem; overflow: hidden;">
            <div style="background: #f9fafb; padding: 0.75rem 1rem; border-bottom: 1px solid #e5e7eb;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <svg style="width: 1.25rem; height: 1.25rem; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <h3 style="font-weight: 600; color: #111; margin: 0;">${day}</h3>
                <span style="font-size: 0.875rem; color: #6b7280;">(${slots.length} available)</span>
              </div>
            </div>
            <div style="padding: 1rem; display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.75rem;">
        `;
        
        slots.forEach((slot, idx) => {
          const isSelected = this.selectedSlot &&
            this.selectedSlot.start_time.getTime() === slot.start_time.getTime() &&
            this.selectedSlot.employee_id === slot.employee_id;

          // Store slot in a data attribute for easy retrieval
          const slotId = `slot-${slot.start_time.getTime()}-${slot.employee_id}`;
          this[slotId] = slot; // Store on instance

          html += `
            <button
              onclick="window.schedulingWidget.selectSlotById('${slotId}')"
              style="padding: 0.75rem 1rem; border-radius: 0.5rem; border: 2px solid ${isSelected ? '#7c3aed' : '#e5e7eb'}; background: ${isSelected ? '#ede9fe' : 'white'}; color: ${isSelected ? '#5b21b6' : '#374151'}; cursor: pointer; transition: all 0.2s; font-weight: ${isSelected ? '600' : '400'};"
              onmouseover="if (!${isSelected}) { this.style.borderColor='#c4b5fd'; this.style.background='#faf5ff'; }"
              onmouseout="if (!${isSelected}) { this.style.borderColor='#e5e7eb'; this.style.background='white'; }"
            >
              <div style="display: flex; align-items: center; justify-content: center; gap: 0.25rem;">
                <svg style="width: 1rem; height: 1rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span style="font-size: 0.875rem;">${this.formatSlotTime(slot.start_time)}</span>
              </div>
            </button>
          `;
        });
        
        html += `
            </div>
          </div>
        `;
      });
    }
    
    html += '</div>'; // Close slots container
    html += '</div>'; // Close widget
    
    this.container.innerHTML = html;
    
    // Store reference globally for onclick handlers
    window.schedulingWidget = this;
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SchedulingWidget;
}

