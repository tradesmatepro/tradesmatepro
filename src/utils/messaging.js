const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.REACT_APP_SUPABASE_SERVICE_KEY;

/**
 * Send a system message to a user
 * @param {string} receiverId - The ID of the user to receive the message
 * @param {string} message - The message content
 * @param {string} companyId - The company ID
 * @param {string} jobId - Optional job ID for context
 * @param {object} metadata - Optional metadata object
 */
export const sendSystemMessage = async (receiverId, message, companyId, jobId = null, metadata = null) => {
  try {
    const systemMessage = {
      sender_id: null, // System messages don't have a sender
      receiver_id: receiverId,
      message: message,
      company_id: companyId,
      message_type: 'system',
      status: 'sent',
      sent_at: new Date().toISOString(),
      job_id: jobId,
      metadata: metadata
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(systemMessage)
    });

    if (!response.ok) {
      throw new Error('Failed to send system message');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending system message:', error);
    throw error;
  }
};

/**
 * Send timesheet approval notification
 * @param {string} employeeId - The employee who submitted the timesheet
 * @param {string} companyId - The company ID
 * @param {string} workDate - The work date of the timesheet
 * @param {string} approverName - Name of the person who approved
 */
export const sendTimesheetApprovalMessage = async (employeeId, companyId, workDate, approverName) => {
  const message = `Your timesheet for ${new Date(workDate).toLocaleDateString()} has been approved by ${approverName}.`;
  
  return sendSystemMessage(
    employeeId,
    message,
    companyId,
    null,
    {
      type: 'timesheet_approval',
      work_date: workDate,
      approver: approverName
    }
  );
};

/**
 * Send timesheet denial notification
 * @param {string} employeeId - The employee who submitted the timesheet
 * @param {string} companyId - The company ID
 * @param {string} workDate - The work date of the timesheet
 * @param {string} denierName - Name of the person who denied
 * @param {string} reason - Reason for denial
 */
export const sendTimesheetDenialMessage = async (employeeId, companyId, workDate, denierName, reason) => {
  const message = `Your timesheet for ${new Date(workDate).toLocaleDateString()} has been denied by ${denierName}. Reason: ${reason}`;
  
  return sendSystemMessage(
    employeeId,
    message,
    companyId,
    null,
    {
      type: 'timesheet_denial',
      work_date: workDate,
      denier: denierName,
      reason: reason
    }
  );
};

/**
 * Send job assignment notification
 * @param {string} employeeId - The employee assigned to the job
 * @param {string} companyId - The company ID
 * @param {string} jobId - The job ID
 * @param {string} jobTitle - The job title
 * @param {string} assignerName - Name of the person who assigned the job
 */
export const sendJobAssignmentMessage = async (employeeId, companyId, jobId, jobTitle, assignerName) => {
  const message = `You have been assigned to a new job: "${jobTitle}" by ${assignerName}.`;
  
  return sendSystemMessage(
    employeeId,
    message,
    companyId,
    jobId,
    {
      type: 'job_assignment',
      job_title: jobTitle,
      assigner: assignerName
    }
  );
};

/**
 * Send job status update notification
 * @param {string} employeeId - The employee to notify
 * @param {string} companyId - The company ID
 * @param {string} jobId - The job ID
 * @param {string} jobTitle - The job title
 * @param {string} newStatus - The new job status
 * @param {string} updaterName - Name of the person who updated the status
 */
export const sendJobStatusUpdateMessage = async (employeeId, companyId, jobId, jobTitle, newStatus, updaterName) => {
  const message = `Job "${jobTitle}" status has been updated to "${newStatus}" by ${updaterName}.`;
  
  return sendSystemMessage(
    employeeId,
    message,
    companyId,
    jobId,
    {
      type: 'job_status_update',
      job_title: jobTitle,
      new_status: newStatus,
      updater: updaterName
    }
  );
};

/**
 * Send general notification
 * @param {string} employeeId - The employee to notify
 * @param {string} companyId - The company ID
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {object} metadata - Optional metadata
 */
export const sendGeneralNotification = async (employeeId, companyId, title, message, metadata = null) => {
  const fullMessage = `${title}: ${message}`;
  
  return sendSystemMessage(
    employeeId,
    fullMessage,
    companyId,
    null,
    {
      type: 'general_notification',
      title: title,
      ...metadata
    }
  );
};

/**
 * Send bulk system message to multiple users
 * @param {string[]} receiverIds - Array of user IDs to receive the message
 * @param {string} message - The message content
 * @param {string} companyId - The company ID
 * @param {object} metadata - Optional metadata
 */
export const sendBulkSystemMessage = async (receiverIds, message, companyId, metadata = null) => {
  try {
    const promises = receiverIds.map(receiverId => 
      sendSystemMessage(receiverId, message, companyId, null, metadata)
    );
    
    return await Promise.all(promises);
  } catch (error) {
    console.error('Error sending bulk system messages:', error);
    throw error;
  }
};

/**
 * Send company-wide announcement
 * @param {string[]} allEmployeeIds - Array of all employee IDs in the company
 * @param {string} companyId - The company ID
 * @param {string} title - The announcement title
 * @param {string} message - The announcement message
 * @param {string} senderName - Name of the person sending the announcement
 */
export const sendCompanyAnnouncement = async (allEmployeeIds, companyId, title, message, senderName) => {
  const fullMessage = `📢 Company Announcement from ${senderName}: ${title}\n\n${message}`;
  
  return sendBulkSystemMessage(
    allEmployeeIds,
    fullMessage,
    companyId,
    {
      type: 'company_announcement',
      title: title,
      sender: senderName
    }
  );
};
