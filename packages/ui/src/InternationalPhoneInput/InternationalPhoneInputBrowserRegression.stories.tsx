import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { InternationalPhoneInput } from "./InternationalPhoneInput";

const meta = {
  title: "Internal/InternationalPhoneInputBrowserRegression",
  component: InternationalPhoneInput,
  tags: ["test"]
} satisfies Meta<typeof InternationalPhoneInput>;

export default meta;
type Story = StoryObj<typeof meta>;

function Harness() {
  const [value, setValue] = useState("");
  return (
    <div style={{ inlineSize: "min(100%, 28rem)" }}>
      <InternationalPhoneInput
        countries={["RU", "PL", "DE", "GB", "US"]}
        defaultCountry="RU"
        label="Phone"
        onValueChange={setValue}
        value={value}
      />
    </div>
  );
}

export const PopoverGeometryTypingPasteAndFocus: Story = {
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const documentBody = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole("textbox", { name: "Phone" });
    const shell = canvasElement.querySelector<HTMLElement>("[data-field-part='shell']");
    if (!shell) throw new Error("Phone FieldShell was not rendered.");

    await userEvent.type(input, "4957888878");
    await expect(input).toHaveValue("+7 495 788 88 78");
    await userEvent.clear(input);
    await userEvent.paste("+48 123 123 123");
    await expect(input).toHaveValue("+48 12 312 31 23");
    await expect(canvas.getByRole("button", { name: /Poland/ })).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: /Choose country/ }));
    const listbox = await documentBody.findByRole("listbox");
    const surface = listbox.closest<HTMLElement>("[data-select-surface]");
    if (!surface) throw new Error("Country Popover surface was not rendered.");
    await expect(Math.abs(surface.getBoundingClientRect().width - shell.getBoundingClientRect().width))
      .toBeLessThanOrEqual(1);
    await userEvent.click(documentBody.getByRole("option", { name: /Germany/ }));
    await expect(input).toHaveFocus();
    await expect(documentBody.queryByRole("listbox")).not.toBeInTheDocument();
    await expect(canvasElement.querySelector("[data-country-flag='DE']"))
      .toHaveAttribute("aria-hidden", "true");
  }
};

export const CompactBottomSheetParity: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  render: () => <Harness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole("button", { name: /Choose country/ }));
    await expect(await body.findByRole("listbox")).toBeVisible();
    await userEvent.click(body.getByRole("option", { name: /Poland/ }));
    await expect(canvas.getByRole("textbox", { name: "Phone" })).toHaveFocus();
  }
};
