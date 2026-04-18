function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeCpf(cpf) {
  return String(cpf || '').replace(/\D/g, '');
}

function isValidCpf(cpf) {
  const value = normalizeCpf(cpf);
  if (value.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(value)) return false;

  const calcDigit = (base, factor) => {
    let total = 0;
    for (let i = 0; i < base.length; i += 1) {
      total += Number(base[i]) * (factor - i);
    }
    const mod = total % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const d1 = calcDigit(value.slice(0, 9), 10);
  const d2 = calcDigit(value.slice(0, 10), 11);

  return d1 === Number(value[9]) && d2 === Number(value[10]);
}

function assertRequiredFields(payload, fields) {
  const missing = fields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || String(value).trim() === '';
  });
  return missing;
}

module.exports = {
  isValidEmail,
  isValidCpf,
  normalizeCpf,
  assertRequiredFields,
};
