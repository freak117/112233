export const USERNAME_REGEX = /^[a-zA-Z0-9_]{4,32}$/;

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

