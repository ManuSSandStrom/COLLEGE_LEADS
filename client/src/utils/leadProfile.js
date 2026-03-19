const STORAGE_KEY = 'mintu_bro_lead_profile';

export const getLeadProfile = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.studentName || !parsed.phone || !parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const setLeadProfile = (profile) => {
  const payload = { ...profile, savedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
};

export const clearLeadProfile = () => {
  localStorage.removeItem(STORAGE_KEY);
};
