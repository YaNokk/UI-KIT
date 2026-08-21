import { createRef, type ComponentRef } from "react";
import { describe, expectTypeOf, it } from "vitest";
import {
  DateInput,
  DatePicker,
  DateTimeInput,
  DateTimePicker,
  TimeInput
} from "../index";

describe("date control public ref types", () => {
  it("exposes the physical input element through every public control", () => {
    expectTypeOf<ComponentRef<typeof DateInput>>().toEqualTypeOf<HTMLInputElement>();
    expectTypeOf<ComponentRef<typeof TimeInput>>().toEqualTypeOf<HTMLInputElement>();
    expectTypeOf<ComponentRef<typeof DateTimeInput>>().toEqualTypeOf<HTMLInputElement>();
    expectTypeOf<ComponentRef<typeof DatePicker>>().toEqualTypeOf<HTMLInputElement>();
    expectTypeOf<ComponentRef<typeof DateTimePicker>>().toEqualTypeOf<HTMLInputElement>();
  });
});

const inputRef = createRef<HTMLInputElement>();
void <DateInput ref={inputRef} />;
void <TimeInput ref={inputRef} />;
void <DateTimeInput ref={inputRef} />;
void <DatePicker ref={inputRef} />;
void <DateTimePicker ref={inputRef} />;

const invalidRef = createRef<HTMLDivElement>();
// @ts-expect-error date inputs expose HTMLInputElement, not a wrapper element
void <DateInput ref={invalidRef} />;
// @ts-expect-error time inputs expose HTMLInputElement, not a wrapper element
void <TimeInput ref={invalidRef} />;
// @ts-expect-error date-time inputs expose HTMLInputElement, not a wrapper element
void <DateTimeInput ref={invalidRef} />;
// @ts-expect-error picker refs target their trigger HTMLInputElement
void <DatePicker ref={invalidRef} />;
// @ts-expect-error date-time picker refs target their trigger HTMLInputElement
void <DateTimePicker ref={invalidRef} />;
