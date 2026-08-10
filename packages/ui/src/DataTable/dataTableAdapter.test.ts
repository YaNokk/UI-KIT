import { describe, expect, it } from "vitest";
import { getCompleteColumnOrder, getControlledColumnPinning, getDataTableRowId, reorderColumnInZone, resolveNonOverlappingColumnPinning } from "./dataTableAdapter";
import type { DataTableColumn } from "./types";

interface Row { id: string; name: string }
const columns: DataTableColumn<Row>[] = [
  { id: "id", header: "ID", accessor: "id", sticky: "start", width: 100 },
  { id: "name", header: "Имя", accessor: "name", width: 180 },
  { id: "computed", header: "Вычисляемый", render: (row) => row.name.length, width: 120 },
  { id: "actions", header: "Действия", sticky: "end", width: 80 }
];

describe("DataTable TanStack adapter", () => {
  it("completes a stale controlled order without creating a second visual order engine", () => {
    expect(getCompleteColumnOrder(
      [...columns, { id: "new-normal", header: "Новый", render: () => "Новый" }],
      ["actions", "computed", "id", "name", "removed"]
    )).toEqual(["actions", "computed", "id", "name", "new-normal"]);
  });

  it("removes duplicate and unknown IDs before appending each current column once", () => {
    expect(getCompleteColumnOrder(columns, ["name", "removed", "name", "id", "id"]))
      .toEqual(["name", "id", "computed", "actions"]);
  });

  it("derives pinned-region order from the controlled order", () => {
    const pinnedColumns: DataTableColumn<Row>[] = [
      ...columns,
      { id: "second-start", header: "Второй start", sticky: "start" },
      { id: "second-end", header: "Второй end", sticky: "end" }
    ];
    expect(getControlledColumnPinning(
      pinnedColumns,
      ["second-start", "id", "computed", "name", "second-end", "actions"]
    )).toEqual({
      start: ["second-start", "id"],
      end: ["second-end", "actions"]
    });
  });

  it("returns excess pinned columns to scroll flow on a narrow viewport", () => {
    const stressColumns: DataTableColumn<Row>[] = [
      { id: "start-a", header: "Start A", sticky: "start", width: 128 },
      { id: "start-b", header: "Start B", sticky: "start", width: 208 },
      { id: "center", header: "Center", width: 320 },
      { id: "end-a", header: "End A", sticky: "end", width: 144 },
      { id: "end-b", header: "End B", sticky: "end", width: 152 }
    ];
    const order = ["start-b", "start-a", "center", "end-b", "end-a"];
    expect(resolveNonOverlappingColumnPinning({
      columns: stressColumns,
      minimumScrollFlowInlineSize: 48,
      order,
      reservedStartInlineSize: 0,
      viewportInlineSize: 360
    })).toEqual({ start: ["start-b"], end: [] });
    expect(resolveNonOverlappingColumnPinning({
      columns: stressColumns,
      minimumScrollFlowInlineSize: 48,
      order,
      reservedStartInlineSize: 0,
      viewportInlineSize: 1024
    })).toEqual({ start: ["start-b", "start-a"], end: ["end-b", "end-a"] });
  });

  it("does not report hidden sticky columns as requested pins", () => {
    expect(getControlledColumnPinning(
      columns,
      ["id", "name", "computed", "actions"],
      undefined,
      { actions: false }
    )).toEqual({ start: ["id"], end: [] });
  });

  it("rejects cross-zone reorder and permits reorder inside a zone", () => {
    expect(reorderColumnInZone(columns, undefined, "name", "actions")).toBeNull();
    expect(reorderColumnInZone(columns, undefined, "computed", "name"))
      .toEqual(["id", "computed", "name", "actions"]);
  });

  it("keeps numeric and string row keys distinct for TanStack getRowId", () => {
    expect(getDataTableRowId(1)).toBe("number:1");
    expect(getDataTableRowId("1")).toBe("string:1");
  });
});
