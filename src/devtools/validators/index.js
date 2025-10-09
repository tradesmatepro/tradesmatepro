// Phase 2: Validator Registry
import { runValidator } from "./validatorBase";
import { marketplaceValidator } from "./marketplaceValidator";
import { quoteFlowValidator } from "./quoteFlowValidator";
import { invoiceValidator } from "./invoiceValidator";
import { authValidator } from "./authValidator";
import { systemHealthValidator } from "./systemHealthValidator";

export function runAllValidators(state, api, ui) {
  const validators = [
    { name: "Marketplace", fn: marketplaceValidator },
    { name: "Quotes", fn: quoteFlowValidator },
    { name: "Invoices", fn: invoiceValidator },
    { name: "Auth", fn: authValidator },
    { name: "SystemHealth", fn: systemHealthValidator },
  ];

  return validators.map(v => runValidator(v.name, v.fn, state, api, ui));
}
