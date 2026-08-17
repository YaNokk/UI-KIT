import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useId,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref
} from "react";
import { ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Portal } from "../Portal/Portal";
import { classNames } from "../shared/classNames";
import { scrollbarClassName } from "../styles/scrollbar";
import {
  FloatingLayerContext,
  useFloatingOverlay
} from "../internal/floating/useFloatingOverlay";
import { renderFloatingTrigger } from "../internal/floating/trigger";
import styles from "./Sidebar.module.css";

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

function useSidebarContext(component: string) {
  const context = useContext(SidebarContext);
  if (!context) throw new Error(`${component} must be rendered inside Sidebar.`);
  return context;
}

function useControllableBoolean({
  controlled,
  defaultValue,
  onChange
}: {
  controlled: boolean | undefined;
  defaultValue: boolean;
  onChange: ((value: boolean) => void) | undefined;
}) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const value = controlled ?? uncontrolled;
  const setValue = useCallback((next: boolean) => {
    if (controlled === undefined) setUncontrolled(next);
    if (next !== value) onChange?.(next);
  }, [controlled, onChange, value]);
  return [value, setValue] as const;
}

export interface SidebarProps extends Omit<HTMLAttributes<HTMLElement>, "style"> {
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const SidebarRoot = forwardRef<HTMLElement, SidebarProps>(function SidebarRoot(
  {
    children,
    className,
    collapsed: controlledCollapsed,
    defaultCollapsed = false,
    onCollapsedChange,
    ...nativeProps
  },
  ref
) {
  const [collapsed, setCollapsed] = useControllableBoolean({
    controlled: controlledCollapsed,
    defaultValue: defaultCollapsed,
    onChange: onCollapsedChange
  });

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <aside
        {...nativeProps}
        className={classNames(styles.root, className)}
        data-collapsed={collapsed ? "" : undefined}
        data-sidebar=""
        ref={ref}
      >
        {children}
      </aside>
    </SidebarContext.Provider>
  );
});

export type SidebarHeaderProps = Omit<HTMLAttributes<HTMLDivElement>, "style">;

export const SidebarHeader = forwardRef<HTMLDivElement, SidebarHeaderProps>(
  function SidebarHeader({ className, ...props }, ref) {
    return <div {...props} className={classNames(styles.header, className)} ref={ref} />;
  }
);

export type SidebarContentProps = Omit<HTMLAttributes<HTMLElement>, "style">;

export const SidebarContent = forwardRef<HTMLElement, SidebarContentProps>(
  function SidebarContent({ className, ...props }, ref) {
    return (
      <nav
        {...props}
        className={classNames(styles.content, scrollbarClassName(), className)}
        ref={ref}
      />
    );
  }
);

export type SidebarFooterProps = Omit<HTMLAttributes<HTMLDivElement>, "style">;

export const SidebarFooter = forwardRef<HTMLDivElement, SidebarFooterProps>(
  function SidebarFooter({ className, ...props }, ref) {
    return <div {...props} className={classNames(styles.footer, className)} ref={ref} />;
  }
);

export interface SidebarCollapseTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "style" | "type"> {
  collapseLabel: string;
  expandLabel: string;
}

export const SidebarCollapseTrigger = forwardRef<
  HTMLButtonElement,
  SidebarCollapseTriggerProps
>(function SidebarCollapseTrigger(
  { className, collapseLabel, expandLabel, onClick, ...props },
  ref
) {
  const { collapsed, setCollapsed } = useSidebarContext("Sidebar.CollapseTrigger");
  return (
    <button
      {...props}
      aria-label={collapsed ? expandLabel : collapseLabel}
      className={classNames(styles.collapseTrigger, className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setCollapsed(!collapsed);
      }}
      ref={ref}
      type="button"
    >
      <span aria-hidden="true" className={styles.collapseIcon}>
        <PanelLeftOpen className={styles.indicatorIcon} data-visible={collapsed ? "" : undefined} />
        <PanelLeftClose className={styles.indicatorIcon} data-visible={!collapsed ? "" : undefined} />
      </span>
    </button>
  );
});

type SidebarControlNativeProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "disabled" | "style" | "title"
>;

export interface SidebarItemProps extends SidebarControlNativeProps {
  active?: boolean;
  asChild?: boolean;
  children?: ReactElement;
  disabled?: boolean;
  icon: ReactNode;
  label: string;
}

type ChildElementProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  ref?: Ref<HTMLElement>;
};

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as { current: T | null }).current = value;
}

function composeClickHandlers(
  first: ((event: MouseEvent<HTMLElement>) => void) | undefined,
  second: ((event: MouseEvent<HTMLElement>) => void) | undefined
) {
  return (event: MouseEvent<HTMLElement>) => {
    first?.(event);
    if (!event.defaultPrevented) second?.(event);
  };
}

function renderItemControl({
  active,
  asChild,
  children,
  className,
  disabled,
  icon,
  label,
  onClick,
  ref,
  ...nativeProps
}: SidebarItemProps & { ref?: Ref<HTMLElement> }) {
  const content = (
    <>
      <span aria-hidden="true" className={styles.itemIcon}>{icon}</span>
      <span className={styles.itemLabel}>{label}</span>
      <span aria-hidden="true" className={styles.itemAffordance}>
        <ChevronRight className={styles.indicatorIcon} data-visible="" />
      </span>
    </>
  );
  const common = {
    "aria-label": label,
    "aria-disabled": disabled ? true : undefined,
    className: classNames(styles.item, className),
    "data-active": active ? "" : undefined,
    "data-sidebar-nav-control": "",
    "data-disabled": disabled ? "" : undefined
  };

  if (asChild) {
    const child = Children.only(children);
    if (!isValidElement<ChildElementProps>(child)) {
      throw new Error("Sidebar.Item with asChild requires one valid React element.");
    }
    const childProps = child.props;
    return cloneElement(child as ReactElement<Record<string, unknown>>, {
      ...nativeProps,
      ...common,
      className: classNames(childProps.className, common.className),
      onClick: composeClickHandlers(
        (event) => {
          if (disabled) {
            event.preventDefault();
            event.stopPropagation();
          }
        },
        (event) => {
          if (disabled) return;
          (childProps.onClick as ((event: MouseEvent<HTMLElement>) => void) | undefined)?.(event);
          if (event.defaultPrevented) return;
          onClick?.(event as MouseEvent<HTMLButtonElement>);
        }
      ),
      ref: (node: HTMLElement | null) => {
        assignRef(childProps.ref, node);
        assignRef(ref, node);
      },
      tabIndex: disabled ? -1 : childProps.tabIndex,
      children: content
    } as Record<string, unknown>);
  }

  return (
    <button
      {...nativeProps}
      {...common}
      disabled={disabled}
      onClick={onClick}
      ref={ref as Ref<HTMLButtonElement>}
      type="button"
    >
      {content}
    </button>
  );
}

interface SidebarFlyoutProps {
  children?: ReactNode;
  label: string;
  onOpenChange?: (open: boolean) => void;
  trigger: ReactElement;
}

function SidebarFlyout({ children, label, onOpenChange, trigger }: SidebarFlyoutProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const floating = useFloatingOverlay({
    dismissOnEscape: true,
    dismissOnOutsidePress: true,
    interaction: "hover",
    onOpenChange: (next) => {
      setOpen(next);
      onOpenChange?.(next);
    },
    open,
    placement: "right-start",
    role: children ? "dialog" : "tooltip"
  });

  return (
    <>
      {renderFloatingTrigger(trigger, floating.getReferenceProps, floating.refs.setReference)}
      {open ? (
        <Portal container={floating.portalContainer}>
          <FloatingLayerContext.Provider value={floating.childLayer}>
            <div
              {...floating.getFloatingProps({
                "aria-labelledby": titleId
              })}
              className={styles.flyout}
              data-sidebar-flyout=""
              ref={floating.refs.setFloating}
              style={{ ...floating.floatingStyles, zIndex: floating.layer }}
            >
              <div className={styles.flyoutTitle} id={titleId}>{label}</div>
              {children ? <div className={styles.flyoutItems}>{children}</div> : null}
            </div>
          </FloatingLayerContext.Provider>
        </Portal>
      ) : null}
    </>
  );
}

export const SidebarItem = forwardRef<HTMLElement, SidebarItemProps>(
  function SidebarItem(props, ref) {
    const { collapsed } = useSidebarContext("Sidebar.Item");
    const control = renderItemControl({ ...props, ref });
    return collapsed ? <SidebarFlyout label={props.label} trigger={control} /> : control;
  }
);

export type SidebarSubitemProps = Omit<SidebarItemProps, "icon">;

export const SidebarSubitem = forwardRef<HTMLElement, SidebarSubitemProps>(
  function SidebarSubitem(props, ref) {
    return renderItemControl({
      ...props,
      className: classNames(styles.subitem, props.className),
      icon: null,
      ref
    });
  }
);

export interface SidebarGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "style"> {
  active?: boolean;
  children: ReactNode;
  defaultOpen?: boolean;
  disabled?: boolean;
  icon: ReactNode;
  label: string;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}

export const SidebarGroup = forwardRef<HTMLDivElement, SidebarGroupProps>(
  function SidebarGroup(
    {
      active = false,
      children,
      className,
      defaultOpen = false,
      disabled = false,
      icon,
      label,
      onOpenChange,
      open: controlledOpen,
      ...props
    },
    ref
  ) {
    const { collapsed } = useSidebarContext("Sidebar.Group");
    const [open, setOpen] = useControllableBoolean({
      controlled: controlledOpen,
      defaultValue: defaultOpen,
      onChange: onOpenChange
    });
    const submenuId = useId();
    const [flyoutOpen, setFlyoutOpen] = useState(false);
    const setSubmenuRef = useCallback((submenu: HTMLDivElement | null) => {
      if (!submenu) return;
      if (open) submenu.removeAttribute("inert");
      else submenu.setAttribute("inert", "");
    }, [open]);

    const trigger = (
      <button
        aria-controls={!collapsed ? submenuId : undefined}
        aria-expanded={collapsed ? flyoutOpen : open}
        aria-label={label}
        className={styles.item}
        data-active={active ? "" : undefined}
        data-sidebar-nav-control=""
        disabled={disabled}
        type="button"
        onClick={() => {
          if (!collapsed) setOpen(!open);
        }}
      >
        <span aria-hidden="true" className={styles.itemIcon}>{icon}</span>
        <span className={styles.itemLabel}>{label}</span>
        <span aria-hidden="true" className={styles.itemAffordance}>
          <ChevronDown
            className={styles.indicatorIcon}
            data-visible={open && !collapsed ? "" : undefined}
          />
          <ChevronRight
            className={styles.indicatorIcon}
            data-visible={!open || collapsed ? "" : undefined}
          />
        </span>
      </button>
    );

    return (
      <div {...props} className={classNames(styles.group, className)} ref={ref}>
        {collapsed ? (
          <SidebarFlyout label={label} onOpenChange={setFlyoutOpen} trigger={trigger}>
            {children}
          </SidebarFlyout>
        ) : (
          <>
            {trigger}
            <div
              aria-hidden={!open}
              className={styles.submenu}
              data-open={open ? "" : undefined}
              id={submenuId}
              ref={setSubmenuRef}
            >
              <div className={styles.submenuClip}>
                <div className={styles.submenuContent}>{children}</div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);

export const Sidebar = Object.assign(SidebarRoot, {
  CollapseTrigger: SidebarCollapseTrigger,
  Content: SidebarContent,
  Footer: SidebarFooter,
  Group: SidebarGroup,
  Header: SidebarHeader,
  Item: SidebarItem,
  Subitem: SidebarSubitem
});
