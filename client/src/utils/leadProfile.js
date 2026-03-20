const STORAGE_KEY = 'mintu_bro_lead_profile';

const hasRequiredLeadFields = (profile) =>
  Boolean(profile?.studentName && profile?.phone && profile?.email);

export const getLeadProfile = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed) return null;
    if (parsed.skippedAt) return parsed;
    if (!hasRequiredLeadFields(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const getCompleteLeadProfile = () => {
  const profile = getLeadProfile();
  return hasRequiredLeadFields(profile) ? profile : null;
};

export const setLeadProfile = (profile) => {
  const payload = { ...profile, skippedAt: null, savedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
};

export const skipLeadProfile = () => {
  const payload = { skippedAt: new Date().toISOString(), savedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
};

export const clearLeadProfile = () => {
  localStorage.removeItem(STORAGE_KEY);
};
