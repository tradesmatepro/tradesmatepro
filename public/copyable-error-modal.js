// Copyable Error Modal for TradeMate Pro
// Shows errors in a modal with a textarea that can be selected and copied

window.showCopyableError = function(errorText) {
  // Remove existing modal if present
  const existing = document.getElementById('copyable-error-modal');
  if (existing) {
    existing.remove();
  }

  // Create modal overlay
  const overlay = document.createElement('div');
  overlay.id = 'copyable-error-modal';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;

  // Create modal content
  const modal = document.createElement('div');
  modal.style.cssText = `
    background: white;
    border-radius: 12px;
    padding: 24px;
    max-width: 800px;
    width: 100%;
    max-height: 80vh;
    overflow: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  `;

  // Create header
  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  `;

  const title = document.createElement('h2');
  title.textContent = '🚨 Error Details';
  title.style.cssText = `
    margin: 0;
    color: #DC2626;
    font-size: 24px;
    font-weight: bold;
  `;

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.style.cssText = `
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: #6B7280;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
  `;
  closeBtn.onmouseover = () => closeBtn.style.background = '#F3F4F6';
  closeBtn.onmouseout = () => closeBtn.style.background = 'none';
  closeBtn.onclick = () => overlay.remove();

  header.appendChild(title);
  header.appendChild(closeBtn);

  // Create textarea
  const textarea = document.createElement('textarea');
  textarea.value = errorText;
  textarea.readOnly = true;
  textarea.style.cssText = `
    width: 100%;
    min-height: 300px;
    padding: 16px;
    border: 2px solid #E5E7EB;
    border-radius: 8px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.6;
    resize: vertical;
    background: #F9FAFB;
    color: #1F2937;
    margin-bottom: 16px;
  `;

  // Auto-select text when clicked
  textarea.onclick = () => {
    textarea.select();
  };

  // Create button container
  const buttonContainer = document.createElement('div');
  buttonContainer.style.cssText = `
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  `;

  // Create copy button
  const copyBtn = document.createElement('button');
  copyBtn.textContent = '📋 Copy to Clipboard';
  copyBtn.style.cssText = `
    background: #3B82F6;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  `;
  copyBtn.onmouseover = () => copyBtn.style.background = '#2563EB';
  copyBtn.onmouseout = () => copyBtn.style.background = '#3B82F6';
  copyBtn.onclick = () => {
    textarea.select();
    document.execCommand('copy');
    copyBtn.textContent = '✅ Copied!';
    copyBtn.style.background = '#10B981';
    setTimeout(() => {
      copyBtn.textContent = '📋 Copy to Clipboard';
      copyBtn.style.background = '#3B82F6';
    }, 2000);
  };

  // Create close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.cssText = `
    background: #6B7280;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  `;
  closeButton.onmouseover = () => closeButton.style.background = '#4B5563';
  closeButton.onmouseout = () => closeButton.style.background = '#6B7280';
  closeButton.onclick = () => overlay.remove();

  buttonContainer.appendChild(copyBtn);
  buttonContainer.appendChild(closeButton);

  // Assemble modal
  modal.appendChild(header);
  modal.appendChild(textarea);
  modal.appendChild(buttonContainer);
  overlay.appendChild(modal);

  // Add to page
  document.body.appendChild(overlay);

  // Auto-select text
  setTimeout(() => textarea.select(), 100);

  // Close on escape key
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);

  // Close on overlay click (but not modal click)
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  };
};

console.log('✅ Copyable error modal loaded');

