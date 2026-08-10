import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Button, type DataTableColumn, type DataTableSelection } from "@mypoint/ui";
import { DataTableColumnSettings, DataTableSelectionBar, ResponsiveDataView } from "./DataTablePatterns";

interface Row { id: number; name: string; status: string }
const columns: DataTableColumn<Row>[] = [
  { id: "id", header: "ID", accessor: "id", hideable: false, sticky: "start" },
  { id: "name", header: "Клиент", accessor: "name" },
  { id: "status", header: "Статус", accessor: "status" }
];
const meta = { title: "Patterns/DataTable" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const ColumnSettings: Story = { render: () => { const [order, setOrder] = useState(columns.map((column) => column.id)); const [visibility, setVisibility] = useState<Record<string, boolean>>({}); return <DataTableColumnSettings columnOrder={order} columnVisibility={visibility} columns={columns} onColumnOrderChange={setOrder} onColumnVisibilityChange={setVisibility} onReset={() => { setOrder(columns.map((column) => column.id)); setVisibility({}); }} />; } };
export const SelectionBar: Story = { render: () => { const [selection, setSelection] = useState<DataTableSelection<number>>({ mode: "explicit", selectedKeys: [1, 2, 3] }); return <DataTableSelectionBar actions={<Button size="sm" variant="primary">Обработать</Button>} matchingTotal={12430} onSelectionChange={setSelection} pageSelectedCount={selection.mode === "explicit" ? selection.selectedKeys.length : 25} selection={selection} />; }, play: async ({ canvasElement }) => { const canvas = within(canvasElement); await userEvent.click(canvas.getByRole("button", { name: /Выбрать все 12/ })); await expect(canvas.getByText(/Выбраны все 12/)).toBeVisible(); } };
export const Responsive: Story = { render: () => <ResponsiveDataView cards={<div>Карточки заказов для mobile/narrow</div>} table={<div>Таблица заказов для tablet/desktop</div>} /> };
export const Responsive360: Story = { ...Responsive, parameters: { viewport: { defaultViewport: "mobile1" } } };
export const Responsive768: Story = { ...Responsive, parameters: { viewport: { defaultViewport: "tablet" } } };
export const Responsive1280: Story = { ...Responsive, parameters: { viewport: { defaultViewport: "desktop" } } };
