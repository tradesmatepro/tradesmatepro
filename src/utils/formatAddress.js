// Shared address formatting utilities
// Ensures we don't duplicate city/state/zip when street already contains them

export function formatAddressSafe(obj = {}) {
  const street = (obj.street_address || obj.address_line_1 || '').trim();
  const city = (obj.city || obj.billing_city || '').trim();
  const state = (obj.state || obj.billing_state || '').trim();
  const zip = (obj.postal_code || obj.zip_code || obj.billing_zip_code || '').trim();

  if (!street && !city && !state && !zip) return '';

  const sLower = street.toLowerCase();
  const parts = [];
  if (street) parts.push(street);
  if (city && !sLower.includes(city.toLowerCase())) parts.push(city);
  if (state && !sLower.includes(state.toLowerCase())) parts.push(state);
  if (zip && !street.includes(zip)) parts.push(zip);
  return parts.filter(Boolean).join(', ');
}

// Optional: return two display lines [line1, line2] for UIs that want split
export function splitAddressLines(obj = {}) {
  const street = (obj.street_address || obj.address_line_1 || '').trim();
  const city = (obj.city || obj.billing_city || '').trim();
  const state = (obj.state || obj.billing_state || '').trim();
  const zip = (obj.postal_code || obj.zip_code || obj.billing_zip_code || '').trim();

  const sLower = street.toLowerCase();
  const secondLine = [city, state, zip].filter(Boolean).join(', ');
  const showSecond = Boolean(secondLine) && !(
    (city && sLower.includes(city.toLowerCase())) ||
    (state && sLower.includes(state.toLowerCase())) ||
    (zip && street.includes(zip))
  );

  return [street, showSecond ? secondLine : ''];
}

