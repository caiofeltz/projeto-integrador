function nowIso() {
  return new Date().toISOString();
}

function logSecurityEvent(event, details = {}) {
  const payload = {
    ts: nowIso(),
    type: 'security',
    event,
    ...details,
  };
  console.warn('[audit]', JSON.stringify(payload));
}

function logErrorEvent(event, details = {}) {
  const payload = {
    ts: nowIso(),
    type: 'error',
    event,
    ...details,
  };
  console.error('[audit]', JSON.stringify(payload));
}

module.exports = {
  logSecurityEvent,
  logErrorEvent,
};
