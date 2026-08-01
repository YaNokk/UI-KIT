const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: "#0080ff", text: "#fff" },
  green: { bg: "#22c55e", text: "#fff" },
  red: { bg: "#ef4444", text: "#fff" },
  amber: { bg: "#f59e0b", text: "#fff" },
  purple: { bg: "#a78bfa", text: "#fff" },
  gray: { bg: "#e3eaf4", text: "#4f4d5b" },
};

export type BadgeColor = keyof typeof colorMap;

export function Badge({ label, color }: { label: string | number; color: BadgeColor | string }) {
  const c = colorMap[color] || colorMap.gray;
  return (
    <span
      className="inline-flex items-center justify-center text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px]"
      style={{ background: c.bg, color: c.text }}
    >
      {label}
    </span>
  );
}
