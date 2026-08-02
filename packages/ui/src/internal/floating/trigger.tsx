import {
  cloneElement,
  type HTMLProps,
  type ReactElement,
  type Ref,
  type SyntheticEvent
} from "react";

type TriggerProps = Record<string, unknown> & {
  ref?: Ref<HTMLElement>;
};

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  if (ref) {
    (ref as { current: T | null }).current = value;
  }
}

function composeEventHandlers<Event extends SyntheticEvent<Element>>(
  first: ((event: Event) => void) | undefined,
  second: ((event: Event) => void) | undefined
) {
  if (!first) return second;
  if (!second) return first;
  return (event: Event) => {
    first(event);
    if (!event.defaultPrevented) second(event);
  };
}

export function renderFloatingTrigger(
  trigger: ReactElement,
  getReferenceProps: (
    userProps?: HTMLProps<Element>
  ) => Record<string, unknown>,
  setReference: (node: HTMLElement | null) => void,
  additionalProps: HTMLProps<Element> = {}
) {
  const triggerProps = trigger.props as TriggerProps;
  const referenceProps = getReferenceProps({
    ...(triggerProps as HTMLProps<Element>),
    ...additionalProps,
    onClick: composeEventHandlers(
      (triggerProps as HTMLProps<Element>).onClick,
      additionalProps.onClick
    ),
    onMouseDown: composeEventHandlers(
      (triggerProps as HTMLProps<Element>).onMouseDown,
      additionalProps.onMouseDown
    ),
    onPointerDown: composeEventHandlers(
      (triggerProps as HTMLProps<Element>).onPointerDown,
      additionalProps.onPointerDown
    )
  });

  return cloneElement(
    trigger as ReactElement<Record<string, unknown>>,
    {
      ...referenceProps,
      ref: (node: HTMLElement | null) => {
        assignRef(triggerProps.ref, node);
        setReference(node);
      }
    }
  );
}

export function isDisabledTrigger(trigger: ReactElement): boolean {
  const props = trigger.props as {
    "aria-disabled"?: boolean | "true" | "false";
    disabled?: boolean;
  };
  return Boolean(props.disabled || props["aria-disabled"] === true
    || props["aria-disabled"] === "true");
}
