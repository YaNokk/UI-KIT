import { X } from "lucide-react";

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: "#e6f2ff", text: "#005abf", border: "#bae0ff" },
  green: { bg: "#dcfce7", text: "#15803d", border: "#86efac" },
  red: { bg: "#fee2e2", text: "#b91c1c", border: "#fca5a5" },
  amber: { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
  purple: { bg: "#f3e8ff", text: "#6b21a8", border: "#d8b4fe" },
  gray: { bg: "#f5f7fa", text: "#4f4d5b", border: "#e3eaf4" },
  brand: { bg: "#f5f2f7", text: "#463a55", border: "#c9bfd2" },
};

export type TagColor = keyof typeof colorMap;

export function Tag({
  label,
  color,
  removable,
  dot,
}: {
  label: string;
  color: TagColor | string;
  removable?: boolean;
  dot?: boolean;
}) {
  const c = colorMap[color] || colorMap.gray;
  return (
    <span
      className="inline-flex items-center gap-1 text-[12px] font-medium px-2 py-0.5 rounded-full border"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.text }} />}
      {label}
      {removable && (
        <button className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity">
          <X size={10} />
        </button>
      )}
    </span>
  );
}
