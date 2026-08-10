import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Pagination } from "./Pagination";

const meta = {
  title: "Components/Pagination",
  component: Pagination,
  args: {
    page: 3,
    pageSize: 25,
    total: 300,
    onPageChange: () => undefined
  }
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledPagination({ withSize = false }: { withSize?: boolean }) {
  const [page, setPage] = useState(3);
  const [pageSize, setPageSize] = useState(25);
  const changePageSize = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  };
  return (
    <Pagination
      onPageChange={setPage}
      {...(withSize ? { onPageSizeChange: changePageSize } : {})}
      page={page}
      pageSize={pageSize}
      pageSizeOptions={[25, 50, 100]}
      total={300}
    />
  );
}

export const Basic: Story = { render: () => <ControlledPagination withSize /> };
export const FirstPage: Story = { args: { page: 1 } };
export const LastPage: Story = { args: { page: 12 } };
export const PageSize: Story = { render: () => <ControlledPagination withSize /> };
export const Disabled: Story = { args: { disabled: true, onPageSizeChange: () => undefined } };
export const ZeroResults: Story = { args: { page: 1, total: 0 } };
export const Narrow: Story = {
  args: { onPageSizeChange: () => undefined },
  decorators: [(Story) => <div style={{ inlineSize: "360px", maxInlineSize: "100%" }}><Story /></div>],
  parameters: { viewport: { defaultViewport: "mobile1" } }
};

export const InteractionRegression: Story = {
  tags: ["test-only"],
  render: () => <ControlledPagination withSize />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Следующая страница" }));
    await expect(canvas.getByText("стр. 4 из 12")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "50" }));
    await expect(canvas.getByText("стр. 1 из 6")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "50" })).toHaveAttribute("aria-pressed", "true");
    await expect(canvasElement.querySelector("select")).toBeNull();
  }
};
