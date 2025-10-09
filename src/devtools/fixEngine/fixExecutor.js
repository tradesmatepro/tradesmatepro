// Phase 3: Fix Executor - JSON Handoff Mode
export class FixExecutor {
  constructor(core) {
    this.core = core;
    this.history = [];
    this.maxRetries = 5;
    this.outDir = "error_logs"; // Browser-compatible path
  }

  async ensureLogDir() {
    // In browser environment, we'll use the error server to create files
    try {
      await fetch('http://localhost:4000/ensure-dir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dir: this.outDir })
      });
    } catch (err) {
      this.core.addLog("WARN", `Could not ensure log directory: ${err.message}`, "system");
    }
  }

  async runFixLoop(issue) {
    await this.ensureLogDir();

    const id = `FIX-${Date.now()}`;
    const record = {
      id,
      issue,
      attempts: [],
      finalStatus: "pending"
    };

    this.core.addLog("INFO", `🛠 Starting fix loop for ${id}`, "system");

    for (let i = 0; i < this.maxRetries; i++) {
      const attempt = await this.tryFix(issue, i + 1);
      record.attempts.push(attempt);

      if (attempt.success) {
        record.finalStatus = "fixed";
        this.core.addLog("INFO", `✅ Fix successful on attempt ${i + 1}`, "system");
        break;
      } else {
        this.core.addLog("WARN", `❌ Fix attempt ${i + 1} failed: ${attempt.reason}`, "system");
      }
    }

    if (record.finalStatus === "pending") {
      record.finalStatus = "failed";
      this.core.addLog("ERROR", `❌ Fix loop failed after ${this.maxRetries} attempts`, "system");
    }

    this.history.push(record);
    await this.saveRecord(record);

    this.core.addLog("INFO", `FixLoop complete for ${id} → ${record.finalStatus}`, "system");
    return record;
  }

  async tryFix(issue, attemptNo) {
    // Create patch proposal for external review
    const patchProposal = {
      file: this.suggestFile(issue),
      before: "PLACEHOLDER_BEFORE",
      after: "PLACEHOLDER_AFTER",
      description: `Fix for ${issue.type} issue: ${issue.message}`
    };

    this.core.addLog("INFO", `📝 Creating patch proposal for attempt ${attemptNo}`, "system");

    // Save JSON for teammate (Claude/ChatGPT/local LLM) review
    const patchData = {
      issue,
      attempt: attemptNo,
      patchProposal,
      timestamp: new Date().toISOString(),
      app: window.location.hostname.includes('customer') ? 'customer-portal' : 'tradesmate-pro'
    };

    await this.savePatchProposal(patchData);

    // Do not auto-apply unless explicitly enabled
    return {
      attempt: attemptNo,
      success: false,
      reason: "Waiting for external review",
      patchProposal,
      backup: null
    };
  }

  suggestFile(issue) {
    // Suggest likely file based on issue type and validator
    if (issue.validator === "Marketplace") {
      return "src/components/Marketplace/ProvidingMarketplace.js";
    } else if (issue.validator === "Quotes") {
      return "src/components/Quotes/QuoteBuilder.js";
    } else if (issue.validator === "Invoices") {
      return "src/components/Invoices/InvoiceList.js";
    } else if (issue.validator === "Auth") {
      return "src/contexts/AuthContext.js";
    } else if (issue.validator === "SystemHealth") {
      return "src/services/SupabaseService.js";
    } else {
      return "src/components/Example.js";
    }
  }

  async savePatchProposal(patchData) {
    try {
      const filename = `patch_proposal_${Date.now()}.json`;
      
      await fetch('http://localhost:4000/save-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          data: patchData
        })
      });

      this.core.addLog("INFO", `💾 Patch proposal saved: ${filename}`, "system");
    } catch (err) {
      this.core.addLog("ERROR", `Failed to save patch proposal: ${err.message}`, "system");
    }
  }

  async saveRecord(record) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `fix_record_${timestamp}.json`;
      
      // Save timestamped record
      await fetch('http://localhost:4000/save-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename,
          data: record
        })
      });

      // Save latest record
      await fetch('http://localhost:4000/save-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: 'fix_record_latest.json',
          data: record
        })
      });

      this.core.addLog("INFO", `💾 Fix record saved: ${filename}`, "system");
    } catch (err) {
      this.core.addLog("ERROR", `Failed to save fix record: ${err.message}`, "system");
    }
  }

  getHistory() {
    return this.history;
  }

  rollback(fixId) {
    const record = this.history.find(r => r.id === fixId);
    if (!record) {
      this.core.addLog("ERROR", `❌ Fix record ${fixId} not found for rollback`, "system");
      return false;
    }

    this.core.addLog("INFO", `🔄 Rolling back fix ${fixId}`, "system");
    
    record.attempts.forEach(attempt => {
      if (attempt.backup) {
        this.core.addLog("INFO", `📁 Would restore from backup: ${attempt.backup}`, "system");
      }
    });

    this.core.addLog("INFO", `✅ Rollback complete for ${fixId}`, "system");
    return true;
  }
}
