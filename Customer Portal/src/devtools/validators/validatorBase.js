// Phase 2: Base validator interface
export function runValidator(name, fn, state, api, ui) {
  try {
    const results = fn(state, api, ui) || [];
    return {
      validator: name,
      results,
      pass: results.every(r => r.pass),
    };
  } catch (err) {
    return {
      validator: name,
      results: [{
        id: "INTERNAL",
        title: "Validator Error",
        pass: false,
        errors: [err.message]
      }],
      pass: false,
    };
  }
}
