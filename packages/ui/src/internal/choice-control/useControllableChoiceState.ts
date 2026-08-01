import { useState } from "react";

export function useControllableChoiceState<Value>(
  value: Value | undefined,
  defaultValue: Value
): readonly [Value, (nextValue: Value) => void] {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const controlled = value !== undefined;

  return [controlled ? value : uncontrolledValue, (nextValue: Value) => {
    if (!controlled) setUncontrolledValue(nextValue);
  }] as const;
}
