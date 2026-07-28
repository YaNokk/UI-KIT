import {
  forwardRef,
  type ReactNode,
  useState
} from "react";
import { Eye, EyeOff } from "lucide-react";
import { IconButton } from "../IconButton/IconButton";
import { Input, type InputProps } from "../Input/Input";
import styles from "./PasswordInput.module.css";

export interface PasswordInputProps
  extends Omit<InputProps, "endAdornment" | "type"> {
  defaultVisible?: boolean;
  hidePasswordLabel?: string;
  onVisibleChange?: (visible: boolean) => void;
  showPasswordLabel?: string;
  trailingAdornment?: ReactNode;
  visible?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    {
      defaultVisible = false,
      disabled = false,
      hidePasswordLabel = "Скрыть пароль",
      onVisibleChange,
      showPasswordLabel = "Показать пароль",
      trailingAdornment,
      visible,
      ...inputProps
    },
    ref
  ) {
    const [uncontrolledVisible, setUncontrolledVisible] = useState(defaultVisible);
    const isControlled = visible !== undefined;
    const isVisible = isControlled ? visible : uncontrolledVisible;

    const handleVisibleChange = () => {
      const nextVisible = !isVisible;
      if (!isControlled) setUncontrolledVisible(nextVisible);
      onVisibleChange?.(nextVisible);
    };

    return (
      <Input
        {...inputProps}
        disabled={disabled}
        endAdornment={
          <span className={styles.actions}>
            {trailingAdornment}
            <IconButton
              aria-label={isVisible ? hidePasswordLabel : showPasswordLabel}
              className={styles.toggle}
              disabled={disabled}
              icon={isVisible ? <EyeOff /> : <Eye />}
              onClick={handleVisibleChange}
              size="sm"
              variant="ghost"
            />
          </span>
        }
        ref={ref}
        type={isVisible ? "text" : "password"}
      />
    );
  }
);
