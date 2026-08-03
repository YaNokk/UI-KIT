import { useCallback, useEffect, useState } from "react";

export interface UsePickerDraftOptions<Value> {
  value: Value;
  open: boolean;
  commitMode: "immediate" | "apply";
  setValue: (value: Value) => void;
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
  setValue
}: UsePickerDraftOptions<Value>): PickerDraftController<Value> {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [open, value]);

  const openDraft = useCallback(() => setDraft(value), [value]);
  const discard = useCallback(() => setDraft(value), [value]);
  const update = useCallback((next: Value) => {
    setDraft(next);
    if (!(open && commitMode === "apply")) setValue(next);
  }, [commitMode, open, setValue]);
  const apply = useCallback(() => setValue(draft), [draft, setValue]);

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
