export const validators = {
  name: (v) =>
    v.trim().length >= 20 && v.trim().length <= 60 ? '' : 'Name must be 20-60 characters',
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email'),
  address: (v) =>
    v.trim() && v.length <= 400 ? '' : 'Address is required (max 400 characters)',
  password: (v) =>
    /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/.test(v)
      ? ''
      : 'Password must be 8-16 characters with one uppercase letter and one special character',
};

export function validate(values, fields) {
  const errors = {};
  for (const f of fields) {
    const msg = validators[f](values[f] ?? '');
    if (msg) errors[f] = msg;
  }
  return errors;
}