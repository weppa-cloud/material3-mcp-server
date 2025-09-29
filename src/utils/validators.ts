export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

export function isValidComponentName(name: string): boolean {
  return /^[a-z][a-z0-9-]*$/.test(name);
}

export function sanitizeString(input: string): string {
  return input.replace(/[<>\"'`]/g, '');
}