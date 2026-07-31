import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useId
} from "react";
import { classNames } from "../shared/classNames";
import { mergeIds, type FieldLabelView } from "../shared/field";
import styles from "./FormControl.module.css";

export interface FormControlRenderProps {
  "aria-describedby"?: string | undefined;
  "aria-invalid"?: true | undefined;
  disabled?: boolean | undefined;
  id: string;
  label?: ReactNode | undefined;
  required?: boolean | undefined;
}

export interface FormControlProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "color" | "style"> {
  children: (props: FormControlRenderProps) => ReactNode;
  block?: boolean | undefined;
  controlId?: string | undefined;
  describedBy?: string | undefined;
  disabled?: boolean | undefined;
  error?: ReactNode | undefined;
  hint?: ReactNode | undefined;
  invalid?: boolean | undefined;
  label?: ReactNode | undefined;
  labelView?: FieldLabelView | undefined;
  required?: boolean | undefined;
}

export const FormControl = forwardRef<HTMLDivElement, FormControlProps>(
  function FormControl(
    {
      block = false,
      children,
      className,
      controlId,
      describedBy,
      disabled = false,
      error,
      hint,
      invalid = error != null,
      label,
      labelView = "outer",
      required = false,
      ...nativeProps
    },
    ref
  ) {
    const generatedId = useId();
    const id = controlId ?? `field-${generatedId}`;
    const hintId = error == null && hint != null ? `${id}-hint` : undefined;
    const errorId = error == null ? undefined : `${id}-error`;
    const ariaDescribedBy = mergeIds(describedBy, hintId, errorId);
    const labelNode = label == null ? null : (
      <label className={styles.label} htmlFor={id}>
        {label}
        {required ? (
          <span aria-hidden="true" className={styles.required}>
            *
          </span>
        ) : null}
      </label>
    );

    return (
      <div
        {...nativeProps}
        className={classNames(styles.root, block && styles.block, className)}
        data-disabled={disabled ? "" : undefined}
        data-invalid={invalid ? "" : undefined}
        data-label-view={labelView}
        ref={ref}
      >
        {labelView === "outer" ? labelNode : null}

        {children({
          "aria-describedby": ariaDescribedBy,
          "aria-invalid": invalid ? true : undefined,
          disabled,
          id,
          label: labelView === "inner" ? labelNode : undefined,
          required
        })}

        {error == null && hint != null ? (
          <div className={styles.hint} id={hintId}>
            {hint}
          </div>
        ) : null}

        {error == null ? null : (
          <div className={styles.error} id={errorId}>
            {error}
          </div>
        )}
      </div>
    );
  }
);
