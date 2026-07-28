import {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useId
} from "react";
import { classNames } from "../shared/classNames";
import { mergeIds } from "../shared/field";
import styles from "./FormControl.module.css";

export interface FormControlRenderProps {
  "aria-describedby"?: string | undefined;
  "aria-invalid"?: true | undefined;
  disabled?: boolean | undefined;
  id: string;
  required?: boolean | undefined;
}

export interface FormControlProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "color" | "style"> {
  children: (props: FormControlRenderProps) => ReactNode;
  controlId?: string | undefined;
  describedBy?: string | undefined;
  description?: ReactNode | undefined;
  disabled?: boolean | undefined;
  error?: ReactNode | undefined;
  invalid?: boolean | undefined;
  label?: ReactNode | undefined;
  required?: boolean | undefined;
}

export const FormControl = forwardRef<HTMLDivElement, FormControlProps>(
  function FormControl(
    {
      children,
      className,
      controlId,
      describedBy,
      description,
      disabled = false,
      error,
      invalid = error != null,
      label,
      required = false,
      ...nativeProps
    },
    ref
  ) {
    const generatedId = useId();
    const id = controlId ?? `field-${generatedId}`;
    const descriptionId = description == null ? undefined : `${id}-description`;
    const errorId = error == null ? undefined : `${id}-error`;
    const ariaDescribedBy = mergeIds(describedBy, descriptionId, errorId);

    return (
      <div
        {...nativeProps}
        className={classNames(styles.root, className)}
        data-disabled={disabled ? "" : undefined}
        data-invalid={invalid ? "" : undefined}
        ref={ref}
      >
        {label == null ? null : (
          <label className={styles.label} htmlFor={id}>
            {label}
            {required ? (
              <span aria-hidden="true" className={styles.required}>
                *
              </span>
            ) : null}
          </label>
        )}

        {children({
          "aria-describedby": ariaDescribedBy,
          "aria-invalid": invalid ? true : undefined,
          disabled,
          id,
          required
        })}

        {description == null ? null : (
          <div className={styles.description} id={descriptionId}>
            {description}
          </div>
        )}

        {error == null ? null : (
          <div className={styles.error} id={errorId}>
            {error}
          </div>
        )}
      </div>
    );
  }
);
