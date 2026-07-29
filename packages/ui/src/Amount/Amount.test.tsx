// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Amount } from "./Amount";
import styles from "./Amount.module.css";

afterEach(cleanup);

describe("Amount", () => {
  it("renders semantic amount parts and currency", () => {
    render(
      <Amount
        currency="PLN"
        locale="pl-PL"
        minority={100}
        value={123456}
      />
    );

    expect(document.querySelector("[data-amount-part=\"major\"]"))
      .toHaveTextContent("1 234");
    expect(document.querySelector("[data-amount-part=\"minor\"]"))
      .toHaveTextContent(",56");
    expect(screen.getByText("zł")).toHaveAttribute("data-amount-part", "currency");
  });

  it("applies controlled semantic variants without raw styling props", () => {
    const { container } = render(
      <Amount
        emphasis="strong"
        minorTone="secondary"
        showPlus
        size="lg"
        value={120}
      />
    );
    expect(container.firstChild).toHaveTextContent("+1,20");
    expect(container.firstChild).toHaveClass(
      styles.strong,
      styles.secondaryMinor,
      styles.lg
    );
  });

  it("distinguishes zero and negative values", () => {
    render(
      <>
        <Amount data-testid="zero" value={0} />
        <Amount data-testid="negative" value={-5} />
      </>
    );
    expect(screen.getByTestId("zero")).toHaveTextContent("0,00");
    expect(screen.getByTestId("negative")).toHaveTextContent("-0,05");
  });
});
