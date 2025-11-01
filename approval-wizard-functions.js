// =====================================================
// APPROVAL WIZARD FUNCTIONS FOR UNIFIED CUSTOMER PORTAL
// These functions will be integrated into customer-portal-new.html
// =====================================================

// Main approval function - starts the wizard
async function approveQuote(workOrderId) {
  // Load the work order data
  const { data: wo, error } = await supabase
    .from('work_orders')
    .select('*, customers(*)')
    .eq('id', workOrderId)
    .single();
  
  if (error || !wo) {
    alert('Error loading quote');
    return;
  }
  
  quoteData = wo;
  
  // Load company settings
  try {
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', wo.company_id)
      .single();
    
    companySettings = {
      require_signature_on_approval: true,
      require_terms_acceptance: true,
      require_deposit_on_approval: company?.require_deposit_on_approval || false,
      allow_customer_scheduling: company?.allow_customer_scheduling || true,
      terms_and_conditions_text: company?.terms_and_conditions_text || 'By accepting this quote, you agree to the terms and conditions.',
      deposit_type: company?.deposit_type || 'percentage',
      default_deposit_percentage: company?.default_deposit_percentage || 25,
      default_deposit_amount: company?.default_deposit_amount || 0,
      business_hours_start: company?.business_hours_start,
      business_hours_end: company?.business_hours_end,
      working_days: company?.working_days
    };
  } catch (err) {
    console.error('Error loading company settings:', err);
  }
  
  // Determine wizard steps
  const schedulingMode = wo.scheduling_mode || 'customer_choice';
  const allowScheduling = schedulingMode !== 'company_schedules';
  const depositRequired = wo.deposit_required !== undefined 
    ? wo.deposit_required 
    : (companySettings?.require_deposit_on_approval || false);
  
  wizardSteps = ['review'];
  
  if (depositRequired) {
    wizardSteps.push('deposit');
  }
  
  if (allowScheduling && (companySettings?.allow_customer_scheduling || schedulingMode === 'customer_choice')) {
    wizardSteps.push('schedule');
  }
  
  wizardSteps.push('confirmation');
  
  // If only review + confirmation, just approve immediately
  if (wizardSteps.length === 2) {
    if (!confirm('Are you sure you want to approve this quote?')) return;
    await finalizeApproval();
    return;
  }
  
  // Show wizard
  currentStep = 'review';
  showWizard();
}

// Show the wizard modal
function showWizard() {
  const modal = document.getElementById('wizard-modal');
  modal.style.display = 'flex';
  updateWizardUI();
}

// Close wizard
function closeWizard() {
  document.getElementById('wizard-modal').style.display = 'none';
}

// Update wizard UI
function updateWizardUI() {
  // Update progress bar
  const progressHtml = wizardSteps.map((step, index) => {
    const currentIndex = wizardSteps.indexOf(currentStep);
    let className = 'wizard-step';
    if (index < currentIndex) className += ' completed';
    if (index === currentIndex) className += ' active';
    return `<div class="${className}">${getStepName(step)}</div>`;
  }).join('');
  
  document.getElementById('wizard-progress').innerHTML = progressHtml;
  
  // Update content
  document.getElementById('wizard-content').innerHTML = getStepContent(currentStep);
  
  // Run step-specific initialization
  initializeStep(currentStep);
}

// Get step display name
function getStepName(step) {
  const names = {
    review: 'Review',
    deposit: 'Deposit',
    schedule: 'Schedule',
    confirmation: 'Complete'
  };
  return names[step] || step;
}

// Get step content HTML
function getStepContent(step) {
  switch (step) {
    case 'review':
      return getReviewStepContent();
    case 'deposit':
      return getDepositStepContent();
    case 'schedule':
      return getScheduleStepContent();
    case 'confirmation':
      return getConfirmationStepContent();
    default:
      return '<p>Unknown step</p>';
  }
}

// Review step content
function getReviewStepContent() {
  const nextSteps = wizardSteps.filter(s => s !== 'review' && s !== 'confirmation');
  return `
    <h2>📋 Review & Approve Quote</h2>
    <p style="margin: 20px 0;">You're about to approve this quote for <strong>$${quoteData.total_amount.toFixed(2)}</strong></p>
    
    ${nextSteps.length > 0 ? `
      <div style="background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0;">
        <strong>What you'll do next:</strong>
        <ul style="margin: 10px 0 0 20px;">
          ${nextSteps.map(s => `<li>${getStepDescription(s)}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
    
    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <div style="margin-bottom: 12px; font-weight: 600;">Consent & Terms</div>
      <label style="display: flex; align-items: center; margin: 10px 0; cursor: pointer;">
        <input type="checkbox" id="review-consent" style="margin-right: 10px; width: 18px; height: 18px;">
        <span>I approve this quote and authorize the work.</span>
      </label>
      <div style="max-height: 240px; overflow-y: auto; border: 1px solid #ddd; padding: 14px; margin: 12px 0; background: #fff; border-radius: 6px;">
        ${(companySettings.terms_and_conditions_text || '').replace(/\n/g, '<br>')}
      </div>
      <label style="display: flex; align-items: center; margin: 10px 0; cursor: pointer;">
        <input type="checkbox" id="review-terms" style="margin-right: 10px; width: 18px; height: 18px;">
        <span>I have read and agree to the terms and conditions.</span>
      </label>
    </div>
    
    <div class="wizard-actions">
      <button class="btn btn-approve" id="review-continue-btn" onclick="nextWizardStep(0)" disabled>
        Continue
      </button>
      <button class="btn btn-secondary" onclick="closeWizard()">
        Cancel
      </button>
    </div>
  `;
}

function getStepDescription(step) {
  const descriptions = {
    'deposit': 'Pay deposit',
    'schedule': 'Schedule your service',
  };
  return descriptions[step] || step;
}

// Deposit step content
function getDepositStepContent() {
  const depositAmount = companySettings.deposit_type === 'percentage'
    ? (quoteData.total_amount * (companySettings.default_deposit_percentage / 100))
    : companySettings.default_deposit_amount;
  
  const allowedMethods = quoteData.allowed_payment_methods || ['online', 'cash', 'check'];
  
  const paymentMethods = [
    { value: 'online', icon: '💳', label: 'Pay Online Now', desc: 'Secure payment via credit/debit card' },
    { value: 'cash', icon: '💵', label: 'Cash (Pay on arrival)', desc: 'Pay cash when technician arrives' },
    { value: 'check', icon: '🏦', label: 'Check (Pay on arrival)', desc: 'Pay by check when technician arrives' },
    { value: 'prepaid', icon: '✅', label: 'Already Paid', desc: "I've already paid the deposit" }
  ];
  
  const availableMethods = paymentMethods.filter(m => allowedMethods.includes(m.value) || m.value === 'prepaid');
  
  let methodsHtml = '';
  availableMethods.forEach((method, index) => {
    methodsHtml += `
      <label style="display: flex; align-items: center; padding: 12px; border: 2px solid #e5e7eb; border-radius: 6px; margin-bottom: 10px; cursor: pointer; background: white;">
        <input type="radio" name="deposit-method" value="${method.value}" ${index === 0 ? 'checked' : ''} style="margin-right: 10px; width: 18px; height: 18px;">
        <div>
          <div style="font-weight: 500;">${method.icon} ${method.label}</div>
          <div style="font-size: 12px; color: #6b7280;">${method.desc}</div>
        </div>
      </label>
    `;
  });
  
  return `
    <h2>💳 Deposit Required</h2>
    <p style="margin: 20px 0;">A deposit of <strong>$${depositAmount.toFixed(2)}</strong> is required to proceed.</p>
    
    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <div style="font-weight: 600; margin-bottom: 12px;">How will you pay the deposit?</div>
      ${methodsHtml}
    </div>
    
    <div id="stripe-payment-element" style="margin: 20px 0; display: none;"></div>
    
    <div class="wizard-actions">
      <button class="btn btn-approve" onclick="processDeposit()" id="deposit-continue-btn">Continue</button>
      <button class="btn btn-secondary" onclick="previousWizardStep()">Back</button>
    </div>
  `;
}

// Schedule step content
function getScheduleStepContent() {
  return `
    <h2>📅 Schedule Your Service</h2>
    <div id="scheduling-widget-container"></div>
    
    <div class="wizard-actions" id="schedule-actions" style="display: none; margin-top: 20px;">
      <button class="btn btn-approve" onclick="confirmSchedule()" id="confirm-schedule-btn" disabled>
        Confirm Selected Time
      </button>
      <button class="btn btn-secondary" onclick="previousWizardStep()">Back</button>
    </div>
    
    <div style="margin-top: 30px; padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; text-align: center;">
      <p style="margin-bottom: 12px; color: #6b7280;">Don't have a preferred time?</p>
      <button onclick="skipScheduling()" class="btn btn-secondary" style="background: #6b7280; color: white;">
        Skip - Let Company Schedule
      </button>
      <p style="margin-top: 8px; font-size: 12px; color: #9ca3af;">We'll call you to schedule a convenient time</p>
    </div>
  `;
}

// Confirmation step content
function getConfirmationStepContent() {
  let scheduleInfo = '';
  
  if (approvalData.scheduledTime) {
    const scheduledDate = new Date(approvalData.scheduledTime.start_time);
    const dateTimeStr = formatSlotDateTime(scheduledDate);
    
    scheduleInfo = `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">📅 Your Service is Scheduled</div>
        <div style="font-size: 24px; font-weight: 700;">${dateTimeStr}</div>
      </div>
    `;
  } else if (approvalData.skipScheduling) {
    scheduleInfo = `
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <div style="font-size: 18px; font-weight: 600; margin-bottom: 10px;">📞 We'll Contact You</div>
        <div style="font-size: 16px;">Our team will call you within 1 business day to schedule a convenient time.</div>
      </div>
    `;
  }
  
  return `
    <h2>🎉 All Set!</h2>
    <p style="margin: 20px 0; font-size: 18px;">Your quote has been approved successfully!</p>
    
    ${scheduleInfo}
    
    <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; margin: 20px 0;">
      <strong>What happens next?</strong>
      <ul style="margin: 10px 0 0 20px;">
        <li>We'll send you a confirmation email</li>
        ${approvalData.scheduledTime ? '<li>Our technician will arrive at the scheduled time</li>' : '<li>Our team will contact you to schedule your service</li>'}
        <li>We'll get started on your project!</li>
      </ul>
    </div>
    
    <div class="wizard-actions">
      <button class="btn btn-approve" onclick="finalizeApproval()">Confirm & Finish</button>
    </div>
  `;
}

