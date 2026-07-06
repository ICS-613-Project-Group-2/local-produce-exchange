/**
 * Abbreviates a full name for display to other users.
 * "Oliver Lee" → "Oliver L."
 * "Lily Chen" → "Lily C."
 * "Kayla-Marie Torres" → "Kayla-Marie T."
 */
export function displayName(fullName: string): string {
  const parts = fullName.trim().split(" ");
  if (parts.length <= 1) return fullName;
  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0];
  return `${first} ${lastInitial}.`;
}
