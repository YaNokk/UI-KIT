import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Pagination } from "./Pagination";

const meta = { title: "Components/Pagination", component: Pagination, args: { page: 3, pageSize: 25, total: 12430, onPageChange: () => undefined } } satisfies Meta<typeof Pagination>;
export default meta;
type Story = StoryObj<typeof meta>;

function ControlledPagination({ withSize = false }: { withSize?: boolean }) {
  const [page, setPage] = useState(3);
  const [pageSize, setPageSize] = useState(25);
  const changePageSize = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  };
  return <Pagination onPageChange={setPage} {...(withSize ? { onPageSizeChange: changePageSize } : {})} page={page} pageSize={pageSize} pageSizeOptions={[25, 50, 100]} total={12430} />;
}

export const Basic: Story = { render: () => <ControlledPagination />, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await userEvent.click(canvas.getByRole("button", { name: "Следующая страница" })); await expect(canvas.getByRole("button", { name: "Страница 4" })).toHaveAttribute("aria-current", "page"); } };
export const PageSize: Story = { render: () => <ControlledPagination withSize />, play: async ({ canvasElement }) => { const canvas = within(canvasElement); const select = canvas.getByRole("combobox", { name: "Строк на странице" }); await userEvent.selectOptions(select, "50"); await expect(select).toHaveValue("50"); await expect(canvas.getByRole("button", { name: "Страница 1" })).toHaveAttribute("aria-current", "page"); await expect(canvasElement.querySelector(".ds-pagination-info")).toHaveTextContent("1–50 из 12 430"); } };
export const Disabled: Story = { args: { disabled: true } };
export const EmptyTotal: Story = { args: { page: 1, total: 0 } };
export const NormalizedInvalidInput: Story = { args: { page: 999, pageSize: 0, total: 30 } };
