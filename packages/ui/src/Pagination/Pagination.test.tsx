// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Pagination } from "./Pagination";

afterEach(cleanup);

describe("Pagination", () => {
  it("changes page through independent controlled callbacks", async () => {
    const onPageChange = vi.fn();
    render(<Pagination onPageChange={onPageChange} page={2} pageSize={25} total={140} />);
    await userEvent.click(screen.getByRole("button", { name: "Следующая страница" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("emits page size without silently resetting the page", async () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    render(<Pagination onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} page={3} pageSize={25} total={140} />);
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Строк на странице" }), "50");
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("normalizes invalid page and pageSize inputs", () => {
    const onPageChange = vi.fn();
    render(<Pagination onPageChange={onPageChange} page={-5} pageSize={0} total={3} />);
    expect(screen.getByRole("button", { name: "Страница 1" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Предыдущая страница" })).toBeDisabled();
    expect(screen.getByText("1–1 из 3")).toBeInTheDocument();
  });

  it("clamps a stale controlled page after total shrinks", () => {
    render(<Pagination onPageChange={() => undefined} page={10} pageSize={25} total={30} />);
    expect(screen.getByRole("button", { name: "Страница 2" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Следующая страница" })).toBeDisabled();
    expect(screen.getByText("26–30 из 30")).toBeInTheDocument();
  });

  it("keeps page-size policy consumer-owned on the last page", async () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    render(<Pagination onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} page={6} pageSize={25} total={140} />);
    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Строк на странице" }), "50");
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
    expect(onPageChange).not.toHaveBeenCalled();
  });
});
