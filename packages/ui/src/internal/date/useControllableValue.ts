import { useCallback, useState } from "react";

export function useControllableValue<T>(
  controlled: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void
): [T, (value: T) => void] {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const value = controlled === undefined ? uncontrolled : controlled;
  const setValue = useCallback((next: T) => {
    if (controlled === undefined) setUncontrolled(next);
    onChange?.(next);
  }, [controlled, onChange]);
  return [value, setValue];
}
