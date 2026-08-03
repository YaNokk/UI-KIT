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

  it("reinitializes draft on an externally controlled open transition", () => {
    const { result, rerender } = renderHook(
      ({ open }) => usePickerDraft({ value: "committed", open, commitMode: "apply", setValue: vi.fn() }),
      { initialProps: { open: true } }
    );
    act(() => result.current.update("stale draft"));
    rerender({ open: false });
    rerender({ open: true });
    expect(result.current.draft).toBe("committed");
    expect(result.current.displayValue).toBe("committed");
  });
});
