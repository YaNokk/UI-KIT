// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { usePickerDraft } from "./usePickerDraft";

describe("usePickerDraft", () => {
  it("commits closed updates and drafts open apply-mode updates", () => {
    const setValue = vi.fn();
    const { result, rerender } = renderHook(
      ({ open }) => usePickerDraft({ value: "committed", open, commitMode: "apply", setValue }),
      { initialProps: { open: false } }
    );
    act(() => result.current.update("closed"));
    expect(setValue).toHaveBeenLastCalledWith("closed");

    rerender({ open: true });
    act(() => result.current.update("draft"));
    expect(result.current.displayValue).toBe("draft");
    expect(setValue).toHaveBeenCalledTimes(1);
    act(() => result.current.apply());
    expect(setValue).toHaveBeenLastCalledWith("draft");
  });

  it("cancel and discard restore the committed value", () => {
    const { result } = renderHook(() => usePickerDraft({
      value: "committed",
      open: true,
      commitMode: "apply",
      setValue: vi.fn()
    }));
    act(() => result.current.update("draft"));
    act(() => result.current.cancel());
    expect(result.current.draft).toBe("committed");
    act(() => result.current.update("another"));
    act(() => result.current.discard());
    expect(result.current.draft).toBe("committed");
  });

  it("refreshes draft after an external controlled value change", () => {
    const setValue = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }) => usePickerDraft({ value, open: true, commitMode: "apply", setValue }),
      { initialProps: { value: "first" } }
    );
    act(() => result.current.update("draft"));
    rerender({ value: "external" });
    expect(result.current.draft).toBe("external");
    expect(result.current.displayValue).toBe("external");
  });

  it("preserves a range draft for a new but semantically equal committed object", () => {
    type Range = { from: string | null; to: string | null };
    const isEqual = (left: Range, right: Range) => left.from === right.from && left.to === right.to;
    const { result, rerender } = renderHook(
      ({ value }) => usePickerDraft({ value, open: true, commitMode: "apply", setValue: vi.fn(), isEqual }),
      { initialProps: { value: { from: "2026-08-11", to: "2026-08-22" } as Range } }
    );
    const edited = { from: "2026-09-01", to: "2026-09-12" };
    act(() => result.current.update(edited));
    rerender({ value: { from: "2026-08-11", to: "2026-08-22" } });
    expect(result.current.draft).toBe(edited);
    expect(result.current.displayValue).toBe(edited);

    const external = { from: "2026-10-01", to: "2026-10-12" };
    rerender({ value: external });
    expect(result.current.draft).toBe(external);
    expect(result.current.displayValue).toBe(external);
  });

  it("keeps the applied value atomic across close and reopen", () => {
    const setValue = vi.fn();
    const { result, rerender } = renderHook(
      ({ open }) => usePickerDraft({ value: "committed", open, commitMode: "apply", setValue }),
      { initialProps: { open: true } }
    );
    act(() => result.current.update("applied"));
    act(() => result.current.apply());
    rerender({ open: false });
    rerender({ open: true });
    act(() => result.current.openDraft());
    expect(setValue).toHaveBeenCalledTimes(1);
    expect(setValue).toHaveBeenLastCalledWith("applied");
    expect(result.current.draft).toBe("applied");
    expect(result.current.displayValue).toBe("applied");
  });
});
