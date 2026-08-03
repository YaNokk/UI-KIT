import { CalendarDays } from "lucide-react";
import { IconButton } from "../../IconButton/IconButton";

export interface CalendarTriggerAddonProps {
  label: string;
  disabled?: boolean;
  readOnly?: boolean;
  open: boolean;
  onOpen: () => void;
}

export function CalendarTriggerAddon({
  label,
  disabled = false,
  readOnly = false,
  open,
  onOpen
}: CalendarTriggerAddonProps) {
  return (
    <IconButton
      aria-label={label}
      data-field-interactive=""
      disabled={disabled}
      icon={<CalendarDays />}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!disabled && !readOnly && !open) onOpen();
      }}
      onPointerDown={(event) => event.preventDefault()}
      size="sm"
    />
  );
}
