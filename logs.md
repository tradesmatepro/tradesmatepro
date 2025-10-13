quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:393 🚀 Quote Portal v2.0 - Multi-step Approval Wizard
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:394 📅 Loaded at: 2025-10-13T20:45:16.021Z
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:404 🔧 Defining SchedulingWidget class...
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:879 ✅ SchedulingWidget class defined successfully
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:880 🔍 SchedulingWidget type: function
/favicon.ico:1   GET https://www.tradesmatepro.com/favicon.ico 404 (Not Found)
[NEW] Explain Console errors by using Copilot in Edge: click
         
         to explain an error. 
        Learn more
        Don't show again
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:929 Quote loaded: {id: 'eeaa326b-0feb-464a-9bb3-1e63ad96e285', company_id: 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', work_order_number: 'Q20251011-184159874-1GM5', customer_id: 'daece991-2bc1-446f-bb48-d4eb6c429fc9', customer_address_id: null, …}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:930 🔍 DEBUG - Quote fields: {id: 'eeaa326b-0feb-464a-9bb3-1e63ad96e285', status: 'sent', total_amount: 1661.63, labor_summary: null, has_labor_summary: false, …}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:941 🔍 DEBUG - Loading company settings for: cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:955 🔍 DEBUG - Companies fetch response: {ok: true, status: 200, statusText: ''}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:963 🔍 DEBUG - Companies data: [{…}]
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:990 ✅ Company settings loaded: {business_hours: '07:00 - 18:00', working_days: Array(5), timezone: 'America/Los_Angeles', buffers: {…}}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1072 ✅ Calculated labor_summary from line items: {totalLaborHours: 16, crewSize: 2, hoursPerEmployee: 8, labor_summary: {…}}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1205 === APPROVAL WIZARD DEBUG ===
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1206 Company Settings: {require_signature_on_approval: true, require_terms_acceptance: true, require_deposit_on_approval: true, allow_customer_scheduling: true, terms_and_conditions_text: 'TERMS AND CONDITIONS\n\n1. Payment: Full payment is …y accepting this quote, you agree to these terms.', …}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1212 Adding schedule step
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1217 Total steps: (3) ['review', 'schedule', 'confirmation']
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1228 Showing wizard with steps: (3) ['review', 'schedule', 'confirmation']
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1649 🔄 nextWizardStep called, currentIndex: 0
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1661 ➡️ Moving to step: schedule index: 1
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1759 📅 Initializing scheduling widget...
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1760 🔍 Company ID: cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1764 🔍 Fetching employees...
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1783 ✅ Employees loaded: (2) [{…}, {…}]
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1800 🔍 DEBUG - Checking labor_summary: {has_labor_summary: true, labor_summary_value: {…}, labor_summary_type: 'object', quote_keys: Array(195)}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1817 ✅ Labor calculation: {crewSize: 2, hoursPerDay: 8, totalHours: 16, hoursPerEmployee: 8, durationMinutes: 480}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1830 🔍 DEBUG - About to create SchedulingWidget with:
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1831   Company ID: cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1832   Employee IDs: (2) ['f0560435-6469-481e-94c8-a408cdd6a39d', 'c959e20e-f163-4684-8639-1dc741d7a1dd']
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1833   Duration (minutes): 480
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1834   Duration (hours): 8
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1835   Company Settings: {business_hours: '07:00 - 18:00', working_days: Array(5), timezone: 'America/Los_Angeles'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1848   📊 Business hours: 660 minutes
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1849   📊 Job duration: 480 minutes
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1850   📊 Available window: 180 minutes
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1851   📊 Expected LAST slot: 10:00
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:456 🔍 DEBUG - Requesting slots: {employeeIds: Array(2), durationMinutes: 480, companyId: 'cf619000-fa5b-4aeb-ae97-a2b5eb1dae8e', startDate: '2025-10-13T20:45:25.589Z', endDate: '2026-01-11T21:45:25.589Z'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1903 ✅ Scheduling widget initialized
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:491 🔍 DEBUG - Raw slots returned (first 10): (10) [{…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}, {…}]
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:30:00 AM', end_estimated_local: '3:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '7:45:00 AM', end_estimated_local: '3:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:00:00 AM', end_estimated_local: '4:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:15:00 AM', end_estimated_local: '4:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:30:00 AM', end_estimated_local: '4:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '8:45:00 AM', end_estimated_local: '4:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:00:00 AM', end_estimated_local: '5:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:15:00 AM', end_estimated_local: '5:15:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:30:00 AM', end_estimated_local: '5:30:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '9:45:00 AM', end_estimated_local: '5:45:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:522 ✅ Keep slot (within biz hours): {start_local: '10:00:00 AM', end_estimated_local: '6:00:00 PM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:536 📊 After pruning - First day summary: {firstDay: '10/14/2025', count: 22, firstLocal: '7:30:00 AM', lastLocal: '10:00:00 AM'}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1864 📅 Slot selected: {start_time: Tue Oct 14 2025 07:30:00 GMT-0700 (Pacific Daylight Time), end_time: Tue Oct 14 2025 15:30:00 GMT-0700 (Pacific Daylight Time), duration_minutes: 480, employee_id: 'f0560435-6469-481e-94c8-a408cdd6a39d', buffer_before: 30, …}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1943 📅 Schedule confirmed: {start_time: '2025-10-14T14:30:00.000Z', end_time: '2025-10-14T22:30:00.000Z', employee_ids: Array(2), crew_size: 2, auto_scheduled: false}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1649 🔄 nextWizardStep called, currentIndex: 1
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1661 ➡️ Moving to step: confirmation index: 2
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1952 🎯 finalizeApproval called
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1958 📞 Calling approve_and_schedule_work_order RPC...
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1967 ✅ Approved & scheduled via RPC: {error: 'column "created_by_customer" of relation "schedule_events" does not exist', success: false}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:2007 🔍 DOM elements: {wizardContent: true, quoteContent: true, successDiv: true}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:2015 📋 Wizard mode - showing confirmation
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1952 🎯 finalizeApproval called
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1958 📞 Calling approve_and_schedule_work_order RPC...
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:1967 ✅ Approved & scheduled via RPC: {error: 'column "created_by_customer" of relation "schedule_events" does not exist', success: false}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:2007 🔍 DOM elements: {wizardContent: true, quoteContent: true, successDiv: true}
quote.html?id=eeaa326b-0feb-464a-9bb3-1e63ad96e285:2015 📋 Wizard mode - showing confirmation
