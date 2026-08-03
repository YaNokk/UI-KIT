import { useCallback, useEffect, useRef, useState } from "react";

export interface UsePickerDraftOptions<Value> {
  value: Value;
  open: boolean;
  commitMode: "immediate" | "apply";
  setValue: (value: Value) => void;
  isEqual?: ((left: Value, right: Value) => boolean) | undefined;
}

export interface PickerDraftController<Value> {
  draft: Value;
  setDraft: (value: Value) => void;
  displayValue: Value;
  update: (value: Value) => void;
  openDraft: () => void;
  apply: () => void;
  cancel: () => void;
  discard: () => void;
}

export function usePickerDraft<Value>({
  value,
  open,
  commitMode,
  setValue,
  isEqual = Object.is
}: UsePickerDraftOptions<Value>): PickerDraftController<Value> {
  const [draft, setDraft] = useState(value);
  const committedRef = useRef(value);

  useEffect(() => {
    if (isEqual(committedRef.current, value)) return;
    committedRef.current = value;
    setDraft(value);
  }, [isEqual, value]);

  const openDraft = useCallback(() => setDraft(committedRef.current), []);
  const discard = useCallback(() => setDraft(committedRef.current), []);
  const update = useCallback((next: Value) => {
    setDraft(next);
    if (!(open && commitMode === "apply")) {
      committedRef.current = next;
      setValue(next);
    }
  }, [commitMode, open, setValue]);
  const apply = useCallback(() => {
    committedRef.current = draft;
    setValue(draft);
  }, [draft, setValue]);

  return {
    draft,
    setDraft,
    displayValue: open && commitMode === "apply" ? draft : value,
    update,
    openDraft,
    apply,
    cancel: discard,
    discard
  };
}
