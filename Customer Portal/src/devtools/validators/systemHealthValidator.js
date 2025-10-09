// Phase 2: System Health Validator
export function systemHealthValidator(state, api, ui) {
  const health = state.systemHealth || {};
  const results = [];

  ["database", "auth", "storage", "realTime"].forEach(service => {
    if (health[service] !== "ok") {
      results.push({
        id: service,
        title: `System Check: ${service}`,
        pass: false,
        errors: [`❌ ${service} status = ${health[service]}`]
      });
    } else {
      results.push({
        id: service,
        title: `System Check: ${service}`,
        pass: true,
        errors: []
      });
    }
  });

  return results;
}
