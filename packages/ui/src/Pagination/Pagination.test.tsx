// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Pagination } from "./Pagination";

afterEach(cleanup);

describe("Pagination", () => {
  it("disables previous on the first page and next on the last page", () => {
    const { rerender } = render(
      <Pagination onPageChange={() => undefined} page={1} pageSize={25} total={50} />
    );
    expect(screen.getByRole("button", { name: "Предыдущая страница" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Следующая страница" })).toBeEnabled();

    rerender(<Pagination onPageChange={() => undefined} page={2} pageSize={25} total={50} />);
    expect(screen.getByRole("button", { name: "Предыдущая страница" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Следующая страница" })).toBeDisabled();
  });

  it("emits adjacent controlled pages", async () => {
    const onPageChange = vi.fn();
    render(<Pagination onPageChange={onPageChange} page={3} pageSize={25} total={300} />);
    await userEvent.click(screen.getByRole("button", { name: "Предыдущая страница" }));
    await userEvent.click(screen.getByRole("button", { name: "Следующая страница" }));
    expect(onPageChange).toHaveBeenNthCalledWith(1, 2);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 4);
  });

  it("renders compact page information and a non-clickable current page", () => {
    const { container } = render(
      <Pagination onPageChange={() => undefined} page={3} pageSize={25} total={300} />
    );
    expect(screen.getByText("стр. 3 из 12")).toBeInTheDocument();
    expect(container.querySelector("[aria-current='page']")).toHaveTextContent("3");
    expect(screen.queryByRole("button", { name: "Страница 3" })).not.toBeInTheDocument();
  });

  it("renders ordinary page-size buttons with pressed state and no select", async () => {
    const onPageChange = vi.fn();
    const onPageSizeChange = vi.fn();
    const { container } = render(
      <Pagination
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        page={3}
        pageSize={25}
        pageSizeOptions={[25, 50, 100]}
        total={300}
      />
    );
    const group = screen.getByRole("group", { name: "На странице" });
    const buttons = Array.from(group.querySelectorAll("button"));
    expect(buttons.map((button) => button.textContent)).toEqual(["25", "50", "100"]);
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
    expect(buttons[1]).toHaveAttribute("aria-pressed", "false");
    expect(buttons[2]).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(buttons[1] as HTMLButtonElement);
    expect(onPageSizeChange).toHaveBeenCalledWith(50);
    expect(onPageChange).not.toHaveBeenCalled();
    expect(container.querySelector("select")).not.toBeInTheDocument();
  });

  it("disables navigation and page-size actions", () => {
    render(
      <Pagination
        disabled
        onPageChange={() => undefined}
        onPageSizeChange={() => undefined}
        page={2}
        pageSize={25}
        total={100}
      />
    );
    expect(screen.getAllByRole("button")).not.toHaveLength(0);
    for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled();
  });

  it("normalizes zero results and invalid controlled inputs without emitting callbacks", () => {
    const onPageChange = vi.fn();
    const { container, rerender } = render(
      <Pagination onPageChange={onPageChange} page={99} pageSize={0} total={0} />
    );
    expect(screen.getByText("стр. 1 из 1")).toBeInTheDocument();
    expect(container.querySelector("[aria-current='page']")).toHaveTextContent("1");
    expect(screen.getByRole("button", { name: "Предыдущая страница" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Следующая страница" })).toBeDisabled();
    expect(onPageChange).not.toHaveBeenCalled();

    rerender(<Pagination onPageChange={onPageChange} page={10} pageSize={25} total={30} />);
    expect(screen.getByText("стр. 2 из 2")).toBeInTheDocument();
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("keeps the controlled page size available when it is absent from options", () => {
    render(
      <Pagination
        onPageChange={() => undefined}
        onPageSizeChange={() => undefined}
        page={1}
        pageSize={75}
        pageSizeOptions={[25, 50, 100]}
        total={300}
      />
    );
    const active = screen.getByRole("button", { pressed: true });
    expect(active).toHaveTextContent("75");
  });
});
