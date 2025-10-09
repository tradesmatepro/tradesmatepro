// Phase 2: Auth Validator
export function authValidator(state, api, ui) {
  const user = state.auth?.user || null;
  const results = [];

  if (!user) {
    return [{
      id: "AUTH",
      title: "Auth State",
      pass: false,
      errors: ["❌ No user in auth state"]
    }];
  }

  if (!user.email) {
    return [{
      id: "AUTH",
      title: "Auth State",
      pass: false,
      errors: ["❌ User missing email"]
    }];
  }

  return [{
    id: "AUTH",
    title: "Auth State",
    pass: true,
    errors: []
  }];
}
