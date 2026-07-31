// Shared by ProfileEditForm.tsx (inline errors before submit) and
// /api/settings/profile/route.ts (authoritative check) so both sides agree on
// the same rules and the same wording — never validate only on one side.

// Mirrors provisionProfile.ts's slugify() output shape (lowercase
// letters/digits/hyphens, no leading/trailing/double hyphens) so a
// self-picked username can never collide with that shape's assumptions.
const USERNAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const USERNAME_MIN = 3;
const USERNAME_MAX = 24;
const FULL_NAME_MAX = 80;
const BIO_MAX = 280;

export type ProfileFormInput = {
  fullName: string;
  username: string;
  bio: string;
  avatarUrl: string;
};

export type ProfileFieldErrors = Partial<Record<keyof ProfileFormInput, string>>;

export function validateUsername(value: string): string | undefined {
  if (value.length < USERNAME_MIN || value.length > USERNAME_MAX) {
    return `Username must be ${USERNAME_MIN}-${USERNAME_MAX} characters.`;
  }
  if (!USERNAME_RE.test(value)) {
    return "Lowercase letters, numbers, and single hyphens only — no leading, trailing, or double hyphens.";
  }
  return undefined;
}

export function validateFullName(value: string): string | undefined {
  if (value.trim().length === 0) return "Full name is required.";
  if (value.length > FULL_NAME_MAX) return `Full name must be ${FULL_NAME_MAX} characters or fewer.`;
  return undefined;
}

export function validateBio(value: string): string | undefined {
  if (value.length > BIO_MAX) return `Bio must be ${BIO_MAX} characters or fewer.`;
  return undefined;
}

export function validateAvatarUrl(value: string): string | undefined {
  if (value.length === 0) return undefined;
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return "Enter a valid URL (starting with https://).";
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return "Enter a valid URL (starting with https://).";
  }
  return undefined;
}

export function validateProfileInput(input: ProfileFormInput): ProfileFieldErrors {
  const errors: ProfileFieldErrors = {};
  const fullNameError = validateFullName(input.fullName);
  const usernameError = validateUsername(input.username);
  const bioError = validateBio(input.bio);
  const avatarUrlError = validateAvatarUrl(input.avatarUrl);
  if (fullNameError) errors.fullName = fullNameError;
  if (usernameError) errors.username = usernameError;
  if (bioError) errors.bio = bioError;
  if (avatarUrlError) errors.avatarUrl = avatarUrlError;
  return errors;
}
