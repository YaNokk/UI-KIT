export type FieldSize = "sm" | "md" | "lg";

export function mergeIds(...values: Array<string | undefined>) {
  return [...new Set(
    values
      .flatMap((value) => value?.trim().split(/\s+/) ?? [])
      .filter(Boolean)
  )].join(" ") || undefined;
}
