export type ClassValue =
  | string
  | number
  | null
  | false
  | undefined
  | ClassValue[]
  | Record<string, boolean>;

function toClass(input: ClassValue): string[] {
  if (!input) return [];
  if (typeof input === "string" || typeof input === "number") return [String(input)];
  if (Array.isArray(input)) return input.flatMap(toClass);
  if (typeof input === "object") {
    return Object.entries(input)
      .filter(([, v]) => Boolean(v))
      .map(([k]) => k);
  }
  return [];
}

export function cn(...inputs: ClassValue[]): string {
  return inputs.flatMap(toClass).join(" ");
}
