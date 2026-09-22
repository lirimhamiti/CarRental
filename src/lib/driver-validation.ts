export interface DriverIdentity {
  firstName: string;
  lastName: string;
  birthDate: string;
  passportNumber?: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  licenceNumber?: string;
  licenceIssueDate?: string;
  licenceExpiryDate?: string;
}

// A driver needs a name, a birth date, and at least one of passport /
// driving licence — with that document's own issue and expiry dates.
export function isDriverValid(d: DriverIdentity): boolean {
  if (!d.firstName?.trim() || !d.lastName?.trim() || !d.birthDate) return false;
  const hasPassport = Boolean(d.passportNumber?.trim());
  const hasLicence = Boolean(d.licenceNumber?.trim());
  if (!hasPassport && !hasLicence) return false;
  if (hasPassport && (!d.passportIssueDate || !d.passportExpiryDate)) return false;
  if (hasLicence && (!d.licenceIssueDate || !d.licenceExpiryDate)) return false;
  return true;
}
