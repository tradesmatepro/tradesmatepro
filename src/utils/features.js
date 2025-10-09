// Centralized feature flags (env-driven booleans)
const flag = (k, d=false) => (String(process.env[`REACT_APP_${k}`]||'').toLowerCase()==='true') || d;

export const FEATURES = {
  MESSAGING: flag('FEATURE_MESSAGING', false),
  INTEGRATIONS: flag('FEATURE_INTEGRATIONS', false),
  INVOICING: flag('FEATURE_INVOICING', true),
  REPORTS: flag('FEATURE_REPORTS', true)
};

