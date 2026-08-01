import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import FnIcon from "../imports/Fn";
import CardIcon from "../imports/Card";
import TimeIcon from "../imports/Time";
import PercentIcon from "../imports/UnnamedComponent";
import TableModulesIcon from "../imports/TableModules";
import ScanerIcon from "../imports/Scaner";
import MarkirovkaIcon from "../imports/Markirovka";
import ZnakIcon from "../imports/Znak";
import Fz54Icon from "../imports/Fz54";
import OpticsIcon from "../imports/Optics";
import { Check, ChevronRight, ChevronDown, ChevronUp, X, Eye, EyeOff, Search, Bell, Settings, User, Home, BarChart2, FileText, LogOut, ArrowUpRight, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Info, AlertTriangle, ChevronLeft, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, RefreshCw, RotateCcw, RotateCw, Maximize2, Minimize2, Move, LogIn, Play, Pause, Square, Volume2, VolumeX, SkipBack, SkipForward, Edit2, Edit3, Trash2, Trash, Copy, Clipboard, Scissors, Link, Link2, Paperclip, Download, Upload, Share, Share2, ZoomIn, ZoomOut, Filter, SortAsc, SortDesc, Grid, List, Columns, Layout, Sidebar, Menu, MoreHorizontal, MoreVertical, Plus, Minus, Hash, AtSign, Lock, Unlock, Shield, Key, Mail, MessageSquare, MessageCircle, Phone, PhoneCall, Video, VideoOff, Camera, Mic, MicOff, Wifi, WifiOff, Bluetooth, Globe, Map, MapPin, Navigation, Compass, Flag, Bookmark, Tag as TagIcon, Star, Heart, ThumbsUp, ThumbsDown, Smile, Meh, Frown, Sun, Moon, Cloud, CloudRain, Calendar, Clock, Timer, Watch, Package, Box, ShoppingCart, ShoppingBag, CreditCard, DollarSign, Percent, PieChart, BarChart, LineChart, Database, Server, Cpu, HardDrive, Monitor, Smartphone, Tablet, Printer, Save, File, Folder, FolderOpen, Archive, Inbox, Send, AlertOctagon, HelpCircle, Loader, Zap, Activity, Anchor, Award, Briefcase, Building, Coffee, Crop, Disc, Dribbble, Droplet, Feather, Gift, Headphones, Image, Layers, Paperclip as PaperclipIcon, Power, Radio as RadioIcon, Repeat, Rss, Sliders, Speaker, Terminal, ToggleLeft, ToggleRight, Wrench, Truck, Type, Umbrella, Users, UserCheck, UserMinus, UserPlus, UserX, Voicemail, Youtube, Github, Instagram, Twitter, Linkedin, Facebook, Figma, Chrome, Network, Code2 } from "lucide-react";
import { Tag, Badge, SectionLabel, SubLabel } from "./components/primitives";
import { DeferredOrderReceipt } from "./components/receipt";
import { demoDeferredOrderReceipt } from "./demo-data";
import {
  ToolbarIconButton,
  MultiSelectField,
  CompactSelect,
  CompactRangeField,
  CompactDateRangeField,
  formatCompactDate,
  SearchField,
  ReorderableListPopover,
} from "./components/toolbar";

// ─── Design tokens ───────────────────────────────────────────────────────────
const tokens = {
  brand: {
    50: "#f5f2f7", 100: "#e5dee9", 200: "#c9bfd2", 300: "#a395b0",
    400: "#7d6e8e", 500: "#5a4d6b", 600: "#463a55", 700: "#332c38",
    800: "#241f28", 900: "#14111a",
  },
  blue: {
    50: "#e6f2ff", 100: "#bae0ff", 200: "#85c9ff", 300: "#4dacff",
    400: "#1a95ff", 500: "#0080ff", 600: "#006fe0", 700: "#005abf",
    800: "#00478f", 900: "#003366",
  },
  neutral: {
    50: "#f5f7fa", 100: "#ebf1f5", 200: "#e3eaf4", 300: "#d6dde8",
    400: "#b8bfcc", 500: "#9d99ac", 600: "#6e6b7b", 700: "#4f4d5b",
    800: "#332c38", 900: "#1a1620",
  },
  semantic: {
    success: "#22c55e", warning: "#f59e0b", error: "#ef4444",
    info: "#0080ff", purple: "#a78bfa",
  },
};

const SECTIONS = [
  { id: "tokens",      label: "Tokens",         chip: { bg: "#eef2ff", bar: "#4338ca", text: "#4338ca" } },
  { id: "colors",      label: "Colors",         chip: { bg: "#ebf4f1", bar: "#3c9070", text: "#3c9070" } },
  { id: "typography",  label: "Typography",     chip: { bg: "#efedfa", bar: "#5e4bcb", text: "#5e4bcb" } },
  { id: "spacing",     label: "Spacing",        chip: { bg: "#f0f9ff", bar: "#0284c7", text: "#0284c7" } },
  { id: "shadows",     label: "Shadows",        chip: { bg: "#f5f3ff", bar: "#7c3aed", text: "#7c3aed" } },
  { id: "buttons",     label: "Buttons",        chip: { bg: "#e6f2ff", bar: "#0080ff", text: "#0080ff" } },
  { id: "inputs",      label: "Inputs",         chip: { bg: "#fff7e6", bar: "#d97706", text: "#d97706" } },
  { id: "tags",        label: "Tags & Badges",  chip: { bg: "#fdf2f8", bar: "#db2777", text: "#db2777" } },
  { id: "avatars",     label: "Avatars",        chip: { bg: "#f0fdf4", bar: "#16a34a", text: "#16a34a" } },
  { id: "alerts",      label: "Alerts",         chip: { bg: "#fff1f2", bar: "#e11d48", text: "#e11d48" } },
  { id: "formcontrols",label: "Form Controls",  chip: { bg: "#f5f3ff", bar: "#7c3aed", text: "#7c3aed" } },
  { id: "navigation",  label: "Navigation",     chip: { bg: "#ecfeff", bar: "#0891b2", text: "#0891b2" } },
  { id: "cards",       label: "Cards & Metrics",chip: { bg: "#fefce8", bar: "#ca8a04", text: "#ca8a04" } },
  { id: "modal",       label: "Modal",          chip: { bg: "#fdf4ff", bar: "#a21caf", text: "#a21caf" } },
  { id: "toast",       label: "Toast",          chip: { bg: "#fff7ed", bar: "#ea580c", text: "#ea580c" } },
  { id: "tooltip",     label: "Tooltip",        chip: { bg: "#f0fdf4", bar: "#059669", text: "#059669" } },
  { id: "skeleton",    label: "Skeleton",       chip: { bg: "#f8fafc", bar: "#64748b", text: "#64748b" } },
  { id: "emptystate",  label: "Empty State",    chip: { bg: "#faf5ff", bar: "#7c3aed", text: "#7c3aed" } },
  { id: "progress",    label: "Progress",       chip: { bg: "#eff6ff", bar: "#2563eb", text: "#2563eb" } },
  { id: "table",       label: "Table",          chip: { bg: "#f0fdf4", bar: "#16a34a", text: "#16a34a" } },
  { id: "icons",       label: "Icons",          chip: { bg: "#fefce8", bar: "#a16207", text: "#a16207" } },
  { id: "accordion",   label: "Accordion",      chip: { bg: "#f0fdf4", bar: "#15803d", text: "#15803d" } },
  { id: "fileupload",  label: "File Upload",    chip: { bg: "#fff7ed", bar: "#c2410c", text: "#c2410c" } },
  { id: "rangeslider", label: "Range Slider",   chip: { bg: "#fdf4ff", bar: "#9333ea", text: "#9333ea" } },
  { id: "popover",     label: "Popover",        chip: { bg: "#f0f9ff", bar: "#0369a1", text: "#0369a1" } },
  { id: "borderradius",label: "Border Radius",  chip: { bg: "#fff1f2", bar: "#be123c", text: "#be123c" } },
  { id: "numberinput", label: "Number Input",   chip: { bg: "#f0fdf4", bar: "#059669", text: "#059669" } },
  { id: "datepicker",  label: "Date Picker",    chip: { bg: "#fdf4ff", bar: "#9333ea", text: "#9333ea" } },
  { id: "receipt",     label: "Receipt",        chip: { bg: "#fff7ed", bar: "#ea580c", text: "#ea580c" } },
  { id: "toolbar",     label: "Toolbar & Filters", chip: { bg: "#eef2ff", bar: "#4338ca", text: "#4338ca" } },
];

// ─── Reusable primitives ──────────────────────────────────────────────────────

function SectionChip({ section }: { section: typeof SECTIONS[0] }) {
  return (
    <div
      className="flex items-center gap-[10px] h-11 px-6 shrink-0"
      style={{ background: section.chip.bg }}
    >
      <div className="h-5 w-[3px] rounded-[2px] shrink-0" style={{ background: section.chip.bar }} />
      <span className="text-[13px] font-semibold leading-none" style={{ color: section.chip.text }}>
        {section.label}
      </span>
    </div>
  );
}

function SectionPanel({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-[108px]">
      {children}
    </section>
  );
}

// ─── Colors ──────────────────────────────────────────────────────────────────

function SwatchRow({ label, colors }: { label: string; colors: Record<string, string> }) {
  return (
    <div className="flex flex-col gap-1">
      <SubLabel>{label}</SubLabel>
      <div className="flex gap-0.5 rounded-lg overflow-hidden h-11">
        {Object.entries(colors).map(([step, hex]) => (
          <div
            key={step}
            className="flex-1 flex items-end px-1.5 py-1 relative group cursor-default"
            style={{ background: hex }}
          >
            <span
              className="text-[9px] font-bold leading-none select-none"
              style={{ color: parseInt(step) >= 400 ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.35)" }}
            >
              {step}
            </span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/10 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ColorsSection() {
  const semanticColors = [
    { name: "Success", hex: tokens.semantic.success },
    { name: "Warning", hex: tokens.semantic.warning },
    { name: "Error", hex: tokens.semantic.error },
    { name: "Info", hex: tokens.semantic.info },
    { name: "Purple", hex: tokens.semantic.purple },
  ];
  return (
    <div className="p-6 space-y-5">
      <SectionLabel>Цвета</SectionLabel>
      <div className="grid grid-cols-2 gap-x-8 gap-y-5">
        <SwatchRow label="Brand (Braun)" colors={tokens.brand} />
        <SwatchRow label="Primary (Blue)" colors={tokens.blue} />
        <SwatchRow label="Neutral (Cool Gray)" colors={tokens.neutral} />
        <div className="flex flex-col gap-1">
          <SubLabel>Semantic</SubLabel>
          <div className="flex gap-1 items-center flex-wrap">
            {semanticColors.map((c) => (
              <div key={c.name} className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-[4px]" style={{ background: c.hex }} />
                <span className="text-[10px] text-[#9d99ac] dark:text-[#6b6f85]">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Typography ───────────────────────────────────────────────────────────────

const typeScale = [
  { token: "text-display", label: "Display", size: "36px", weight: "700", tracking: "−2%", sample: "Заголовок экрана", sampleSize: 36 },
  { token: "text-h1",      label: "H1",      size: "28px", weight: "500", tracking: "−1%", sample: "Страница и раздел", sampleSize: 28 },
  { token: "text-h2",      label: "H2",      size: "22px", weight: "500", tracking: "−0.5%", sample: "Панель и модальное окно", sampleSize: 22 },
  { token: "text-h3",      label: "H3",      size: "18px", weight: "500", tracking: "0", sample: "Карточка и группа", sampleSize: 18 },
  { token: "text-h4",      label: "H4",      size: "16px", weight: "500", tracking: "0", sample: "Подзаголовок строки", sampleSize: 16 },
  { token: "text-body-lg", label: "Body LG", size: "16px", weight: "400", tracking: "0", sample: "Основной текст крупный", sampleSize: 16 },
  { token: "text-body",    label: "Body",    size: "14px", weight: "400", tracking: "0", sample: "Обычный текст интерфейса", sampleSize: 14 },
  { token: "text-body-sm", label: "Body SM", size: "13px", weight: "400", tracking: "0", sample: "Подпись и вспомогательный текст", sampleSize: 13 },
  { token: "text-caption", label: "Caption", size: "11px", weight: "400", tracking: "+1%", sample: "Метка и капшен компонента", sampleSize: 11 },
];

function TypographySection() {
  return (
    <div className="p-6">
      <SectionLabel>Типографика · Roboto</SectionLabel>
      <div className="divide-y divide-[#e3eaf4]">
        {typeScale.map((row) => (
          <div key={row.label} className="flex items-center py-4 gap-6">
            <div className="w-36 shrink-0 flex flex-col gap-0.5">
              <span className="text-[11px] font-medium text-[#6e6b7b] dark:text-[#8b8fa8]">{row.label}</span>
              <span className="text-[11px] text-[#9d99ac] dark:text-[#6b6f85] leading-snug">
                {row.size} · {row.weight === "700" ? "Bold" : row.weight === "500" ? "Medium" : "Regular"}
                {row.tracking !== "0" && ` · ${row.tracking}`}
              </span>
            </div>
            <div
              className="text-[#332c38] dark:text-[#e8e9ef] leading-tight"
              style={{ fontSize: row.sampleSize, fontWeight: row.weight }}
            >
              {row.sample}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Spacing ──────────────────────────────────────────────────────────────────

const spacingScale = [
  { px: 4,   label: "4px",   token: "space-1",  color: "#bae0ff" },
  { px: 8,   label: "8px",   token: "space-2",  color: "#93c5fd" },
  { px: 16,  label: "16px",  token: "space-4",  color: "#86efac" },
  { px: 24,  label: "24px",  token: "space-6",  color: "#fde68a" },
  { px: 32,  label: "32px",  token: "space-8",  color: "#fca5a5" },
  { px: 48,  label: "48px",  token: "space-12", color: "#d8b4fe" },
  { px: 64,  label: "64px",  token: "space-16", color: "#fb923c" },
  { px: 96,  label: "96px",  token: "space-24", color: "#6ee7b7" },
  { px: 128, label: "128px", token: "space-32", color: "#f472b6" },
];

type SpacingItem = { px: number; label: string; token: string; color: string };

// A block of content with spacing overlays between elements
function BreakpointPreview({ label, width, scale }: {
  label: string; width: number; scale: number;
}) {
  const items: { type: string; content: string; spacingBefore?: SpacingItem }[] = [
    { type: "h1",   content: "H1. Вертикальные отступы" },
    { type: "gap",  content: "", spacingBefore: spacingScale[2] },
    { type: "body", content: "Если разобрать макет по элементам и посмотреть на вертикальные отступы между ними — вырисовываются закономерности. Разных отступов на отдельно взятом сайте немного." },
    { type: "gap",  content: "", spacingBefore: spacingScale[3] },
    { type: "btn",  content: "Действие" },
    { type: "gap",  content: "", spacingBefore: spacingScale[4] },
    { type: "h2",   content: "H2. Как устроена система" },
    { type: "gap",  content: "", spacingBefore: spacingScale[2] },
    { type: "body", content: "Все элементы страницы группируются в блоки. Блоки выстраиваются по правилам, которые придумал дизайнер. Вертикальные отступы разделены по уровням." },
    { type: "gap",  content: "", spacingBefore: spacingScale[1] },
    { type: "body", content: "Первый уровень — самый невысокий отступ. Отступ шестого уровня отбивает два крупных блока." },
    { type: "gap",  content: "", spacingBefore: spacingScale[3] },
    { type: "h3",   content: "H3. Закон Фиттса и геометрическая прогрессия" },
    { type: "gap",  content: "", spacingBefore: spacingScale[2] },
    { type: "body", content: "Закон Фиттса подтверждается в UI. Блоки выстраиваются по уровням, которые придумал дизайнер. Простой пример: отступ первого уровня (4px) — между двумя кнопками." },
  ];

  const fs = (base: number) => Math.round(base * scale);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-[#6e6b7b] dark:text-[#8b8fa8] uppercase tracking-wide">{label}</span>
        <span className="text-[10px] text-[#b8bfcc] dark:text-[#3a3d50] font-mono">{width}px</span>
      </div>
      <div
        className="bg-white dark:bg-[#161820] rounded-xl border border-[#e3eaf4] dark:border-[#2a2c3a] overflow-hidden"
        style={{ width: "100%" }}
      >
        <div className="p-3">
          {items.map((item, i) => {
            if (item.type === "gap" && item.spacingBefore) {
              const sp = item.spacingBefore;
              const h = Math.max(fs(sp.px * 0.45), 6);
              return (
                <div
                  key={i}
                  className="relative flex items-center"
                  style={{ height: h, marginBottom: 0 }}
                >
                  <div
                    className="absolute inset-0 rounded-[2px] opacity-70"
                    style={{ background: sp.color }}
                  />
                  <span
                    className="relative z-10 px-1.5 text-[9px] font-bold text-[#332c38] dark:text-[#e8e9ef]/70 leading-none whitespace-nowrap"
                  >
                    {sp.label}
                  </span>
                </div>
              );
            }
            if (item.type === "h1") return (
              <div key={i} className="font-bold text-[#171a24] dark:text-[#e8e9ef]" style={{ fontSize: fs(14), lineHeight: 1.25 }}>{item.content}</div>
            );
            if (item.type === "h2") return (
              <div key={i} className="font-bold text-[#171a24] dark:text-[#e8e9ef]" style={{ fontSize: fs(12), lineHeight: 1.3 }}>{item.content}</div>
            );
            if (item.type === "h3") return (
              <div key={i} className="font-semibold text-[#171a24] dark:text-[#e8e9ef]" style={{ fontSize: fs(10.5), lineHeight: 1.35 }}>{item.content}</div>
            );
            if (item.type === "body") return (
              <div key={i} className="text-[#6e6b7b] dark:text-[#8b8fa8]" style={{ fontSize: fs(8.5), lineHeight: 1.5 }}>{item.content}</div>
            );
            if (item.type === "btn") return (
              <div key={i}
                className="inline-flex items-center rounded-md text-white font-semibold"
                style={{ background: "#0080ff", fontSize: fs(8.5), padding: `${fs(4)}px ${fs(10)}px` }}
              >{item.content}</div>
            );
            return null;
          })}
        </div>
      </div>
    </div>
  );
}

function SpacingSection() {
  return (
    <div className="p-6 space-y-8">
      <SectionLabel>Отступы · Spacing</SectionLabel>

      {/* Rule */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9d99ac] dark:text-[#6b6f85] mb-3">Принцип</p>
        <p className="text-[22px] font-bold text-[#171a24] dark:text-[#e8e9ef] mb-1">Все отступы кратны 2, 4, 8</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {spacingScale.map((s) => (
            <div key={s.px} className="flex flex-col items-center gap-1">
              <div
                className="rounded-[3px] shrink-0"
                style={{ background: s.color, width: 28, height: 28 }}
              />
              <span className="text-[10px] font-mono text-[#6e6b7b] dark:text-[#8b8fa8]">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scale bars */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9d99ac] dark:text-[#6b6f85] mb-3">Шкала</p>
        <div className="space-y-1.5">
          {spacingScale.map((s) => (
            <div key={s.px} className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-[#9d99ac] dark:text-[#6b6f85] w-10 text-right shrink-0">{s.label}</span>
              <div
                className="rounded-[3px] h-5 flex items-center px-1.5"
                style={{ background: s.color, width: Math.round(s.px * 2.4) }}
              >
                <span className="text-[9px] font-bold text-[#332c38] dark:text-[#e8e9ef]/60 whitespace-nowrap">{s.token}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Breakpoint demos */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9d99ac] dark:text-[#6b6f85] mb-4">Адаптация по брейкпоинтам</p>
        <div className="grid grid-cols-3 gap-5">
          <BreakpointPreview label="Mobile" width={375} scale={0.72} />
          <BreakpointPreview label="Tablet" width={768} scale={0.88} />
          <BreakpointPreview label="Desktop" width={1280} scale={1.0} />
        </div>
      </div>
    </div>
  );
}

// ─── Buttons ─────────────────────────────────────────────────────────────────

type BtnVariant = "primary" | "secondary" | "ghost" | "destructive" | "outline";
type BtnSize = "xs" | "sm" | "md" | "lg" | "xl";
type BtnState = "default" | "hover" | "focused" | "active" | "disabled";

const btnSizeConfig: Record<BtnSize, { px: string; py: string; text: string; iconSize: number; gap: string; label: string }> = {
  xl:  { px: "px-5",   py: "py-3",   text: "text-[15px]", iconSize: 16, gap: "gap-2",   label: "Large" },
  lg:  { px: "px-4",   py: "py-2.5", text: "text-[14px]", iconSize: 15, gap: "gap-1.5", label: "Normal" },
  md:  { px: "px-3.5", py: "py-2",   text: "text-[13px]", iconSize: 14, gap: "gap-1.5", label: "Medium" },
  sm:  { px: "px-3",   py: "py-1.5", text: "text-[12px]", iconSize: 13, gap: "gap-1",   label: "Small" },
  xs:  { px: "px-2.5", py: "py-1",   text: "text-[11px]", iconSize: 12, gap: "gap-1",   label: "Extra small" },
};

const btnVariantConfig: Record<BtnVariant, Record<BtnState, string>> = {
  primary: {
    default:  "bg-[#0080ff] text-white shadow-sm",
    hover:    "bg-[#006fe0] text-white shadow-sm",
    focused:  "bg-[#0080ff] text-white ring-2 ring-[#0080ff]/30 ring-offset-1",
    active:   "bg-[#005abf] text-white shadow-inner",
    disabled: "bg-[#0080ff]/30 text-white cursor-not-allowed",
  },
  secondary: {
    default:  "bg-[#edf2fb] dark:bg-[#1e2028] text-[#332c38] dark:text-[#e8e9ef] border border-[#e3eaf4] dark:border-[#2a2c3a]",
    hover:    "bg-[#e3eaf4] dark:bg-[#2a2c3a] text-[#332c38] dark:text-[#e8e9ef] border border-[#d6dde8]",
    focused:  "bg-[#edf2fb] dark:bg-[#1e2028] text-[#332c38] dark:text-[#e8e9ef] border border-[#0080ff] ring-2 ring-[#0080ff]/20",
    active:   "bg-[#d6dde8] text-[#332c38] dark:text-[#e8e9ef] border border-[#d6dde8]",
    disabled: "bg-[#f5f7fa] dark:bg-[#1e2028] text-[#9d99ac] dark:text-[#6b6f85] border border-[#e3eaf4] dark:border-[#2a2c3a] cursor-not-allowed",
  },
  outline: {
    default:  "bg-white dark:bg-[#161820] text-[#0080ff] border border-[#0080ff]",
    hover:    "bg-[#e6f2ff] text-[#0080ff] border border-[#0080ff]",
    focused:  "bg-white dark:bg-[#161820] text-[#0080ff] border border-[#0080ff] ring-2 ring-[#0080ff]/20",
    active:   "bg-[#bae0ff] text-[#005abf] dark:text-[#6eb3ff] border border-[#005abf]",
    disabled: "bg-white dark:bg-[#161820] text-[#9d99ac] dark:text-[#6b6f85] border border-[#e3eaf4] dark:border-[#2a2c3a] cursor-not-allowed",
  },
  ghost: {
    default:  "bg-transparent text-[#4f4d5b] dark:text-[#a0a3b8]",
    hover:    "bg-[#f5f7fa] dark:bg-[#1e2028] text-[#332c38] dark:text-[#e8e9ef]",
    focused:  "bg-transparent text-[#332c38] dark:text-[#e8e9ef] ring-2 ring-[#0080ff]/20",
    active:   "bg-[#e3eaf4] dark:bg-[#2a2c3a] text-[#171a24] dark:text-[#e8e9ef]",
    disabled: "bg-transparent text-[#b8bfcc] dark:text-[#3a3d50] cursor-not-allowed",
  },
  destructive: {
    default:  "bg-[#ef4444] text-white shadow-sm",
    hover:    "bg-[#dc2626] text-white shadow-sm",
    focused:  "bg-[#ef4444] text-white ring-2 ring-[#ef4444]/30 ring-offset-1",
    active:   "bg-[#b91c1c] text-white shadow-inner",
    disabled: "bg-[#ef4444]/30 text-white cursor-not-allowed",
  },
};

const STATES: BtnState[] = ["default", "hover", "focused", "active", "disabled"];
const stateLabel: Record<BtnState, string> = {
  default: "Default", hover: "Hover", focused: "Focused", active: "Active", disabled: "Disabled",
};

function BtnStatic({
  variant, size, state, iconPos = "none",
}: {
  variant: BtnVariant; size: BtnSize; state: BtnState; iconPos?: "none" | "left" | "right" | "only";
}) {
  const s = btnSizeConfig[size];
  const v = btnVariantConfig[variant][state];
  const base = `inline-flex items-center ${s.gap} font-medium rounded-lg select-none transition-none`;
  const iconEl = <Settings size={s.iconSize} />;
  return (
    <div className={`${base} ${s.px} ${s.py} ${s.text} ${v}`}>
      {iconPos === "left"  && <span className="shrink-0">{iconEl}</span>}
      {iconPos === "only"  ? <span className="shrink-0">{iconEl}</span> : <span>Кнопка</span>}
      {iconPos === "right" && <span className="shrink-0">{iconEl}</span>}
    </div>
  );
}

const ICON_POSITIONS: { key: "none"|"left"|"right"|"only"; label: string }[] = [
  { key: "none",  label: "Без иконки" },
  { key: "left",  label: "Иконка слева" },
  { key: "right", label: "Иконка справа" },
];

function ButtonVariantMatrix({ variant, label }: { variant: BtnVariant; label: string }) {
  const sizes: BtnSize[] = ["xl", "lg", "md", "sm", "xs"];
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold text-[#0080ff] uppercase tracking-wide mb-2">{label}</p>
      <div className="overflow-x-auto">
        <table className="border-collapse text-left w-full">
          <thead>
            <tr>
              <th className="text-[10px] font-semibold text-[#9d99ac] dark:text-[#6b6f85] uppercase w-20 pb-2 pr-3">Размер</th>
              <th className="text-[10px] font-semibold text-[#9d99ac] dark:text-[#6b6f85] uppercase w-24 pb-2 pr-3">Позиция</th>
              {STATES.map(s => (
                <th key={s} className="text-[10px] font-semibold text-[#9d99ac] dark:text-[#6b6f85] pb-2 pr-4 whitespace-nowrap">{stateLabel[s]}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f3f8] dark:divide-[#2a2c3a]">
            {sizes.map(size =>
              ICON_POSITIONS.map((pos, pi) => (
                <tr key={`${size}-${pos.key}`} className="align-middle">
                  <td className="py-2 pr-3 align-middle">
                    {pi === 0 && (
                      <span className="text-[11px] font-semibold text-[#4f4d5b] dark:text-[#a0a3b8] whitespace-nowrap">
                        {btnSizeConfig[size].label}
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-3 align-middle">
                    <span className="text-[10px] text-[#9d99ac] dark:text-[#6b6f85]">{pos.label}</span>
                  </td>
                  {STATES.map(state => (
                    <td key={state} className="py-2 pr-4 align-middle">
                      <BtnStatic variant={variant} size={size} state={state} iconPos={pos.key} />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IconOnlyMatrix() {
  const sizes: BtnSize[] = ["xl", "lg", "md", "sm", "xs"];
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold text-[#0080ff] uppercase tracking-wide mb-2">Icon Only</p>
      <table className="border-collapse text-left">
        <thead>
          <tr>
            <th className="text-[10px] font-semibold text-[#9d99ac] dark:text-[#6b6f85] uppercase w-24 pb-2 pr-4">Размер</th>
            {STATES.map(s => (
              <th key={s} className="text-[10px] font-semibold text-[#9d99ac] dark:text-[#6b6f85] pb-2 pr-4 whitespace-nowrap">{stateLabel[s]}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f0f3f8] dark:divide-[#2a2c3a]">
          {sizes.map(size => (
            <tr key={size} className="align-middle">
              <td className="py-2 pr-4 text-[11px] font-semibold text-[#4f4d5b] dark:text-[#a0a3b8]">{btnSizeConfig[size].label}</td>
              {STATES.map(state => (
                <td key={state} className="py-2 pr-4">
                  <BtnStatic variant="primary" size={size} state={state} iconPos="only" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ButtonsSection() {
  const [activeVariant, setActiveVariant] = useState<BtnVariant>("primary");
  const variants: { key: BtnVariant; label: string }[] = [
    { key: "primary",     label: "Primary" },
    { key: "secondary",   label: "Secondary" },
    { key: "outline",     label: "Outline" },
    { key: "ghost",       label: "Ghost" },
    { key: "destructive", label: "Destructive" },
  ];
  return (
    <div className="p-6 space-y-6">
      <SectionLabel>Кнопки</SectionLabel>

      {/* Platform rule */}
      <div className="flex items-start gap-3 bg-[#fff7e6] border border-[#fcd34d] rounded-xl px-4 py-3">
        <AlertTriangle size={15} className="text-[#d97706] shrink-0 mt-0.5" />
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#92400e] block mb-0.5">Правило платформы</span>
          <span className="text-[13px] text-[#78350f]">Кнопки в размере <strong>Large</strong> в mobile не использовать</span>
        </div>
      </div>

      {/* Variant tabs */}
      <div className="border-b border-[#e3eaf4] dark:border-[#2a2c3a]">
        <div className="flex gap-1">
          {variants.map(v => (
            <button
              key={v.key}
              onClick={() => setActiveVariant(v.key)}
              className={`px-3 py-2 text-[12px] font-medium relative transition-colors
                ${activeVariant === v.key ? "text-[#0080ff]" : "text-[#9d99ac] dark:text-[#6b6f85] hover:text-[#6e6b7b] dark:text-[#8b8fa8]"}`}
            >
              {v.label}
              {activeVariant === v.key && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0080ff]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix */}
      <ButtonVariantMatrix
        variant={activeVariant}
        label={variants.find(v => v.key === activeVariant)?.label ?? ""}
      />

      {/* Icon only */}
      <div className="pt-2 border-t border-[#f0f3f8] dark:border-[#2a2c3a]">
        <IconOnlyMatrix />
      </div>
    </div>
  );
}

// ─── Inputs ───────────────────────────────────────────────────────────────────

type FieldState = "empty" | "filled" | "focused" | "disabled" | "error" | "loading" | "success";

const FIELD_STATES: FieldState[] = ["empty", "filled", "focused", "disabled", "error", "loading", "success"];

const fieldStateLabel: Record<FieldState, string> = {
  empty: "Empty", filled: "Filled", focused: "Focused",
  disabled: "Disabled", error: "Error", loading: "Loading", success: "Success",
};

function Spinner() {
  return (
    <div className="w-3 h-3 border-2 border-[#e3eaf4] dark:border-[#2a2c3a] border-t-[#0080ff] rounded-full animate-spin shrink-0" />
  );
}

type FieldType = "basic" | "with-icon" | "search" | "dropdown" | "password" | "textarea" | "multiselect";

// Floating label input cell
function FieldCell({ type, state }: { type: FieldType; state: FieldState }) {
  const isEmpty   = state === "empty";
  const isFilled  = state === "filled" || state === "focused" || state === "error" || state === "loading" || state === "success";
  const isDisabled = state === "disabled";
  const isError   = state === "error";
  const isLoading = state === "loading";
  const isSuccess = state === "success";
  const isFocused = state === "focused";
  const isTextarea = type === "textarea";
  const isDropdown = type === "dropdown";
  const isPassword = type === "password";
  const isSearch   = type === "search";
  const isMulti    = type === "multiselect";

  // label names per type
  const labelMap: Record<FieldType, string> = {
    basic:      "Наименование",
    "with-icon":"Сумма",
    search:     "Поиск",
    dropdown:   "Категория",
    password:   "Пароль",
    textarea:   "Описание",
    multiselect:"Теги",
  };
  const label = labelMap[type];

  // value text shown when filled
  const valueMap: Record<FieldType, string> = {
    basic:      "Капучино 300мл",
    "with-icon":"₽ 290",
    search:     "Кофемашина",
    dropdown:   "Центральный",
    password:   "••••••••",
    textarea:   "Вкусный напиток из эспрессо с молоком...",
    multiselect:"",
  };
  const value = valueMap[type];

  // border / ring styles
  const borderCls = isError   ? "border-[#ef4444] ring-1 ring-[#ef4444]/15"
    : isFocused  ? "border-[#0080ff] ring-2 ring-[#0080ff]/15"
    : isSuccess  ? "border-[#22c55e] ring-1 ring-[#22c55e]/10"
    : isDisabled ? "border-[#e3eaf4] dark:border-[#2a2c3a] bg-[#f5f7fa] dark:bg-[#1e2028]"
    : "border-[#e3eaf4] dark:border-[#2a2c3a]";

  // floating label color
  const labelColorCls = isError   ? "text-[#ef4444]"
    : isFocused  ? "text-[#0080ff]"
    : isDisabled ? "text-[#b8bfcc] dark:text-[#3a3d50]"
    : isFilled   ? "text-[#6e6b7b] dark:text-[#8b8fa8]"
    : "text-[#9d99ac] dark:text-[#6b6f85]";

  // hint below
  const hint = isError   ? { text: "Неверный формат", cls: "text-[#ef4444]" }
    : isSuccess  ? { text: "Подтверждено", cls: "text-[#16a34a]" }
    : isEmpty && !isDisabled ? { text: "Необязательно", cls: "text-[#9d99ac] dark:text-[#6b6f85]" }
    : null;

  const chips = ["Лента", "Центральный"];

  const hasRightControl =
    isLoading ||
    isSuccess ||
    isError ||
    isDropdown ||
    isPassword ||
    type === "with-icon" ||
    isMulti;

  const innerPadCls = isTextarea
    ? "px-3 pt-4 pb-2 min-h-[64px]"
    : isMulti
      ? "h-[46px] px-3"
      : [
          "h-[46px] min-w-0 px-3",
          isSearch ? "pl-7" : "",
          isFilled && !isSearch ? "pt-[3px]" : "",
          hasRightControl ? "pr-8" : "",
        ].join(" ");

  return (
    <div className="flex flex-col gap-0.5 w-[148px]">
      <div
        className={`relative border rounded-lg transition-none bg-input-background ${borderCls} ${isDisabled ? "opacity-50" : ""} ${isTextarea ? "min-h-[64px]" : ""}`}
      >
        {/* Search icon prefix */}
        {isSearch && (
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9d99ac] dark:text-[#6b6f85]">
            <Search size={12} />
          </div>
        )}

        <div className={`flex flex-col justify-center ${innerPadCls}`}>
          {/* Floating label */}
          {!isSearch && !isMulti && (
            <span
              className={`block font-medium leading-none transition-none ${labelColorCls} ${
                isFilled
                  ? "text-[11px] mb-0.5"
                  : "text-[14px]"
              }`}
            >
              {label}
            </span>
          )}

          {/* Value / placeholder for search */}
          {isSearch && (
            <span className={`text-[14px] ${isEmpty ? "text-[#b8bfcc] dark:text-[#3a3d50]" : "text-[#171a24] dark:text-[#e8e9ef]"}`}>
              {isEmpty ? "Поиск..." : value}
            </span>
          )}

          {/* Value */}
          {!isSearch && !isMulti && isFilled && (
            <span className={`block truncate text-[14px] font-normal leading-tight ${isDisabled ? "text-[#9d99ac] dark:text-[#6b6f85]" : "text-[#171a24] dark:text-[#e8e9ef]"}`}>
              {value}
            </span>
          )}

          {/* Multi-select */}
          {isMulti && (
            <div className="flex items-center gap-1 flex-wrap py-1.5">
              <span className="text-[10px] text-[#9d99ac] dark:text-[#6b6f85] shrink-0">{label}</span>
              {isFilled && chips.map(c => (
                <span key={c} className="inline-flex items-center gap-0.5 bg-[#e6f2ff] text-[#005abf] dark:text-[#6eb3ff] text-[9px] font-medium px-1.5 py-0.5 rounded-full">
                  {c}
                  <X size={8} />
                </span>
              ))}
              {isFilled && (
                <span className="text-[9px] font-semibold text-[#0080ff]">+3</span>
              )}
            </div>
          )}
        </div>

        {/* Right-side controls */}
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && <Spinner />}
          {!isLoading && isSuccess && <CheckCircle size={12} className="text-[#22c55e]" />}
          {!isLoading && isError   && <AlertCircle size={12} className="text-[#ef4444]" />}
          {!isLoading && isDropdown && <ChevronDown size={12} className="text-[#9d99ac] dark:text-[#6b6f85]" />}
          {!isLoading && isPassword && <Eye size={12} className="text-[#9d99ac] dark:text-[#6b6f85]" />}
          {!isLoading && type === "with-icon" && !isError && !isSuccess && (
            <Settings size={12} className="text-[#9d99ac] dark:text-[#6b6f85]" />
          )}
          {isMulti && !isLoading && (
            <>
              <X size={11} className="text-[#9d99ac] dark:text-[#6b6f85]" />
              <ChevronDown size={11} className="text-[#9d99ac] dark:text-[#6b6f85]" />
            </>
          )}
        </div>

        {/* Textarea resize handle */}
        {isTextarea && (
          <div className="absolute bottom-1 right-1 text-[#d6dde8] dark:text-[#3a3d50]">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M7 1L1 7M7 4L4 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
        )}
      </div>

      {/* Hint text */}
      {hint && (
        <span className={`text-[12px] leading-tight ${hint.cls}`}>{hint.text}</span>
      )}
    </div>
  );
}

const FIELD_TYPES: { key: FieldType; label: string }[] = [
  { key: "basic",      label: "Input" },
  { key: "with-icon",  label: "Input + Icon" },
  { key: "search",     label: "Search" },
  { key: "dropdown",   label: "Dropdown" },
  { key: "password",   label: "Password" },
  { key: "textarea",   label: "Textarea" },
  { key: "multiselect",label: "Multi-select" },
];

function InputsSection() {
  return (
    <div className="p-6 space-y-6">
      <SectionLabel>Поля ввода</SectionLabel>

      {/* Rule */}
      <div className="flex items-start gap-3 bg-[#f0f9ff] border border-[#93c5fd] rounded-xl px-4 py-3">
        <Info size={15} className="text-[#2563eb] shrink-0 mt-0.5" />
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#1e3a8a] block mb-0.5">Паттерн</span>
          <span className="text-[13px] text-[#1d4ed8]">Floating label — метка уезжает наверх при вводе и остаётся там пока поле заполнено</span>
        </div>
      </div>

      {/* Matrix */}
      <div className="overflow-x-auto pb-2">
        <table className="border-collapse text-left">
          <thead>
            <tr>
              <th className="text-[10px] font-semibold text-[#9d99ac] dark:text-[#6b6f85] uppercase pr-5 pb-3 w-32 whitespace-nowrap">Тип</th>
              {FIELD_STATES.map(s => (
                <th key={s} className="text-[10px] font-semibold text-[#9d99ac] dark:text-[#6b6f85] uppercase pb-3 pr-4 whitespace-nowrap">
                  {fieldStateLabel[s]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f3f8] dark:divide-[#2a2c3a]">
            {FIELD_TYPES.map(({ key, label }) => (
              <tr key={key} className="align-top">
                <td className="py-3 pr-5">
                  <span className="text-[12px] font-semibold text-[#4f4d5b] dark:text-[#a0a3b8] whitespace-nowrap">{label}</span>
                </td>
                {FIELD_STATES.map(state => (
                  <td key={state} className="py-3 pr-4">
                    <FieldCell type={key} state={state} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dropdown — рабочий пример */}
      <div className="pt-2 border-t border-[#f0f3f8] dark:border-[#2a2c3a]">
        <SubLabel>Dropdown — рабочий select</SubLabel>
        <div className="flex gap-8 items-start">
          <DropdownDemo />
        </div>
      </div>

      {/* Multi-select dropdown showcase */}
      <div className="pt-2 border-t border-[#f0f3f8] dark:border-[#2a2c3a]">
        <SubLabel>Multi-select — на Popover</SubLabel>
        <div className="flex items-start gap-3 bg-[#f0fdf4] border border-[#86efac] rounded-xl px-4 py-3 mb-4 max-w-[560px]">
          <CheckCircle size={15} className="text-[#16a34a] shrink-0 mt-0.5" />
          <span className="text-[13px] text-[#166534]">
            Единый компонент <strong>MultiSelectField</strong> на Radix Popover — тот же, что в разделе
            «Toolbar &amp; Filters». Поиск появляется от 7 пунктов, «Применить / Сбросить» — от 16.
            Пустой выбор в режиме фильтра = «Все».
          </span>
        </div>
        <MultiSelectDemo />
      </div>

    </div>
  );
}

function DropdownDemo() {
  const [category, setCategory] = useState("Центральный");
  const [status, setStatus] = useState("Все");

  return (
    <div className="flex flex-wrap gap-10 items-start">
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold text-[#9d99ac] dark:text-[#6b6f85] uppercase tracking-wide">Форма</span>
        <CompactSelect
          label="Категория"
          value={category}
          options={["Центральный", "Северный", "Лента", "Южный", "Восточный"]}
          onChange={setCategory}
          className="w-[280px]"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-semibold text-[#9d99ac] dark:text-[#6b6f85] uppercase tracking-wide">Фильтр (метка всегда наверху)</span>
        <CompactSelect
          label="Статус"
          value={status}
          options={["Все", "Принят", "В работе", "Доставлен", "Отменён"]}
          onChange={setStatus}
          className="w-[220px]"
        />
      </div>
    </div>
  );
}

function MultiSelectDemo() {
  const POINTS = ["Центральный", "Северный", "Лента", "Южный", "Восточный", "Западный"];
  const [wherePoints, setWherePoints] = useState<string[]>(["Центральный", "Лента"]);
  const [filterPoints, setFilterPoints] = useState<string[]>([]);

  return (
    <div className="flex flex-wrap gap-10 items-start">
      {/* Обычный режим — метка + чипы (inline-метка требует широкого поля) */}
      <div className="flex w-[360px] flex-col gap-1.5">
        <span className="text-[11px] font-semibold text-[#9d99ac] dark:text-[#6b6f85] uppercase tracking-wide">
          Форма — метка + чипы (inline)
        </span>
        <MultiSelectField
          options={POINTS}
          selected={wherePoints}
          onChange={setWherePoints}
          label="Где продавать"
          placeholder="Выберите точки..."
        />
      </div>

      {/* Режим фильтра — floating label + emptyLabel «Все» */}
      <div className="flex w-[280px] flex-col gap-1.5">
        <span className="text-[11px] font-semibold text-[#9d99ac] dark:text-[#6b6f85] uppercase tracking-wide">
          Фильтр — floating label, пусто = «Все»
        </span>
        <MultiSelectField
          options={POINTS}
          selected={filterPoints}
          onChange={setFilterPoints}
          filterLabel="Где продавать"
          emptyLabel="Все"
        />
      </div>

      {/* Anatomy breakdown */}
      <div className="flex flex-col gap-3 pt-1">
        <span className="text-[11px] font-semibold text-[#9d99ac] dark:text-[#6b6f85] uppercase tracking-wide">Анатомия</span>
        {[
          { color: "#0080ff", label: "Popover-триггер: метка + чипы (или floating-label в режиме фильтра)" },
          { color: "#22c55e", label: "Поиск внутри списка — авто от 7 пунктов" },
          { color: "#f59e0b", label: "«Выбрать все» с индетерминированным чекбоксом" },
          { color: "#5a4d6b", label: "Опция с чекбоксом, подсветка при выборе" },
          { color: "#ef4444", label: "«Применить / Сбросить» — авто от 16 пунктов" },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
            <span className="text-[13px] text-[#4f4d5b] dark:text-[#a0a3b8]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shadows ─────────────────────────────────────────────────────────────────

const shadowLevels = [
  {
    token: "shadow-xs",
    value: "0 1px 2px rgba(0,0,0,0.06)",
    label: "XS",
    usage: "Инпуты при hover, subtle-карточки",
    example: "Input field",
  },
  {
    token: "shadow-sm",
    value: "0 1px 4px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.04)",
    label: "SM",
    usage: "Карточки, чекбоксы, кнопки",
    example: "Card",
  },
  {
    token: "shadow-md",
    value: "0 4px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)",
    label: "MD",
    usage: "Дропдауны, поповеры, тултипы",
    example: "Dropdown",
  },
  {
    token: "shadow-lg",
    value: "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)",
    label: "LG",
    usage: "Модальные окна, боковые панели",
    example: "Modal",
  },
  {
    token: "shadow-xl",
    value: "0 16px 40px rgba(0,0,0,0.14), 0 4px 12px rgba(0,0,0,0.08)",
    label: "XL",
    usage: "Глобальные оверлеи, командные палитры",
    example: "Command palette",
  },
];

function ShadowsSection() {
  return (
    <div className="p-6 space-y-8">
      <SectionLabel>Тени · Elevation</SectionLabel>

      {/* Rule */}
      <div className="flex items-start gap-3 bg-[#f5f3ff] border border-[#d8b4fe] rounded-xl px-4 py-3">
        <Info size={15} className="text-[#7c3aed] shrink-0 mt-0.5" />
        <span className="text-[13px] text-[#5b21b6]">
          Тень определяет <strong>уровень слоя</strong> (elevation). Чем выше элемент над страницей — тем больше тень. Никогда не используй тень выше уровня компонента.
        </span>
      </div>

      {/* Elevation scale */}
      <div>
        <SubLabel>Шкала уровней</SubLabel>
        <div className="flex items-end gap-6 flex-wrap">
          {shadowLevels.map((s) => (
            <div key={s.token} className="flex flex-col items-center gap-3">
              {/* Card demo */}
              <div
                className="w-[120px] h-[80px] bg-white dark:bg-[#161820] rounded-xl flex items-center justify-center"
                style={{ boxShadow: s.value }}
              >
                <span className="text-[11px] font-semibold text-[#9d99ac] dark:text-[#6b6f85]">{s.example}</span>
              </div>
              {/* Meta */}
              <div className="text-center">
                <div className="text-[12px] font-bold text-[#332c38] dark:text-[#e8e9ef]">{s.label}</div>
                <div className="text-[10px] font-mono text-[#9d99ac] dark:text-[#6b6f85]">{s.token}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage table */}
      <div>
        <SubLabel>Применение</SubLabel>
        <div className="bg-white dark:bg-[#161820] rounded-xl border border-[#e3eaf4] dark:border-[#2a2c3a] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[#f5f7fa] dark:bg-[#1e2028] border-b border-[#e3eaf4] dark:border-[#2a2c3a]">
                {["Уровень", "Токен", "CSS-значение", "Где использовать"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#9d99ac] dark:text-[#6b6f85]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f3f8] dark:divide-[#2a2c3a]">
              {shadowLevels.map((s) => (
                <tr key={s.token} className="hover:bg-[#fafbfd] dark:bg-[#161820] transition-colors">
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#f5f3ff] text-[11px] font-bold text-[#7c3aed]">{s.label}</span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-[#5b21b6]">{s.token}</td>
                  <td className="px-4 py-2.5 font-mono text-[11px] text-[#9d99ac] dark:text-[#6b6f85] max-w-[240px] truncate">{s.value}</td>
                  <td className="px-4 py-2.5 text-[#4f4d5b] dark:text-[#a0a3b8]">{s.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function ModalShell({
  open, onClose, width = 480, children,
}: {
  open: boolean; onClose: () => void; width?: number; children: React.ReactNode;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-[#0f1117]/60 backdrop-blur-[3px]"
        onClick={onClose}
      />
      <div
        className="relative bg-white dark:bg-[#161820] flex flex-col overflow-hidden w-full"
        style={{
          maxWidth: width,
          maxHeight: "88vh",
          borderRadius: 12,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose: () => void }) {
  return (
    <div className={`flex ${subtitle ? "items-start" : "items-center"} justify-between px-6 pt-6 pb-5 shrink-0`}>
      <div className="flex flex-col gap-0.5">
        <h3 className="text-[17px] font-semibold text-[#171a24] dark:text-[#e8e9ef] leading-tight">{title}</h3>
        {subtitle && <p className="text-[13px] text-[#9d99ac] dark:text-[#6b6f85] leading-snug mt-0.5">{subtitle}</p>}
      </div>
      <button
        onClick={onClose}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9d99ac] dark:text-[#6b6f85] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] hover:text-[#4f4d5b] dark:text-[#a0a3b8] transition-colors shrink-0 ml-4 -mt-0.5"
      >
        <X size={16} />
      </button>
    </div>
  );
}

function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-[#f0f3f8] dark:border-[#2a2c3a] shrink-0">
      {children}
    </div>
  );
}

function BtnSecondary({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="h-9 px-4 text-[13px] font-medium text-[#4f4d5b] dark:text-[#a0a3b8] border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-lg hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] transition-colors"
    >
      {children}
    </button>
  );
}

function BtnPrimary({ onClick, children, danger }: { onClick: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`h-9 px-5 text-[13px] font-medium text-white rounded-lg transition-colors ${danger ? "bg-[#ef4444] hover:bg-[#dc2626]" : "bg-[#0080ff] hover:bg-[#006fe0]"}`}
    >
      {children}
    </button>
  );
}

// Floating label field inside modal
function ModalField({ label, value, type = "text" }: { label: string; value?: string; type?: string }) {
  const [val, setVal] = useState(value ?? "");
  const filled = val.length > 0;
  return (
    <div className="relative border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-lg bg-white dark:bg-[#161820] h-[52px] focus-within:border-[#0080ff] focus-within:ring-2 focus-within:ring-[#0080ff]/15 transition-all">
      <label
        className={`absolute left-3.5 transition-all pointer-events-none font-medium ${
          filled ? "top-2 text-[11px] text-[#9d99ac] dark:text-[#6b6f85]" : "top-1/2 -translate-y-1/2 text-[14px] text-[#9d99ac] dark:text-[#6b6f85]"
        }`}
      >
        {label}
      </label>
      <input
        type={type}
        value={val}
        onChange={e => setVal(e.target.value)}
        className="absolute inset-0 w-full h-full px-3.5 pb-1 pt-5 text-[14px] text-[#171a24] dark:text-[#e8e9ef] bg-transparent outline-none rounded-lg"
      />
    </div>
  );
}

function ModalSelect({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-lg bg-input-background h-[52px] transition-all hover:border-[#b8bfcc]">
      <span className="absolute left-3.5 top-2 text-[11px] font-medium text-[#9d99ac] dark:text-[#6b6f85]">{label}</span>
      <div className="absolute inset-0 flex items-end px-3.5 pt-5 pb-[5px] pr-8">
        <span className="text-[14px] text-[#171a24] dark:text-[#e8e9ef]">{value}</span>
      </div>
      <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9d99ac] dark:text-[#6b6f85]" />
    </div>
  );
}

// ── Тип 1: Создание / Сохранение ──
function ModalCreate() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="h-9 px-4 text-[13px] font-medium bg-[#0080ff] text-white rounded-lg hover:bg-[#006fe0] transition-colors">
        Создать запись
      </button>
      <ModalShell open={open} onClose={() => setOpen(false)} width={480}>
        <ModalHeader
          title="Создание единицы измерения"
          subtitle="Заполните поля — данные сохранятся в справочник"
          onClose={() => setOpen(false)}
        />
        <div className="px-6 pb-6 space-y-3 overflow-y-auto scrollbar-kit flex-1">
          <ModalField label="Наименование" />
          <ModalSelect label="Единица измерения кол-ва товара" value="шт" />
        </div>
        <ModalFooter>
          <BtnSecondary onClick={() => setOpen(false)}>Отменить</BtnSecondary>
          <BtnPrimary onClick={() => setOpen(false)}>Сохранить</BtnPrimary>
        </ModalFooter>
      </ModalShell>
    </>
  );
}

// ── Тип 2: Подтверждение удаления ──
function ModalDelete() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="h-9 px-4 text-[13px] font-medium bg-white dark:bg-[#161820] text-[#ef4444] border border-[#fca5a5] rounded-lg hover:bg-[#fef2f2] transition-colors">
        Удалить запись
      </button>
      <ModalShell open={open} onClose={() => setOpen(false)} width={440}>
        <ModalHeader
          title="Удалить «Капучино 300мл»?"
          subtitle="Это действие нельзя отменить"
          onClose={() => setOpen(false)}
        />
        <div className="px-6 pb-6 overflow-y-auto scrollbar-kit flex-1">
          <p className="text-[14px] text-[#4f4d5b] dark:text-[#a0a3b8] leading-relaxed">
            Запись будет удалена из справочника без возможности восстановления. Связанные заказы не будут затронуты.
          </p>
          <div className="mt-4 flex items-start gap-3 p-4 bg-[#fef2f2] border border-[#fca5a5] rounded-xl">
            <AlertCircle size={15} className="text-[#ef4444] shrink-0 mt-0.5" />
            <p className="text-[13px] text-[#b91c1c]">С записью связано <strong>12 заказов</strong> и <strong>3 акции</strong>.</p>
          </div>
        </div>
        <ModalFooter>
          <BtnSecondary onClick={() => setOpen(false)}>Отменить</BtnSecondary>
          <BtnPrimary onClick={() => setOpen(false)} danger>Удалить</BtnPrimary>
        </ModalFooter>
      </ModalShell>
    </>
  );
}

// ── Тип 3: Информационная / Нейтральное подтверждение ──
function ModalInfo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="h-9 px-4 text-[13px] font-medium bg-white dark:bg-[#161820] text-[#4f4d5b] dark:text-[#a0a3b8] border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-lg hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] transition-colors">
        Уведомление
      </button>
      <ModalShell open={open} onClose={() => setOpen(false)} width={400}>
        <ModalHeader
          title="Обновление системы"
          onClose={() => setOpen(false)}
        />
        <div className="px-6 pb-6 overflow-y-auto scrollbar-kit flex-1">
          <p className="text-[14px] text-[#4f4d5b] dark:text-[#a0a3b8] leading-relaxed">
            Доступна версия <strong className="text-[#171a24] dark:text-[#e8e9ef]">2.14.0</strong>. Обновление займёт около 2 минут. Несохранённые данные будут утеряны.
          </p>
        </div>
        <ModalFooter>
          <BtnSecondary onClick={() => setOpen(false)}>Позже</BtnSecondary>
          <BtnPrimary onClick={() => setOpen(false)}>Обновить сейчас</BtnPrimary>
        </ModalFooter>
      </ModalShell>
    </>
  );
}

// Bottom Sheet — мобильный аналог модалки
function BottomSheet({ open, onClose, title, subtitle, children }: {
  open: boolean; onClose: () => void;
  title: string; subtitle?: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-[#0f1117]/50 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className="relative bg-white dark:bg-[#161820] w-full max-w-sm rounded-t-2xl flex flex-col overflow-hidden"
        style={{ boxShadow: "0 -8px 32px rgba(0,0,0,0.16)" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-[#e3eaf4] dark:bg-[#2a2c3a] rounded-full" />
        </div>
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-2 pb-4 shrink-0">
          <div>
            <h3 className="text-[17px] font-semibold text-[#171a24] dark:text-[#e8e9ef]">{title}</h3>
            {subtitle && <p className="text-[13px] text-[#9d99ac] dark:text-[#6b6f85] mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9d99ac] dark:text-[#6b6f85] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] transition-colors">
            <X size={16} />
          </button>
        </div>
        {/* Content */}
        <div className="px-5 pb-3 overflow-y-auto scrollbar-kit flex-1">
          {children}
        </div>
        {/* Footer safe area */}
        <div className="px-5 pt-3 pb-6 border-t border-[#f0f3f8] dark:border-[#2a2c3a] flex gap-2.5 shrink-0">
          <button onClick={onClose} className="flex-1 h-11 text-[14px] font-medium text-white bg-[#0080ff] rounded-xl hover:bg-[#006fe0] transition-colors">
            Применить
          </button>
          <button onClick={onClose} className="h-11 px-5 text-[14px] font-medium border border-[#e3eaf4] dark:border-[#2a2c3a] text-[#4f4d5b] dark:text-[#a0a3b8] rounded-xl hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] transition-colors">
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

function BottomSheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="h-9 px-4 text-[13px] font-medium bg-[#0080ff] text-white rounded-lg hover:bg-[#006fe0] transition-colors">
        Открыть Bottom Sheet
      </button>
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Фильтр товаров"
        subtitle="Выберите параметры"
      >
        <div className="space-y-4 pb-2">
          <div className="space-y-2">
            <p className="text-[13px] font-medium text-[#171a24] dark:text-[#e8e9ef]">Категория</p>
            {["Кофе", "Выпечка", "Десерты", "Напитки"].map(c => (
              <label key={c} className="flex items-center gap-3 py-1 cursor-pointer">
                <input type="checkbox" defaultChecked={c === "Кофе"} className="accent-[#0080ff] w-4 h-4" />
                <span className="text-[14px] text-[#4f4d5b] dark:text-[#a0a3b8]">{c}</span>
              </label>
            ))}
          </div>
          <div className="h-px bg-[#f0f3f8] dark:bg-[#1e2028]" />
          <div className="space-y-2">
            <p className="text-[13px] font-medium text-[#171a24] dark:text-[#e8e9ef]">Цена</p>
            <div className="flex gap-3">
              <div className="flex-1 border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-lg px-3 py-2 text-[14px] text-[#171a24] dark:text-[#e8e9ef]">от 100 ₽</div>
              <div className="flex-1 border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-lg px-3 py-2 text-[14px] text-[#171a24] dark:text-[#e8e9ef]">до 500 ₽</div>
            </div>
          </div>
        </div>
      </BottomSheet>
    </>
  );
}

function ModalSection() {
  return (
    <div className="p-6 space-y-6">
      <SectionLabel>Модальные окна</SectionLabel>

      {/* Anatomy callout */}
      <div className="flex items-start gap-3 bg-[#fdf4ff] border border-[#e879f9] rounded-xl px-4 py-3">
        <Info size={15} className="text-[#a21caf] shrink-0 mt-0.5" />
        <span className="text-[13px] text-[#86198f]">
          Современная модалка: заголовок <strong>слева</strong>, кнопки <strong>справа</strong> авто-ширина, floating label в полях, backdrop blur, закрытие по Esc и клику на фон.
        </span>
      </div>

      {/* Anatomy diagram */}
      <div>
        <SubLabel>Анатомия</SubLabel>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {[
            { color: "#6e6b7b", label: "Backdrop · rgba(15,17,23, 0.6) + blur 3px" },
            { color: "#0080ff", label: "Header · title (left) + subtitle + ✕ button (right)" },
            { color: "#22c55e", label: "Body · floating label inputs, scrollable" },
            { color: "#f59e0b", label: "Footer · separator + Отменить (outline) + Действие (primary)" },
            { color: "#5a4d6b", label: "Shadow · 0 24px 64px rgba(0,0,0,0.18)" },
          ].map(a => (
            <div key={a.label} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: a.color }} />
              <span className="text-[13px] text-[#4f4d5b] dark:text-[#a0a3b8]">{a.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Правила */}
      <div>
        <SubLabel>Правила</SubLabel>
        <div className="grid grid-cols-2 gap-3">
          {[
            { ok: true,  text: "Заголовок выровнен по левому краю" },
            { ok: true,  text: "Кнопки справа, авто-ширина по контенту" },
            { ok: true,  text: "Вторичное действие — всегда слева от основного" },
            { ok: true,  text: "Закрытие по Esc, backdrop и ✕" },
            { ok: false, text: "Заголовок по центру" },
            { ok: false, text: "Кнопка на всю ширину модалки" },
            { ok: false, text: "Одна кнопка без возможности отмены" },
            { ok: false, text: "Placeholder вместо floating label" },
          ].map(r => (
            <div key={r.text} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg ${r.ok ? "bg-[#f0fdf4]" : "bg-[#fef2f2]"}`}>
              {r.ok
                ? <CheckCircle size={13} className="text-[#16a34a] shrink-0" />
                : <X size={13} className="text-[#ef4444] shrink-0" />}
              <span className={`text-[12px] ${r.ok ? "text-[#166534]" : "text-[#b91c1c]"}`}>{r.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live demos */}
      <div>
        <SubLabel>Типы модалок — нажми для открытия</SubLabel>
        <div className="flex flex-wrap gap-3 items-start">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-[#9d99ac] dark:text-[#6b6f85]">Создание / Сохранение</span>
            <ModalCreate />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-[#9d99ac] dark:text-[#6b6f85]">Опасное действие</span>
            <ModalDelete />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-[#9d99ac] dark:text-[#6b6f85]">Информация / Подтверждение</span>
            <ModalInfo />
          </div>
        </div>
      </div>

      {/* Bottom Sheet */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <SubLabel>Mobile · Bottom Sheet</SubLabel>
          <span className="text-[11px] bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa] px-2 py-0.5 rounded-full font-medium">Mobile only</span>
        </div>
        <div className="flex items-start gap-3 bg-[#fff7ed] border border-[#fed7aa] rounded-lg px-4 py-3 mb-4">
          <Info size={15} className="text-[#c2410c] shrink-0 mt-0.5" />
          <span className="text-[13px] text-[#9a3412]">
            На мобильных модалка превращается в <strong>Bottom Sheet</strong> — выезжает снизу, занимает нужную высоту. Drag-handle сверху, кнопки с учётом safe area (home indicator).
          </span>
        </div>
        <div className="flex flex-wrap gap-8 items-start">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-[#9d99ac] dark:text-[#6b6f85]">Bottom Sheet</span>
            <BottomSheetDemo />
          </div>
          {/* Static preview */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-[#9d99ac] dark:text-[#6b6f85]">Превью на телефоне</span>
            <div className="w-[220px] bg-[#f0f3f8] dark:bg-[#1e2028] rounded-3xl p-2 border border-[#e3eaf4] dark:border-[#2a2c3a]">
              <div className="bg-white dark:bg-[#161820] rounded-2xl overflow-hidden relative h-[380px]">
                {/* Fake screen content */}
                <div className="p-3 space-y-2">
                  {[1,2,3].map(i => <div key={i} className="h-12 bg-[#f5f7fa] dark:bg-[#1e2028] rounded-lg" />)}
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-[#0f1117]/40" />
                {/* Sheet */}
                <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#161820] rounded-t-2xl">
                  <div className="flex justify-center pt-2.5 pb-1">
                    <div className="w-8 h-1 bg-[#e3eaf4] dark:bg-[#2a2c3a] rounded-full" />
                  </div>
                  <div className="px-4 pt-1 pb-3">
                    <p className="text-[13px] font-semibold text-[#171a24] dark:text-[#e8e9ef]">Фильтр товаров</p>
                    <p className="text-[10px] text-[#9d99ac] dark:text-[#6b6f85]">Выберите параметры</p>
                  </div>
                  <div className="px-4 pb-2 space-y-2">
                    {["Кофе ✓", "Выпечка", "Десерты"].map(c => (
                      <div key={c} className="flex items-center gap-2">
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center ${c.includes("✓") ? "bg-[#0080ff]" : "border border-[#e3eaf4] dark:border-[#2a2c3a]"}`}>
                          {c.includes("✓") && <Check size={9} strokeWidth={3} className="text-white" />}
                        </div>
                        <span className="text-[11px] text-[#4f4d5b] dark:text-[#a0a3b8]">{c.replace(" ✓","")}</span>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 pt-2 pb-5 flex gap-2">
                    <div className="flex-1 h-9 bg-[#0080ff] rounded-xl flex items-center justify-center">
                      <span className="text-[11px] font-semibold text-white">Применить</span>
                    </div>
                    <div className="h-9 px-3 border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-xl flex items-center">
                      <span className="text-[11px] text-[#6e6b7b] dark:text-[#8b8fa8]">Отмена</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastItem {
  id: number;
  variant: ToastVariant;
  title: string;
  message: string;
}

const toastConfig: Record<ToastVariant, {
  icon: React.ElementType; bg: string; border: string;
  iconColor: string; titleColor: string; textColor: string; progressColor: string;
}> = {
  success: { icon: CheckCircle,   bg: "#f0fdf4", border: "#86efac", iconColor: "#16a34a", titleColor: "#14532d", textColor: "#166534", progressColor: "#22c55e" },
  error:   { icon: AlertCircle,   bg: "#fef2f2", border: "#fca5a5", iconColor: "#dc2626", titleColor: "#7f1d1d", textColor: "#b91c1c", progressColor: "#ef4444" },
  warning: { icon: AlertTriangle, bg: "#fffbeb", border: "#fcd34d", iconColor: "#d97706", titleColor: "#78350f", textColor: "#92400e", progressColor: "#f59e0b" },
  info:    { icon: Info,          bg: "#eff6ff", border: "#93c5fd", iconColor: "#2563eb", titleColor: "#1e3a8a", textColor: "#1d4ed8", progressColor: "#0080ff" },
};

const toastTemplates: Record<ToastVariant, { title: string; message: string }> = {
  success: { title: "Сохранено",        message: "Изменения успешно применены" },
  error:   { title: "Ошибка",           message: "Не удалось выполнить операцию" },
  warning: { title: "Внимание",         message: "Лицензия истекает через 7 дней" },
  info:    { title: "Обновление",       message: "Доступна новая версия системы" },
};

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: (id: number) => void }) {
  const cfg = toastConfig[toast.variant];
  const Icon = cfg.icon;

  useEffect(() => {
    const t = setTimeout(() => onClose(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast.id, onClose]);

  return (
    <div
      className="relative w-[320px] rounded-xl border overflow-hidden"
      style={{ background: cfg.bg, borderColor: cfg.border, boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)" }}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <Icon size={16} style={{ color: cfg.iconColor }} className="shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold leading-tight" style={{ color: cfg.titleColor }}>{toast.title}</p>
          <p className="text-[12px] mt-0.5 leading-snug" style={{ color: cfg.textColor }}>{toast.message}</p>
        </div>
        <button
          onClick={() => onClose(toast.id)}
          className="shrink-0 opacity-50 hover:opacity-100 transition-opacity mt-0.5"
          style={{ color: cfg.titleColor }}
        >
          <X size={13} />
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-[2px] w-full" style={{ background: `${cfg.progressColor}20` }}>
        <div
          className="h-full rounded-full"
          style={{
            background: cfg.progressColor,
            width: "100%",
            animation: "toast-progress 4s linear forwards",
          }}
        />
      </div>
    </div>
  );
}

function ToastSection() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const addToast = (variant: ToastVariant) => {
    const tmpl = toastTemplates[variant];
    setToasts(prev => [...prev, { id: nextId.current++, variant, ...tmpl }]);
  };

  const removeToast = (id: number) =>
    setToasts(prev => prev.filter(t => t.id !== id));

  const variants: ToastVariant[] = ["success", "error", "warning", "info"];

  return (
    <div className="p-6 space-y-6">
      <SectionLabel>Toast · Уведомления</SectionLabel>

      <div className="flex items-start gap-3 bg-[#fff7ed] border border-[#fed7aa] rounded-xl px-4 py-3">
        <Info size={15} className="text-[#ea580c] shrink-0 mt-0.5" />
        <span className="text-[13px] text-[#9a3412]">
          Toast — временное уведомление, исчезает автоматически через 4 сек. В отличие от Alert не блокирует интерфейс и появляется поверх контента в углу экрана.
        </span>
      </div>

      {/* Trigger buttons */}
      <div>
        <SubLabel>Триггеры — нажми чтобы увидеть toast</SubLabel>
        <div className="flex flex-wrap gap-3">
          {variants.map(v => {
            const cfg = toastConfig[v];
            const Icon = cfg.icon;
            return (
              <button
                key={v}
                onClick={() => addToast(v)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-[13px] font-medium transition-all hover:opacity-80"
                style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.titleColor }}
              >
                <Icon size={14} style={{ color: cfg.iconColor }} />
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Static preview */}
      <div>
        <SubLabel>Все варианты</SubLabel>
        <div className="flex flex-col gap-3 items-start">
          {variants.map(v => (
            <ToastCard
              key={v}
              toast={{ id: -variants.indexOf(v), variant: v, ...toastTemplates[v] }}
              onClose={() => {}}
            />
          ))}
        </div>
      </div>

      {/* Live toast container — top right */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 items-end pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastCard toast={t} onClose={removeToast} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

type TooltipPos = "top" | "bottom" | "left" | "right";

function Tooltip({ text, position = "top", children }: {
  text: string; position?: TooltipPos; children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const posStyles: Record<TooltipPos, { tip: string; arrow: string }> = {
    top:    { tip: "bottom-full left-1/2 -translate-x-1/2 mb-2",    arrow: "top-full left-1/2 -translate-x-1/2 border-t-[#1a1620] border-x-transparent border-b-transparent border-4" },
    bottom: { tip: "top-full left-1/2 -translate-x-1/2 mt-2",       arrow: "bottom-full left-1/2 -translate-x-1/2 border-b-[#1a1620] border-x-transparent border-t-transparent border-4" },
    left:   { tip: "right-full top-1/2 -translate-y-1/2 mr-2",      arrow: "left-full top-1/2 -translate-y-1/2 border-l-[#1a1620] border-y-transparent border-r-transparent border-4" },
    right:  { tip: "left-full top-1/2 -translate-y-1/2 ml-2",       arrow: "right-full top-1/2 -translate-y-1/2 border-r-[#1a1620] border-y-transparent border-l-transparent border-4" },
  };
  const s = posStyles[position];
  return (
    <div className="relative inline-flex" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && (
        <div className={`absolute z-50 whitespace-nowrap ${s.tip}`}>
          <div className="bg-[#1a1620] dark:bg-[#0d0e12] text-white text-[12px] font-medium px-2.5 py-1.5 rounded-lg shadow-lg leading-none">
            {text}
          </div>
          <div className={`absolute border ${s.arrow}`} />
        </div>
      )}
    </div>
  );
}

function TooltipSection() {
  const positions: TooltipPos[] = ["top", "right", "bottom", "left"];
  const posLabel: Record<TooltipPos, string> = { top: "Сверху", right: "Справа", bottom: "Снизу", left: "Слева" };

  return (
    <div className="p-6 space-y-6">
      <SectionLabel>Tooltip · Подсказки</SectionLabel>

      <div className="flex items-start gap-3 bg-[#f0fdf4] border border-[#86efac] rounded-lg px-4 py-3">
        <Info size={15} className="text-[#059669] shrink-0 mt-0.5" />
        <span className="text-[13px] text-[#065f46]">
          Tooltip появляется только по hover. Никогда не скрывай за ним критичную информацию — он недоступен на touch-устройствах.
        </span>
      </div>

      <div>
        <SubLabel>Позиции</SubLabel>
        <div className="flex gap-12 flex-wrap items-center py-8 px-6">
          {positions.map(pos => (
            <div key={pos} className="flex flex-col items-center gap-2">
              <Tooltip text={`Подсказка ${posLabel[pos].toLowerCase()}`} position={pos}>
                <button className="h-9 px-4 text-[13px] font-medium bg-white dark:bg-[#161820] border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-lg text-[#4f4d5b] dark:text-[#a0a3b8] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] transition-colors">
                  {posLabel[pos]}
                </button>
              </Tooltip>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SubLabel>Варианты использования</SubLabel>
        <div className="flex gap-6 flex-wrap items-center">
          <Tooltip text="Редактировать запись" position="top">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#e3eaf4] dark:border-[#2a2c3a] text-[#6e6b7b] dark:text-[#8b8fa8] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] transition-colors">
              <Settings size={15} />
            </button>
          </Tooltip>
          <Tooltip text="Удалить без возможности восстановления" position="top">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#fca5a5] text-[#ef4444] hover:bg-[#fef2f2] transition-colors">
              <X size={15} />
            </button>
          </Tooltip>
          <Tooltip text="Алексей Антонов · Senior Designer" position="top">
            <div className="w-9 h-9 rounded-full bg-[#5a4d6b] flex items-center justify-center text-white text-[12px] font-semibold cursor-default">АА</div>
          </Tooltip>
          <Tooltip text="Нажмите чтобы скопировать" position="right">
            <span className="font-mono text-[13px] bg-[#f5f7fa] dark:bg-[#1e2028] border border-[#e3eaf4] dark:border-[#2a2c3a] px-2.5 py-1 rounded-lg text-[#4f4d5b] dark:text-[#a0a3b8] cursor-pointer hover:bg-[#e3eaf4] dark:bg-[#2a2c3a] transition-colors">
              #A0B3FF
            </span>
          </Tooltip>
        </div>
      </div>

      <div>
        <SubLabel>Анатомия</SubLabel>
        <div className="flex gap-6 flex-wrap text-[12px]">
          {[
            { color: "#1a1620", label: "Фон · #1a1620 (brand-900) — тёмный, читаемый на любом фоне" },
            { color: "#ffffff", label: "Текст · white · 12px Medium" },
            { color: "#4f4d5b", label: "Стрелка · совпадает с фоном тултипа" },
          ].map(a => (
            <div key={a.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded shrink-0 border border-[#e3eaf4] dark:border-[#2a2c3a]" style={{ background: a.color }} />
              <span className="text-[#4f4d5b] dark:text-[#a0a3b8]">{a.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile alternative */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <SubLabel>Mobile · Альтернатива для touch</SubLabel>
          <span className="text-[11px] bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa] px-2 py-0.5 rounded-full font-medium">Mobile only</span>
        </div>
        <div className="flex items-start gap-3 bg-[#fff7ed] border border-[#fed7aa] rounded-lg px-4 py-3 mb-4">
          <AlertTriangle size={15} className="text-[#c2410c] shrink-0 mt-0.5" />
          <span className="text-[13px] text-[#9a3412]">
            На touch-устройствах hover недоступен. Используй одну из альтернатив ниже.
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {/* Tap to show */}
          <div className="bg-white dark:bg-[#161820] border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-xl p-4 space-y-3">
            <p className="text-[12px] font-semibold text-[#171a24] dark:text-[#e8e9ef]">1. Tap-подсказка</p>
            <p className="text-[12px] text-[#6e6b7b] dark:text-[#8b8fa8] leading-snug">Нажатие на иконку ⓘ показывает inline-текст под элементом.</p>
            <TapTooltipDemo />
          </div>
          {/* Helper text */}
          <div className="bg-white dark:bg-[#161820] border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-xl p-4 space-y-3">
            <p className="text-[12px] font-semibold text-[#171a24] dark:text-[#e8e9ef]">2. Helper text</p>
            <p className="text-[12px] text-[#6e6b7b] dark:text-[#8b8fa8] leading-snug">Пояснение всегда видно под полем — не требует взаимодействия.</p>
            <div className="space-y-1">
              <div className="border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-lg px-3 py-2 text-[13px] text-[#9d99ac] dark:text-[#6b6f85]">Введите ИНН</div>
              <p className="text-[11px] text-[#9d99ac] dark:text-[#6b6f85]">10 цифр для ИП, 12 для физлица</p>
            </div>
          </div>
          {/* Bottom sheet hint */}
          <div className="bg-white dark:bg-[#161820] border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-xl p-4 space-y-3">
            <p className="text-[12px] font-semibold text-[#171a24] dark:text-[#e8e9ef]">3. Bottom Sheet</p>
            <p className="text-[12px] text-[#6e6b7b] dark:text-[#8b8fa8] leading-snug">Кнопка «Подробнее» открывает Bottom Sheet с полным объяснением.</p>
            <button className="flex items-center gap-1.5 text-[12px] font-medium text-[#0080ff]">
              <Info size={13} /> Как это работает?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TapTooltipDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-[13px] text-[#4f4d5b] dark:text-[#a0a3b8]">Комиссия</span>
        <button onClick={() => setOpen(o => !o)} className={`shrink-0 transition-colors ${open ? "text-[#0080ff]" : "text-[#9d99ac] dark:text-[#6b6f85]"}`}>
          <Info size={14} />
        </button>
      </div>
      {open && (
        <div className="bg-[#f0f7ff] dark:bg-[#1a2035] border border-[#bae0ff] rounded-lg px-3 py-2 text-[12px] text-[#005abf] dark:text-[#6eb3ff] leading-snug">
          Комиссия списывается ежемесячно в первый рабочий день. Зависит от тарифного плана.
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonBox({ w, h, rounded = "rounded-lg" }: { w: string; h: string; rounded?: string }) {
  return (
    <div
      className={`${rounded} ${w} ${h} shrink-0`}
      style={{
        background: "linear-gradient(90deg, #f0f3f8 25%, #e3eaf4 50%, #f0f3f8 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.5s infinite",
      }}
    />
  );
}

function SkeletonSection() {
  return (
    <div className="p-6 space-y-6">
      <SectionLabel>Skeleton · Загрузка</SectionLabel>

      <div className="flex items-start gap-3 bg-[#f8fafc] dark:bg-[#1e2028] border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-lg px-4 py-3">
        <Info size={15} className="text-[#64748b] shrink-0 mt-0.5" />
        <span className="text-[13px] text-[#475569]">
          Skeleton показывается пока данные загружаются. Повторяет форму реального контента — пользователь понимает структуру страницы ещё до появления данных.
        </span>
      </div>

      <style>{`
        @keyframes skeleton-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="grid grid-cols-3 gap-6">
        {/* Card skeleton */}
        <div>
          <SubLabel>Карточка</SubLabel>
          <div className="bg-white dark:bg-[#161820] border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <SkeletonBox w="w-10" h="h-10" rounded="rounded-full" />
              <div className="flex flex-col gap-2 flex-1">
                <SkeletonBox w="w-3/4" h="h-3" />
                <SkeletonBox w="w-1/2" h="h-3" />
              </div>
            </div>
            <SkeletonBox w="w-full" h="h-3" />
            <SkeletonBox w="w-full" h="h-3" />
            <SkeletonBox w="w-2/3" h="h-3" />
            <div className="flex gap-2 pt-1">
              <SkeletonBox w="w-20" h="h-8" />
              <SkeletonBox w="w-20" h="h-8" />
            </div>
          </div>
        </div>

        {/* Table skeleton */}
        <div>
          <SubLabel>Таблица</SubLabel>
          <div className="bg-white dark:bg-[#161820] border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#f0f3f8] dark:border-[#2a2c3a] flex gap-4">
              <SkeletonBox w="w-1/4" h="h-3" />
              <SkeletonBox w="w-1/4" h="h-3" />
              <SkeletonBox w="w-1/4" h="h-3" />
            </div>
            {[1,2,3,4].map(i => (
              <div key={i} className="px-4 py-3 border-b border-[#f0f3f8] dark:border-[#2a2c3a] flex gap-4 items-center">
                <SkeletonBox w="w-1/3" h="h-3" />
                <SkeletonBox w="w-1/4" h="h-3" />
                <SkeletonBox w="w-12" h="h-5" rounded="rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Form skeleton */}
        <div>
          <SubLabel>Форма</SubLabel>
          <div className="bg-white dark:bg-[#161820] border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-xl p-4 space-y-3">
            <SkeletonBox w="w-1/3" h="h-3" />
            <SkeletonBox w="w-full" h="h-[52px]" />
            <SkeletonBox w="w-1/3" h="h-3" />
            <SkeletonBox w="w-full" h="h-[52px]" />
            <SkeletonBox w="w-1/3" h="h-3" />
            <SkeletonBox w="w-full" h="h-[52px]" />
            <div className="flex justify-end pt-1">
              <SkeletonBox w="w-24" h="h-9" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode; title: string; description: string; action?: { label: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#f0f3f8] dark:bg-[#1e2028] flex items-center justify-center text-[#9d99ac] dark:text-[#6b6f85] mb-4">
        {icon}
      </div>
      <h4 className="text-[15px] font-semibold text-[#332c38] dark:text-[#e8e9ef] mb-1">{title}</h4>
      <p className="text-[13px] text-[#9d99ac] dark:text-[#6b6f85] leading-snug max-w-[240px]">{description}</p>
      {action && (
        <button className="mt-4 h-9 px-4 text-[13px] font-medium bg-[#0080ff] text-white rounded-lg hover:bg-[#006fe0] transition-colors">
          {action.label}
        </button>
      )}
    </div>
  );
}

function EmptyStateSection() {
  const examples = [
    {
      icon: <FileText size={22} />,
      title: "Документов пока нет",
      description: "Создайте первый документ — он появится здесь",
      action: { label: "Создать документ" },
    },
    {
      icon: <Search size={22} />,
      title: "Ничего не найдено",
      description: "Попробуйте изменить запрос или сбросить фильтры",
      action: { label: "Сбросить фильтры" },
    },
    {
      icon: <Bell size={22} />,
      title: "Уведомлений нет",
      description: "Все актуальные уведомления будут отображаться здесь",
    },
    {
      icon: <AlertCircle size={22} />,
      title: "Ошибка загрузки",
      description: "Не удалось получить данные. Проверьте соединение и попробуйте снова",
      action: { label: "Повторить" },
    },
  ];

  return (
    <div className="p-6 space-y-5">
      <SectionLabel>Empty State · Пустые состояния</SectionLabel>

      <div className="flex items-start gap-3 bg-[#faf5ff] border border-[#d8b4fe] rounded-lg px-4 py-3">
        <Info size={15} className="text-[#7c3aed] shrink-0 mt-0.5" />
        <span className="text-[13px] text-[#5b21b6]">
          Пустое состояние = иконка + заголовок + описание + (опционально) призыв к действию. Никогда не оставляй пустой белый экран.
        </span>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {examples.map(e => (
          <div key={e.title} className="bg-white dark:bg-[#161820] border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-xl overflow-hidden">
            <EmptyState {...e} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Progress & Stepper ───────────────────────────────────────────────────────

function ProgressBar({ value, color = "#0080ff", label }: { value: number; color?: string; label?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <div className="flex justify-between text-[12px]">
          <span className="text-[#4f4d5b] dark:text-[#a0a3b8] font-medium">{label}</span>
          <span className="text-[#9d99ac] dark:text-[#6b6f85]">{value}%</span>
        </div>
      )}
      <div className="h-2 bg-[#f0f3f8] dark:bg-[#1e2028] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
    </div>
  );
}

function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold border-2 transition-all ${
                  done   ? "bg-[#0080ff] border-[#0080ff] text-white"
                  : active ? "bg-white dark:bg-[#161820] border-[#0080ff] text-[#0080ff]"
                  : "bg-white dark:bg-[#161820] border-[#e3eaf4] dark:border-[#2a2c3a] text-[#9d99ac] dark:text-[#6b6f85]"
                }`}
              >
                {done ? <Check size={14} strokeWidth={3} /> : i + 1}
              </div>
              <span className={`text-[11px] font-medium whitespace-nowrap ${active ? "text-[#171a24] dark:text-[#e8e9ef]" : done ? "text-[#0080ff]" : "text-[#9d99ac] dark:text-[#6b6f85]"}`}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 mb-5 ${done ? "bg-[#0080ff]" : "bg-[#e3eaf4] dark:bg-[#2a2c3a]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProgressSection() {
  const [step, setStep] = useState(1);
  const steps = ["Данные", "Доставка", "Оплата", "Подтверждение"];

  return (
    <div className="p-6 space-y-8">
      <SectionLabel>Progress & Stepper</SectionLabel>

      <div>
        <SubLabel>Прогресс-бары</SubLabel>
        <div className="bg-white dark:bg-[#161820] border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-xl p-5 space-y-4 max-w-lg">
          <ProgressBar label="Выполнено задач" value={72} color="#0080ff" />
          <ProgressBar label="Использовано хранилища" value={45} color="#22c55e" />
          <ProgressBar label="Критические ошибки" value={18} color="#ef4444" />
          <ProgressBar label="Предупреждения" value={60} color="#f59e0b" />
        </div>
      </div>

      <div>
        <SubLabel>Stepper — шаги оформления</SubLabel>
        <div className="bg-white dark:bg-[#161820] border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-xl p-6 space-y-6 max-w-2xl">
          <Stepper steps={steps} current={step} />
          <div className="h-px bg-[#f0f3f8] dark:bg-[#1e2028]" />
          <div className="text-[13px] text-[#9d99ac] dark:text-[#6b6f85]">
            Шаг {step + 1} из {steps.length}: <span className="font-medium text-[#171a24] dark:text-[#e8e9ef]">{steps[step]}</span>
          </div>
          <div className="flex gap-2.5">
            <button
              disabled={step === 0}
              onClick={() => setStep(s => s - 1)}
              className="h-9 px-4 text-[13px] font-medium border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-lg text-[#4f4d5b] dark:text-[#a0a3b8] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Назад
            </button>
            <button
              disabled={step === steps.length - 1}
              onClick={() => setStep(s => s + 1)}
              className="h-9 px-4 text-[13px] font-medium bg-[#0080ff] text-white rounded-lg hover:bg-[#006fe0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {step === steps.length - 2 ? "Подтвердить" : "Далее"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Table ────────────────────────────────────────────────────────────────────

type SortDir = "asc" | "desc" | null;

const tableData = [
  { id: 1, name: "Капучино 300мл",    category: "Кофе",    price: 290,  stock: 142, status: "active" },
  { id: 2, name: "Латте 400мл",       category: "Кофе",    price: 320,  stock: 87,  status: "active" },
  { id: 3, name: "Эспрессо 100мл",    category: "Кофе",    price: 180,  stock: 0,   status: "error"  },
  { id: 4, name: "Круассан с сыром",  category: "Выпечка", price: 150,  stock: 34,  status: "active" },
  { id: 5, name: "Чизкейк",           category: "Десерт",  price: 420,  stock: 12,  status: "warning"},
  { id: 6, name: "Американо 250мл",   category: "Кофе",    price: 210,  stock: 0,   status: "error"  },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  active:  { label: "Активен",  color: "green"  },
  warning: { label: "Мало",     color: "amber"  },
  error:   { label: "Нет",      color: "red"    },
};

function TableCardView() {
  const [selected, setSelected] = useState<number[]>([]);
  const toggle = (id: number) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  return (
    <div className="space-y-2 max-w-sm">
      {tableData.map(row => {
        const sc = statusConfig[row.status];
        const isSelected = selected.includes(row.id);
        return (
          <div
            key={row.id}
            onClick={() => toggle(row.id)}
            className={`bg-white dark:bg-[#161820] border rounded-xl p-4 cursor-pointer transition-all ${isSelected ? "border-[#0080ff] bg-[#f0f7ff] dark:bg-[#1a2035]" : "border-[#e3eaf4] dark:border-[#2a2c3a] hover:border-[#b8bfcc]"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className={`w-4 h-4 rounded-[3px] border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all
                  ${isSelected ? "bg-[#0080ff] border-[#0080ff]" : "border-[#d6dde8] bg-white dark:bg-[#161820]"}`}
                >
                  {isSelected && <Check size={9} strokeWidth={3} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[#171a24] dark:text-[#e8e9ef] truncate">{row.name}</p>
                  <p className="text-[12px] text-[#9d99ac] dark:text-[#6b6f85] mt-0.5">{row.category} · {row.stock > 0 ? `${row.stock} шт` : "Нет в наличии"}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <span className="text-[15px] font-semibold text-[#171a24] dark:text-[#e8e9ef]">{row.price} ₽</span>
                <Tag label={sc.label} color={sc.color} dot />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-[#b8bfcc] dark:text-[#3a3d50]">
              <span className="font-mono">{row.id}</span>
              <button className="text-[#9d99ac] dark:text-[#6b6f85] hover:text-[#6e6b7b] dark:text-[#8b8fa8] transition-colors" onClick={e => e.stopPropagation()}>
                <Settings size={13} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TableSection() {
  const [viewMode, setViewMode] = useState<"table"|"cards">("table");
  const [selected, setSelected] = useState<number[]>([]);
  const [sortCol, setSortCol] = useState<string | null>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const sorted = [...tableData].sort((a, b) => {
    if (!sortCol || !sortDir) return 0;
    const av = a[sortCol as keyof typeof a];
    const bv = b[sortCol as keyof typeof b];
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const allSelected = selected.length === tableData.length;
  const someSelected = selected.length > 0 && !allSelected;

  const toggleAll = () => setSelected(allSelected ? [] : tableData.map(r => r.id));
  const toggleRow = (id: number) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  function SortIcon({ col }: { col: string }) {
    if (sortCol !== col) return <ChevronDown size={12} className="text-[#d6dde8] dark:text-[#3a3d50]" />;
    return sortDir === "asc"
      ? <ChevronDown size={12} className="text-[#0080ff]" />
      : <ChevronRight size={12} className="text-[#0080ff] -rotate-90" />;
  }

  return (
    <div className="p-6 space-y-5">
      <SectionLabel>Таблица данных</SectionLabel>

      {/* View toggle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-[#f5f7fa] dark:bg-[#1e2028] rounded-lg p-1">
          <button onClick={() => setViewMode("table")} className={`h-7 px-3 text-[12px] font-medium rounded-md flex items-center gap-1.5 transition-colors ${viewMode === "table" ? "bg-white dark:bg-[#161820] text-[#171a24] dark:text-[#e8e9ef] shadow-sm" : "text-[#9d99ac] dark:text-[#6b6f85] hover:text-[#6e6b7b] dark:text-[#8b8fa8]"}`}>
            <List size={13} /> Desktop
          </button>
          <button onClick={() => setViewMode("cards")} className={`h-7 px-3 text-[12px] font-medium rounded-md flex items-center gap-1.5 transition-colors ${viewMode === "cards" ? "bg-white dark:bg-[#161820] text-[#171a24] dark:text-[#e8e9ef] shadow-sm" : "text-[#9d99ac] dark:text-[#6b6f85] hover:text-[#6e6b7b] dark:text-[#8b8fa8]"}`}>
            <Grid size={13} /> Mobile
          </button>
        </div>
        {viewMode === "cards" && (
          <span className="text-[11px] bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa] px-2 py-0.5 rounded-full font-medium">Card view</span>
        )}
      </div>

      {viewMode === "cards" ? (
        <TableCardView />
      ) : (
        <>
      {selected.length > 0 && (
        <div className="flex items-center gap-3 bg-[#e6f2ff] border border-[#bae0ff] rounded-lg px-4 py-2.5">
          <span className="text-[13px] font-medium text-[#005abf] dark:text-[#6eb3ff]">Выбрано: {selected.length}</span>
          <button className="text-[13px] text-[#ef4444] font-medium hover:underline ml-auto">Удалить</button>
          <button onClick={() => setSelected([])} className="text-[#9d99ac] dark:text-[#6b6f85] hover:text-[#6e6b7b] dark:text-[#8b8fa8]"><X size={14} /></button>
        </div>
      )}

      <div className="bg-white dark:bg-[#161820] rounded-xl border border-[#e3eaf4] dark:border-[#2a2c3a] overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-[#f5f7fa] dark:bg-[#1e2028] border-b border-[#e3eaf4] dark:border-[#2a2c3a]">
              <th className="px-4 py-3 w-10">
                <div
                  onClick={toggleAll}
                  className={`w-[16px] h-[16px] rounded-[3px] border-2 flex items-center justify-center cursor-pointer transition-all
                    ${allSelected ? "bg-[#0080ff] border-[#0080ff]" : someSelected ? "border-[#0080ff] bg-white dark:bg-[#161820]" : "border-[#d6dde8] bg-white dark:bg-[#161820]"}`}
                >
                  {allSelected ? <Check size={9} strokeWidth={3} className="text-white" />
                    : someSelected ? <span className="w-1.5 h-0.5 bg-[#0080ff] rounded-full" /> : null}
                </div>
              </th>
              {[
                { key: "name",     label: "Наименование" },
                { key: "category", label: "Категория" },
                { key: "price",    label: "Цена" },
                { key: "stock",    label: "Остаток" },
                { key: "status",   label: "Статус" },
              ].map(col => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#9d99ac] dark:text-[#6b6f85] cursor-pointer hover:text-[#6e6b7b] dark:text-[#8b8fa8] transition-colors"
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <SortIcon col={col.key} />
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f3f8] dark:divide-[#2a2c3a]">
            {sorted.map(row => {
              const isSelected = selected.includes(row.id);
              const sc = statusConfig[row.status];
              return (
                <tr key={row.id} className={`transition-colors ${isSelected ? "bg-[#f0f7ff] dark:bg-[#1a2035]" : "hover:bg-[#fafbfd] dark:bg-[#161820]"}`}>
                  <td className="px-4 py-3">
                    <div
                      onClick={() => toggleRow(row.id)}
                      className={`w-[16px] h-[16px] rounded-[3px] border-2 flex items-center justify-center cursor-pointer transition-all
                        ${isSelected ? "bg-[#0080ff] border-[#0080ff]" : "border-[#d6dde8] bg-white dark:bg-[#161820]"}`}
                    >
                      {isSelected && <Check size={9} strokeWidth={3} className="text-white" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-[#171a24] dark:text-[#e8e9ef]">{row.name}</td>
                  <td className="px-4 py-3 text-[#6e6b7b] dark:text-[#8b8fa8]">{row.category}</td>
                  <td className="px-4 py-3 font-semibold text-[#171a24] dark:text-[#e8e9ef]">{row.price} ₽</td>
                  <td className="px-4 py-3 text-[#6e6b7b] dark:text-[#8b8fa8]">{row.stock > 0 ? row.stock : "—"}</td>
                  <td className="px-4 py-3">
                    <Tag label={sc.label} color={sc.color} dot />
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-[#9d99ac] dark:text-[#6b6f85] hover:text-[#6e6b7b] dark:text-[#8b8fa8] transition-colors">
                      <Settings size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Table footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#f0f3f8] dark:border-[#2a2c3a]">
          <span className="text-[12px] text-[#9d99ac] dark:text-[#6b6f85]">Показано {tableData.length} из {tableData.length} записей</span>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#e3eaf4] dark:border-[#2a2c3a] text-[#9d99ac] dark:text-[#6b6f85] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] disabled:opacity-40 transition-colors">
              <ChevronLeft size={13} />
            </button>
            {[1,2,3].map(p => (
              <button key={p} className={`w-7 h-7 flex items-center justify-center rounded-lg text-[12px] font-medium transition-colors ${p === 1 ? "bg-[#0080ff] text-white" : "border border-[#e3eaf4] dark:border-[#2a2c3a] text-[#6e6b7b] dark:text-[#8b8fa8] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028]"}`}>{p}</button>
            ))}
            <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#e3eaf4] dark:border-[#2a2c3a] text-[#9d99ac] dark:text-[#6b6f85] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] transition-colors">
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

// ─── Tags & Badges ────────────────────────────────────────────────────────────

function TagsSection() {
  return (
    <div className="p-6 space-y-5">
      <SectionLabel>Теги и бейджи</SectionLabel>
      <div>
        <SubLabel>Теги — варианты цветов</SubLabel>
        <div className="flex flex-wrap gap-2">
          <Tag label="Активный" color="blue" />
          <Tag label="Выполнен" color="green" />
          <Tag label="Отменён" color="red" />
          <Tag label="В ожидании" color="amber" />
          <Tag label="Черновик" color="purple" />
          <Tag label="Архив" color="gray" />
          <Tag label="MyPoint" color="brand" />
        </div>
      </div>
      <div>
        <SubLabel>С точкой статуса</SubLabel>
        <div className="flex flex-wrap gap-2">
          <Tag label="Online" color="green" dot />
          <Tag label="Processing" color="blue" dot />
          <Tag label="Error" color="red" dot />
          <Tag label="Paused" color="amber" dot />
          <Tag label="Offline" color="gray" dot />
        </div>
      </div>
      <div>
        <SubLabel>Удаляемые теги</SubLabel>
        <div className="flex flex-wrap gap-2">
          <Tag label="Frontend" color="blue" removable />
          <Tag label="Backend" color="green" removable />
          <Tag label="Design" color="purple" removable />
          <Tag label="QA" color="amber" removable />
        </div>
      </div>
      <div>
        <SubLabel>Бейджи-счётчики</SubLabel>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] text-[#4f4d5b] dark:text-[#a0a3b8]">Уведомления</span>
            <Badge label={3} color="red" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] text-[#4f4d5b] dark:text-[#a0a3b8]">Задачи</span>
            <Badge label={12} color="blue" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] text-[#4f4d5b] dark:text-[#a0a3b8]">Сообщения</span>
            <Badge label={99} color="green" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] text-[#4f4d5b] dark:text-[#a0a3b8]">Ошибки</span>
            <Badge label="!" color="amber" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Avatars ──────────────────────────────────────────────────────────────────

const avatarUsers = [
  { initials: "АА", name: "Алексей Антонов", color: "#5a4d6b" },
  { initials: "МС", name: "Мария Смирнова", color: "#0080ff" },
  { initials: "ИП", name: "Игорь Петров", color: "#22c55e" },
  { initials: "ОК", name: "Ольга Козлова", color: "#f59e0b" },
  { initials: "ДЛ", name: "Дмитрий Лебедев", color: "#ef4444" },
];

function Avatar({
  user, size = "md", online,
}: {
  user: typeof avatarUsers[0]; size?: "xs" | "sm" | "md" | "lg" | "xl"; online?: boolean;
}) {
  const sizes = { xs: "w-6 h-6 text-[9px]", sm: "w-8 h-8 text-[11px]", md: "w-10 h-10 text-[13px]", lg: "w-12 h-12 text-[15px]", xl: "w-16 h-16 text-[20px]" };
  const dotSizes = { xs: "w-1.5 h-1.5", sm: "w-2 h-2", md: "w-2.5 h-2.5", lg: "w-3 h-3", xl: "w-4 h-4" };
  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center text-white font-semibold select-none`}
        style={{ background: user.color }}
      >
        {user.initials}
      </div>
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 ${dotSizes[size]} rounded-full border-2 border-white`}
          style={{ background: online ? "#22c55e" : "#9d99ac" }}
        />
      )}
    </div>
  );
}

function AvatarsSection() {
  return (
    <div className="p-6 space-y-5">
      <SectionLabel>Аватары</SectionLabel>
      <div>
        <SubLabel>Размеры</SubLabel>
        <div className="flex items-end gap-4">
          {(["xs", "sm", "md", "lg", "xl"] as const).map((s) => (
            <div key={s} className="flex flex-col items-center gap-1.5">
              <Avatar user={avatarUsers[0]} size={s} />
              <span className="text-[10px] text-[#9d99ac] dark:text-[#6b6f85] uppercase">{s}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SubLabel>Со статусом</SubLabel>
        <div className="flex items-center gap-4">
          {avatarUsers.slice(0, 4).map((u, i) => (
            <div key={u.initials} className="flex flex-col items-center gap-1.5">
              <Avatar user={u} size="md" online={i % 2 === 0} />
              <span className="text-[10px] text-[#9d99ac] dark:text-[#6b6f85] truncate max-w-[56px] text-center">{u.name.split(" ")[0]}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SubLabel>Стек аватаров</SubLabel>
        <div className="flex -space-x-2">
          {avatarUsers.map((u) => (
            <div key={u.initials} className="ring-2 ring-white rounded-full">
              <Avatar user={u} size="sm" />
            </div>
          ))}
          <div className="ring-2 ring-white rounded-full w-8 h-8 bg-[#e3eaf4] dark:bg-[#2a2c3a] flex items-center justify-center text-[11px] font-semibold text-[#6e6b7b] dark:text-[#8b8fa8]">
            +4
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

const alertVariants = [
  {
    type: "success", icon: CheckCircle, title: "Операция выполнена",
    message: "Изменения успешно сохранены. Документ обновлён и доступен.",
    bg: "#f0fdf4", border: "#86efac", iconColor: "#16a34a", titleColor: "#14532d", textColor: "#166534",
  },
  {
    type: "info", icon: Info, title: "Информация о системе",
    message: "Запланировано техническое обслуживание 15 июля с 02:00 до 04:00.",
    bg: "#eff6ff", border: "#93c5fd", iconColor: "#2563eb", titleColor: "#1e3a8a", textColor: "#1d4ed8",
  },
  {
    type: "warning", icon: AlertTriangle, title: "Требуется внимание",
    message: "Срок действия лицензии истекает через 7 дней. Обновите подписку.",
    bg: "#fffbeb", border: "#fcd34d", iconColor: "#d97706", titleColor: "#78350f", textColor: "#92400e",
  },
  {
    type: "error", icon: AlertCircle, title: "Ошибка загрузки данных",
    message: "Не удалось получить данные от сервера. Повторите попытку позже.",
    bg: "#fef2f2", border: "#fca5a5", iconColor: "#dc2626", titleColor: "#7f1d1d", textColor: "#b91c1c",
  },
];

function AlertItem({ variant }: { variant: typeof alertVariants[0] }) {
  const Icon = variant.icon;
  return (
    <div
      className="flex gap-3 p-4 rounded-lg border"
      style={{ background: variant.bg, borderColor: variant.border }}
    >
      <Icon size={18} style={{ color: variant.iconColor }} className="shrink-0 mt-px" />
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-semibold" style={{ color: variant.titleColor }}>{variant.title}</span>
        <span className="text-[13px] leading-snug" style={{ color: variant.textColor }}>{variant.message}</span>
      </div>
    </div>
  );
}

function AlertsSection() {
  return (
    <div className="p-6 space-y-3">
      <SectionLabel>Оповещения</SectionLabel>
      {alertVariants.map((v) => <AlertItem key={v.type} variant={v} />)}
    </div>
  );
}

// ─── Form Controls ────────────────────────────────────────────────────────────

function Checkbox({ label, checked = false, indeterminate = false, disabled = false }: {
  label: string; checked?: boolean; indeterminate?: boolean; disabled?: boolean;
}) {
  const [value, setValue] = useState(checked);
  return (
    <label className={`flex items-center gap-2 cursor-pointer select-none ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}>
      <div
        onClick={() => !disabled && setValue(!value)}
        className={`w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center transition-all shrink-0
          ${value || indeterminate ? "bg-[#0080ff] border-[#0080ff]" : "border-[#d6dde8] bg-white dark:bg-[#161820]"}`}
      >
        {indeterminate && !value ? (
          <span className="w-2 h-0.5 bg-white dark:bg-[#161820] rounded-full" />
        ) : value ? (
          <Check size={11} strokeWidth={3} className="text-white" />
        ) : null}
      </div>
      <span className="text-[14px] text-[#4f4d5b] dark:text-[#a0a3b8]">{label}</span>
    </label>
  );
}

function Radio({ label, selected = false, disabled = false, name = "radio" }: {
  label: string; selected?: boolean; disabled?: boolean; name?: string;
}) {
  return (
    <label className={`flex items-center gap-2 cursor-pointer select-none ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}>
      <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all
        ${selected ? "border-[#0080ff]" : "border-[#d6dde8] bg-white dark:bg-[#161820]"}`}
      >
        {selected && <div className="w-2 h-2 rounded-full bg-[#0080ff]" />}
      </div>
      <span className="text-[14px] text-[#4f4d5b] dark:text-[#a0a3b8]">{label}</span>
    </label>
  );
}

function Toggle({ label, defaultOn = false }: { label: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setOn(!on)}
        className={`w-10 h-6 rounded-full transition-all relative shrink-0 ${on ? "bg-[#0080ff]" : "bg-[#b8bfcc]"}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white dark:bg-[#161820] rounded-full shadow transition-all ${on ? "left-[18px]" : "left-0.5"}`}
        />
      </button>
      <span className="text-[14px] text-[#4f4d5b] dark:text-[#a0a3b8]">{label}</span>
    </div>
  );
}

function FormControlsSection() {
  const [radio, setRadio] = useState("option1");
  return (
    <div className="p-6 space-y-6">
      <SectionLabel>Элементы форм</SectionLabel>
      <div className="grid grid-cols-3 gap-8">
        <div className="space-y-2">
          <SubLabel>Чекбоксы</SubLabel>
          <div className="space-y-2.5">
            <Checkbox label="Выбрать всё" indeterminate />
            <Checkbox label="Отправить уведомления" checked />
            <Checkbox label="Принять условия" />
            <Checkbox label="Недоступный вариант" disabled />
          </div>
        </div>
        <div className="space-y-2">
          <SubLabel>Радио-кнопки</SubLabel>
          <div className="space-y-2.5">
            {["option1", "option2", "option3"].map((o, i) => (
              <div key={o} onClick={() => setRadio(o)}>
                <Radio
                  label={["Ежедневно", "Еженедельно", "Ежемесячно"][i]}
                  selected={radio === o}
                  name="freq"
                />
              </div>
            ))}
            <Radio label="Недоступный вариант" disabled />
          </div>
        </div>
        <div className="space-y-2">
          <SubLabel>Переключатели</SubLabel>
          <div className="space-y-2.5">
            <Toggle label="Тёмная тема" defaultOn={false} />
            <Toggle label="Push-уведомления" defaultOn={true} />
            <Toggle label="Автосохранение" defaultOn={true} />
            <Toggle label="Двойная аутентификация" defaultOn={false} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────

type SidebarMenuItem = { id: string; label: string; disabled?: boolean };

type SidebarMenuGroup = {
  id: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  label: string;
  children?: SidebarMenuItem[];
};

const MP_SIDEBAR_MENU: SidebarMenuGroup[] = [
  {
    id: "analytics",
    icon: PieChart,
    label: "Аналитика",
    children: [
      { id: "analytics-sales", label: "Продажи" },
      { id: "analytics-products", label: "По продукции" },
    ],
  },
  { id: "kassa", icon: Monitor, label: "Касса" },
  {
    id: "delivery",
    icon: Truck,
    label: "Доставка",
    children: [
      { id: "delivery-done", label: "Завершенные" },
      { id: "delivery-orders", label: "Заказы" },
    ],
  },
  {
    id: "marketing",
    icon: Users,
    label: "Маркетинг",
    children: [
      { id: "marketing-clients", label: "Клиенты" },
      { id: "marketing-programs", label: "Бонусные программы" },
      { id: "marketing-bonus-move", label: "Движение бонусов" },
      { id: "marketing-bonus-articles", label: "Статьи движения бонусов" },
    ],
  },
  {
    id: "storefront",
    icon: Globe,
    label: "Интернет витрина",
    children: [
      { id: "storefront-orders", label: "Заказы" },
      { id: "storefront-settings", label: "Настройки" },
    ],
  },
  {
    id: "order-screen",
    icon: Layout,
    label: "Экран заказов",
    children: [
      { id: "order-screen-orders", label: "Заказы" },
      { id: "order-screen-stages", label: "Этапы" },
      { id: "order-screen-shops", label: "Цехи" },
    ],
  },
  { id: "vision", icon: Eye, label: "Проверка зрения" },
  {
    id: "pos",
    icon: Home,
    label: "Точки продаж",
    children: [
      { id: "pos-halls", label: "Карта залов" },
      { id: "pos-money", label: "Движение денег" },
      { id: "pos-sales", label: "Продажи" },
      { id: "pos-returns", label: "Возвраты" },
      { id: "pos-collection", label: "Инкассации" },
      { id: "pos-zreports", label: "Z-Отчёты" },
    ],
  },
  {
    id: "warehouses",
    icon: Package,
    label: "Склады",
    children: [
      { id: "wh-stock", label: "Остатки" },
      { id: "wh-movement", label: "Движение товара" },
      { id: "wh-incoming", label: "Приходные накладные" },
      { id: "wh-transfers", label: "Заявки перемещений" },
      { id: "wh-reprice", label: "Переоценка" },
      { id: "wh-writeoff", label: "Списания" },
      { id: "wh-inventory", label: "Инвентаризации" },
      { id: "wh-production", label: "Производство" },
      { id: "wh-techcards", label: "Тех. карты" },
    ],
  },
  {
    id: "org",
    icon: Network,
    label: "Организация",
    children: [
      { id: "org-money", label: "Движение денег" },
      { id: "org-salary", label: "Заработная плата" },
      { id: "org-pos", label: "Точки продаж" },
      { id: "org-warehouses", label: "Склады" },
      { id: "org-employees", label: "Сотрудники" },
      { id: "org-access", label: "Доступы" },
      { id: "org-settings", label: "Настройки" },
    ],
  },
  {
    id: "schedule",
    icon: Calendar,
    label: "График работы",
    children: [
      { id: "schedule-grid", label: "График" },
      { id: "schedule-shifts", label: "Рабочие смены" },
    ],
  },
  {
    id: "base",
    icon: Database,
    label: "База",
    children: [
      { id: "base-products", label: "Товары и услуги" },
      { id: "base-suppliers", label: "Поставщики" },
      { id: "base-prices", label: "Типы цен" },
      { id: "base-categories", label: "Категории товаров" },
      { id: "base-units", label: "Ед. измерения товаров" },
      { id: "base-articles", label: "Статьи движения денег" },
    ],
  },
];

const MP_SIDEBAR_FOOTER: SidebarMenuGroup[] = [
  { id: "about", icon: Info, label: "О сервисе" },
  { id: "integrations", icon: Link2, label: "Интеграции" },
  { id: "equipment", icon: Wrench, label: "Оборудование" },
  { id: "help", icon: HelpCircle, label: "Помощь" },
  { id: "modules", icon: Grid, label: "Модули" },
];

const MP_SIDEBAR_COLLAPSED_FOOTER = [
  { id: "about", icon: Info, label: "О сервисе" },
  { id: "help", icon: HelpCircle, label: "Помощь" },
  { id: "logout", icon: LogOut, label: "Выход" },
];

const MP_SIDEBAR_BG = "#1F1824";
const MP_SIDEBAR_SUBITEM = "#342d48";
const MP_SIDEBAR_SURFACE = "#2a2438";
const MP_SIDEBAR_PRIMARY = "#0080ff";
const MP_SIDEBAR_TEXT = "#c4bfd4";
const MP_SIDEBAR_TEXT_MUTED = "#9d99ac";
const MP_SIDEBAR_TEXT_DIM = "#6b6578";
const MP_SIDEBAR_TRANSITION = "transition-all duration-150 ease-out";

const MP_SIDEBAR_DEFAULT_OPEN = new Set(
  MP_SIDEBAR_MENU.filter((g) => g.children && g.children.length > 0).map((g) => g.id),
);

type SidebarFlyoutState = {
  id: string;
  label: string;
  items?: SidebarMenuItem[];
  top: number;
  left: number;
};

function SidebarFixedFlyout({
  flyout,
  activeId,
  onSelect,
  onEnter,
  onLeave,
}: {
  flyout: SidebarFlyoutState | null;
  activeId: string;
  onSelect: (id: string) => void;
  onEnter: () => void;
  onLeave: () => void;
}) {
  if (!flyout) return null;

  return createPortal(
    <div
      className="fixed z-[9999]"
      style={{ top: flyout.top, left: flyout.left, transform: "translateY(-50%)" }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className="pl-2">
        <div
          className="min-w-[232px] rounded-[12px] border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.45)] py-3 relative"
          style={{ background: MP_SIDEBAR_BG }}
        >
          <div
            className="absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent"
            style={{ borderRightColor: MP_SIDEBAR_BG }}
            aria-hidden
          />
          <p className="px-3.5 pb-2 text-[13px] font-semibold text-white tracking-tight">{flyout.label}</p>
          {flyout.items && flyout.items.length > 0 && (
            <>
              <div className="mx-3 border-t border-white/[0.08]" />
              <div className="pt-2 px-2 space-y-1">
                {flyout.items.map((child) => {
                  const isActive = activeId === child.id;
                  return (
                    <button
                      key={child.id}
                      disabled={child.disabled}
                      onClick={() => !child.disabled && onSelect(child.id)}
                      className={`w-full text-left min-h-[36px] px-3 py-2 rounded-[8px] text-[13px] font-medium leading-tight ${MP_SIDEBAR_TRANSITION}
                        ${child.disabled
                          ? "text-[#5c5768] cursor-not-allowed"
                          : isActive
                            ? "bg-[#342d48] text-white ring-1 ring-white/10"
                            : "text-[#c4bfd4] hover:bg-[#2a2438] hover:text-white"}`}
                    >
                      {child.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function isSidebarGroupActive(group: SidebarMenuGroup, activeId: string) {
  return activeId === group.id || (group.children?.some((c) => c.id === activeId) ?? false);
}

function MyPointSidebar({
  collapsed = false,
  onToggleCollapse,
  maxHeight,
}: {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  maxHeight?: number | string;
}) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => new Set(MP_SIDEBAR_DEFAULT_OPEN),
  );
  const [activeId, setActiveId] = useState("pos-sales");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [flyout, setFlyout] = useState<SidebarFlyoutState | null>(null);
  const hideFlyoutTimer = useRef<number | null>(null);
  const prevCollapsedRef = useRef(collapsed);

  const clearHideFlyoutTimer = () => {
    if (hideFlyoutTimer.current !== null) {
      window.clearTimeout(hideFlyoutTimer.current);
      hideFlyoutTimer.current = null;
    }
  };

  const showFlyout = (
    id: string,
    label: string,
    el: HTMLElement,
    items?: SidebarMenuItem[],
  ) => {
    clearHideFlyoutTimer();
    const rect = el.getBoundingClientRect();
    setHoveredId(id);
    setFlyout({
      id,
      label,
      items,
      top: rect.top + rect.height / 2,
      left: rect.right + 8,
    });
  };

  const scheduleHideFlyout = () => {
    clearHideFlyoutTimer();
    hideFlyoutTimer.current = window.setTimeout(() => {
      setHoveredId(null);
      setFlyout(null);
    }, 120);
  };

  useEffect(() => () => clearHideFlyoutTimer(), []);

  useEffect(() => {
    if (onToggleCollapse && prevCollapsedRef.current && !collapsed) {
      setOpenGroups(new Set());
    }
    if (collapsed) {
      setHoveredId(null);
      setFlyout(null);
    }
    prevCollapsedRef.current = collapsed;
  }, [collapsed, onToggleCollapse]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (collapsed) {
    return (
      <div
        className="relative flex flex-col shrink-0 rounded-[14px] border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.32)] overflow-visible"
        style={{
          width: 64,
          background: MP_SIDEBAR_BG,
          maxHeight: maxHeight ?? "none",
        }}
      >
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={`absolute -right-3 top-5 z-20 w-6 h-6 flex items-center justify-center rounded-full border border-white/[0.12] text-[#c4bfd4] hover:text-white ${MP_SIDEBAR_TRANSITION} shadow-md`}
            style={{ background: MP_SIDEBAR_SURFACE }}
            title="Развернуть меню"
          >
            <ChevronRight size={12} />
          </button>
        )}

        <div className="flex flex-col items-center pt-4 pb-3 shrink-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(0,128,255,0.35)]"
            style={{ background: MP_SIDEBAR_PRIMARY }}
          >
            <div className="w-4 h-4 border-2 border-white rounded-[3px] rotate-45" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-kit px-2.5 py-1 space-y-1.5">
          {MP_SIDEBAR_MENU.map((group) => {
            const Icon = group.icon;
            const isActive = isSidebarGroupActive(group, activeId);
            const isHovered = hoveredId === group.id;

            return (
              <div key={group.id} className="relative flex justify-center">
                <button
                  onClick={() => {
                    if (!group.children?.length) setActiveId(group.id);
                  }}
                  onMouseEnter={(e) => {
                    showFlyout(
                      group.id,
                      group.label,
                      e.currentTarget,
                      group.children,
                    );
                  }}
                  onMouseLeave={scheduleHideFlyout}
                  className={`w-10 h-10 flex items-center justify-center rounded-[10px] ${MP_SIDEBAR_TRANSITION}
                    ${isActive
                      ? "text-white shadow-[0_2px_12px_rgba(0,128,255,0.4)]"
                      : isHovered
                        ? "text-white"
                        : "text-[#9d99ac] hover:text-white"}`}
                  style={{
                    background: isActive
                      ? MP_SIDEBAR_PRIMARY
                      : isHovered
                        ? MP_SIDEBAR_SURFACE
                        : "transparent",
                  }}
                >
                  <Icon size={20} strokeWidth={1.75} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="shrink-0 px-2.5 pt-3 pb-3 border-t border-white/[0.08] space-y-1.5">
          {MP_SIDEBAR_COLLAPSED_FOOTER.map((item) => {
            const Icon = item.icon;
            const isHovered = hoveredId === item.id;
            const isActive = activeId === item.id;
            return (
              <div key={item.id} className="relative flex justify-center">
                <button
                  onClick={() => item.id !== "logout" && setActiveId(item.id)}
                  onMouseEnter={(e) => showFlyout(item.id, item.label, e.currentTarget)}
                  onMouseLeave={scheduleHideFlyout}
                  className={`w-10 h-10 flex items-center justify-center rounded-[10px] ${MP_SIDEBAR_TRANSITION}
                    ${isActive
                      ? "text-white"
                      : isHovered
                        ? "text-white"
                        : "text-[#9d99ac] hover:text-white"}`}
                  style={{
                    background: isActive
                      ? "rgba(0,128,255,0.18)"
                      : isHovered
                        ? MP_SIDEBAR_SURFACE
                        : "transparent",
                  }}
                >
                  <Icon size={18} strokeWidth={1.75} />
                </button>
              </div>
            );
          })}
        </div>

        <SidebarFixedFlyout
          flyout={flyout}
          activeId={activeId}
          onSelect={setActiveId}
          onEnter={clearHideFlyoutTimer}
          onLeave={scheduleHideFlyout}
        />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col shrink-0 overflow-hidden rounded-[14px] border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.32)]"
      style={{
        width: 280,
        background: MP_SIDEBAR_BG,
        maxHeight: maxHeight ?? "none",
      }}
    >
      <div className="relative flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] shrink-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-[0_4px_14px_rgba(0,128,255,0.35)]"
          style={{ background: MP_SIDEBAR_PRIMARY }}
        >
          <div className="w-4 h-4 border-2 border-white rounded-[3px] rotate-45" />
        </div>
        <span className="flex-1 text-[13px] font-bold text-white tracking-[0.06em] uppercase">My Point</span>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className={`w-7 h-7 flex items-center justify-center rounded-full bg-white/[0.06] text-[#9d99ac] hover:bg-white/[0.1] hover:text-white ${MP_SIDEBAR_TRANSITION}`}
            title="Свернуть меню"
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-kit px-3 py-3 space-y-0.5">
        {MP_SIDEBAR_MENU.map((group) => {
          const Icon = group.icon;
          const hasChildren = !!group.children?.length;
          const isOpen = hasChildren && openGroups.has(group.id);
          const isGroupActive = isSidebarGroupActive(group, activeId);

          if (!hasChildren) {
            return (
              <button
                key={group.id}
                onClick={() => setActiveId(group.id)}
                className={`w-full flex items-center gap-3 min-h-[40px] px-3 py-2 rounded-[10px] text-left ${MP_SIDEBAR_TRANSITION}
                  ${activeId === group.id
                    ? "text-white shadow-[0_2px_12px_rgba(0,128,255,0.35)]"
                    : "text-[#c4bfd4] hover:bg-[#2a2438] hover:text-white"}`}
                style={{
                  background: activeId === group.id ? MP_SIDEBAR_PRIMARY : undefined,
                }}
              >
                <Icon size={18} strokeWidth={1.75} className="shrink-0 opacity-90" />
                <span className="text-[13px] font-medium flex-1 leading-tight">{group.label}</span>
                <ChevronRight size={14} className="text-[#6b6578] shrink-0 opacity-80" />
              </button>
            );
          }

          return (
            <div key={group.id} className="py-0.5">
              <button
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center gap-3 min-h-[40px] px-3 py-2 rounded-[10px] text-left ${MP_SIDEBAR_TRANSITION}
                  ${isGroupActive
                    ? "text-white shadow-[0_2px_12px_rgba(0,128,255,0.35)]"
                    : "text-[#c4bfd4] hover:bg-[#2a2438] hover:text-white"}`}
                style={{
                  background: isGroupActive ? MP_SIDEBAR_PRIMARY : undefined,
                }}
              >
                <Icon size={18} strokeWidth={1.75} className="shrink-0 opacity-90" />
                <span className="text-[13px] font-medium flex-1 leading-tight">{group.label}</span>
                {isOpen
                  ? <ChevronDown size={14} className={`shrink-0 opacity-80 ${isGroupActive ? "text-white/85" : "text-[#9d99ac]"}`} />
                  : <ChevronRight size={14} className={`shrink-0 opacity-80 ${isGroupActive ? "text-white/85" : "text-[#9d99ac]"}`} />}
              </button>

              {isOpen && group.children && (
                <div className="pt-1.5 pb-2">
                  <div className="relative ml-[18px] pl-[14px] border-l border-white/10 space-y-1">
                    {group.children.map((child) => {
                      const isActive = activeId === child.id;
                      return (
                        <button
                          key={child.id}
                          disabled={child.disabled}
                          onClick={() => !child.disabled && setActiveId(child.id)}
                          className={`w-full text-left min-h-[36px] px-3 py-2 rounded-[8px] text-[13px] font-medium leading-tight ${MP_SIDEBAR_TRANSITION}
                            ${child.disabled
                              ? "bg-[#342d48] text-[#5c5768] cursor-not-allowed opacity-60"
                              : isActive
                                ? "bg-[#342d48] text-white ring-1 ring-white/10"
                                : "bg-[#342d48] text-[#b8b3c8] hover:bg-[#3d3654] hover:text-white"}`}
                        >
                          {child.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="shrink-0 px-3 pt-3 pb-3.5 border-t border-white/[0.08] space-y-0.5">
        {MP_SIDEBAR_FOOTER.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveId(item.id)}
              className={`w-full flex items-center gap-3 min-h-[36px] px-3 py-2 rounded-[10px] text-left ${MP_SIDEBAR_TRANSITION}
                ${isActive
                  ? "bg-[#0080ff]/15 text-white"
                  : "text-[#9d99ac] hover:bg-[#2a2438] hover:text-white"}`}
            >
              <Icon size={16} strokeWidth={1.75} className="shrink-0 opacity-90" />
              <span className="text-[13px] font-medium flex-1 leading-tight">{item.label}</span>
              <ChevronRight size={14} className="text-[#6b6578] shrink-0 opacity-70" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NavigationSection() {
  const [activeTab, setActiveTab] = useState("overview");
  const [page, setPage] = useState(3);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const tabs = [
    { id: "overview", label: "Обзор" },
    { id: "analytics", label: "Аналитика" },
    { id: "reports", label: "Отчёты" },
    { id: "settings", label: "Настройки" },
    { id: "archive", label: "Архив" },
  ];
  return (
    <div className="p-6 space-y-6">
      <SectionLabel>Навигация</SectionLabel>
      <div>
        <SubLabel>Хлебные крошки</SubLabel>
        <div className="flex items-center gap-1 text-[13px]">
          {["Главная", "Проекты", "MyPoint CRM", "Настройки"].map((crumb, i, arr) => (
            <div key={crumb} className="flex items-center gap-1">
              <span className={i === arr.length - 1 ? "text-[#171a24] dark:text-[#e8e9ef] font-medium" : "text-[#9d99ac] dark:text-[#6b6f85] hover:text-[#6e6b7b] dark:text-[#8b8fa8] cursor-pointer transition-colors"}>
                {crumb}
              </span>
              {i < arr.length - 1 && <ChevronRight size={12} className="text-[#c4cad8]" />}
            </div>
          ))}
        </div>
      </div>
      <div>
        <SubLabel>Табы</SubLabel>
        <div className="border-b border-[#e3eaf4] dark:border-[#2a2c3a]">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-[13px] font-medium relative transition-colors
                  ${activeTab === tab.id ? "text-[#0080ff]" : "text-[#9d99ac] dark:text-[#6b6f85] hover:text-[#6e6b7b] dark:text-[#8b8fa8]"}`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0080ff] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="pt-3 text-[13px] text-[#9d99ac] dark:text-[#6b6f85]">Содержимое вкладки: <span className="font-medium text-[#6e6b7b] dark:text-[#8b8fa8]">{tabs.find(t => t.id === activeTab)?.label}</span></div>
      </div>
      <div>
        <SubLabel>Боковое меню · MyPoint Sidebar</SubLabel>
        <div className="flex items-start gap-3 bg-[#eef2ff] border border-[#c7d2fe] rounded-lg px-4 py-3 mb-4">
          <Sidebar size={15} className="text-[#4338ca] shrink-0 mt-0.5" />
          <span className="text-[13px] text-[#3730a3] dark:text-[#a5b4fc]">
            Полноценное боковое меню продукта: <strong>группы с вложенностью</strong>, активный пункт, footer-ссылки и сворачивание. В свёрнутом режиме — иконки и flyout при наведении.
          </span>
        </div>
        <div className="flex flex-wrap gap-6 items-start overflow-visible">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] text-[#9d99ac] dark:text-[#6b6f85]">Развёрнутое · 280px</span>
            <MyPointSidebar maxHeight={640} />
          </div>
          <div className="flex flex-col gap-2 pr-[220px] overflow-visible">
            <span className="text-[11px] text-[#9d99ac] dark:text-[#6b6f85]">Свёрнутое · 64px · наведи на иконку</span>
            <MyPointSidebar
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
              maxHeight={640}
            />
          </div>
        </div>
      </div>
      <div>
        <SubLabel>Боковое меню · Compact</SubLabel>
        <div className="bg-[#1a1620] dark:bg-[#0d0e12] rounded-xl p-3 w-52 space-y-0.5">
          {[
            { icon: Home, label: "Главная", active: false },
            { icon: BarChart2, label: "Аналитика", active: true },
            { icon: FileText, label: "Документы", active: false },
            { icon: Bell, label: "Уведомления", active: false },
            { icon: Settings, label: "Настройки", active: false },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all
                  ${item.active ? "bg-[#0080ff] text-white" : "text-[#9d99ac] dark:text-[#6b6f85] hover:bg-white/10 hover:text-white"}`}
              >
                <Icon size={15} />
                <span className="text-[13px] font-medium">{item.label}</span>
              </div>
            );
          })}
          <div className="pt-2 mt-2 border-t border-white/10">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#9d99ac] dark:text-[#6b6f85] hover:bg-white/10 hover:text-white cursor-pointer transition-all">
              <LogOut size={15} />
              <span className="text-[13px] font-medium">Выйти</span>
            </div>
          </div>
        </div>
      </div>
      <div>
        <SubLabel>Пагинация</SubLabel>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e3eaf4] dark:border-[#2a2c3a] text-[#6e6b7b] dark:text-[#8b8fa8] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          {[1, 2, 3, 4, 5, "...", 12].map((p, i) => (
            <button
              key={i}
              onClick={() => typeof p === "number" && setPage(p)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-medium transition-colors
                ${p === page ? "bg-[#0080ff] text-white" : typeof p === "number" ? "border border-[#e3eaf4] dark:border-[#2a2c3a] text-[#6e6b7b] dark:text-[#8b8fa8] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028]" : "text-[#9d99ac] dark:text-[#6b6f85] cursor-default"}`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(Math.min(12, page + 1))}
            disabled={page === 12}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e3eaf4] dark:border-[#2a2c3a] text-[#6e6b7b] dark:text-[#8b8fa8] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <SubLabel>Mobile · Bottom Tab Bar</SubLabel>
          <span className="text-[11px] bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa] px-2 py-0.5 rounded-full font-medium">Mobile only</span>
        </div>
        <div className="flex items-start gap-3 bg-[#fff7ed] border border-[#fed7aa] rounded-lg px-4 py-3 mb-4">
          <Info size={15} className="text-[#c2410c] shrink-0 mt-0.5" />
          <span className="text-[13px] text-[#9a3412]">
            На мобильных боковой sidebar заменяется на <strong>Bottom Tab Bar</strong> — фиксированная панель снизу с 4–5 иконками. Активный таб подсвечивается, бейдж показывает счётчик.
          </span>
        </div>
        <div className="flex gap-8 items-start flex-wrap">
          {/* Static bottom bar preview */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] text-[#9d99ac] dark:text-[#6b6f85]">Bottom Tab Bar</span>
            <div className="w-[320px] bg-white dark:bg-[#161820] border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-2xl overflow-hidden">
              {/* Screen content */}
              <div className="bg-[#f5f7fa] dark:bg-[#1e2028] h-32 p-3 space-y-2">
                <div className="h-4 bg-[#e3eaf4] dark:bg-[#2a2c3a] rounded w-2/3" />
                <div className="h-3 bg-[#e3eaf4] dark:bg-[#2a2c3a] rounded w-full" />
                <div className="h-3 bg-[#e3eaf4] dark:bg-[#2a2c3a] rounded w-4/5" />
              </div>
              {/* Tab bar */}
              <BottomTabBar />
            </div>
          </div>
          {/* With badge */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] text-[#9d99ac] dark:text-[#6b6f85]">С бейджем и FAB-кнопкой</span>
            <div className="w-[320px] bg-white dark:bg-[#161820] border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-2xl overflow-hidden">
              <div className="bg-[#f5f7fa] dark:bg-[#1e2028] h-32 p-3 space-y-2">
                <div className="h-4 bg-[#e3eaf4] dark:bg-[#2a2c3a] rounded w-1/2" />
                <div className="h-3 bg-[#e3eaf4] dark:bg-[#2a2c3a] rounded w-full" />
              </div>
              <BottomTabBarWithFab />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BottomTabBar() {
  const [active, setActive] = useState("home");
  const tabs = [
    { id: "home",    icon: Home,     label: "Главная" },
    { id: "chart",   icon: BarChart2, label: "Отчёты" },
    { id: "orders",  icon: ShoppingCart, label: "Заказы", badge: 3 },
    { id: "profile", icon: User,     label: "Профиль" },
  ];
  return (
    <div className="flex items-center border-t border-[#f0f3f8] dark:border-[#2a2c3a] px-2">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 relative transition-colors ${isActive ? "text-[#0080ff]" : "text-[#9d99ac] dark:text-[#6b6f85]"}`}
          >
            <div className="relative">
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              {tab.badge && (
                <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] bg-[#ef4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-medium ${isActive ? "text-[#0080ff]" : "text-[#9d99ac] dark:text-[#6b6f85]"}`}>{tab.label}</span>
            {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#0080ff] rounded-full" />}
          </button>
        );
      })}
    </div>
  );
}

function BottomTabBarWithFab() {
  const [active, setActive] = useState("home");
  const tabs = [
    { id: "home",    icon: Home,      label: "Главная" },
    { id: "orders",  icon: FileText,  label: "Заказы" },
    { id: "fab",     icon: Plus,      label: "",       isFab: true },
    { id: "chart",   icon: BarChart2, label: "Отчёты", badge: 5 },
    { id: "profile", icon: User,      label: "Профиль" },
  ];
  return (
    <div className="flex items-center border-t border-[#f0f3f8] dark:border-[#2a2c3a] px-2">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        if (tab.isFab) {
          return (
            <div key={tab.id} className="flex-1 flex justify-center -mt-5">
              <button className="w-12 h-12 bg-[#0080ff] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#006fe0] transition-colors"
                style={{ boxShadow: "0 4px 12px rgba(0,128,255,0.4)" }}>
                <Plus size={22} strokeWidth={2.5} />
              </button>
            </div>
          );
        }
        return (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 relative transition-colors ${isActive ? "text-[#0080ff]" : "text-[#9d99ac] dark:text-[#6b6f85]"}`}
          >
            <div className="relative">
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              {tab.badge && (
                <span className="absolute -top-1 -right-1.5 min-w-[14px] h-[14px] bg-[#ef4444] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-medium ${isActive ? "text-[#0080ff]" : "text-[#9d99ac] dark:text-[#6b6f85]"}`}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Receipt ─────────────────────────────────────────────────────────────────

function ReceiptSection() {
  return (
    <div className="p-6 space-y-5">
      <SectionLabel>Отложенный чек</SectionLabel>
      <SubLabel>Компонент чека заказа на доставку — собран из примитивов MyPoint</SubLabel>
      <div className="flex justify-center py-6 bg-[#f0f3f8] dark:bg-[#0d0e12] rounded-xl">
        <DeferredOrderReceipt data={demoDeferredOrderReceipt} />
      </div>
    </div>
  );
}

// ─── Cards & Metrics ─────────────────────────────────────────────────────────

const metrics = [
  { label: "Выручка за месяц", value: "84 320 ₽", delta: "+12.4%", trend: "up", icon: TrendingUp, color: "#22c55e" },
  { label: "Средний чек", value: "680 ₽", delta: "+3.1%", trend: "up", icon: TrendingUp, color: "#22c55e" },
  { label: "Кол-во заказов", value: "124", delta: "−8.2%", trend: "down", icon: TrendingDown, color: "#ef4444" },
  { label: "NPS клиентов", value: "98", delta: "+2pts", trend: "up", icon: TrendingUp, color: "#22c55e" },
];

function CardsSection() {
  return (
    <div className="p-6 space-y-5">
      <SectionLabel>Карточки и метрики</SectionLabel>
      <div>
        <SubLabel>Карточки метрик</SubLabel>
        <div className="grid grid-cols-4 gap-4">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="bg-white dark:bg-[#161820] rounded-xl p-4 border border-[#e3eaf4] dark:border-[#2a2c3a] space-y-3">
                <span className="text-[12px] text-[#9d99ac] dark:text-[#6b6f85]">{m.label}</span>
                <div className="text-[26px] font-bold text-[#171a24] dark:text-[#e8e9ef] leading-none">{m.value}</div>
                <div className="flex items-center gap-1">
                  <Icon size={13} style={{ color: m.color }} />
                  <span className="text-[12px] font-medium" style={{ color: m.color }}>{m.delta}</span>
                  <span className="text-[12px] text-[#9d99ac] dark:text-[#6b6f85]">vs прошлый месяц</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <SubLabel>Карточки контента</SubLabel>
        <div className="grid grid-cols-3 gap-4">
          {[
            { title: "Обновление CRM", desc: "Новая версия включает улучшенный интерфейс и расширенные фильтры.", tag: "blue", tagLabel: "Обновление", date: "28 июн 2026" },
            { title: "Анализ продаж Q2", desc: "Квартальный отчёт по продажам с разбивкой по каналам и регионам.", tag: "green", tagLabel: "Отчёт", date: "15 июн 2026" },
            { title: "Проблема с интеграцией", desc: "Обнаружена ошибка при синхронизации с внешним API поставщика.", tag: "red", tagLabel: "Инцидент", date: "10 июн 2026" },
          ].map((card) => (
            <div key={card.title} className="bg-white dark:bg-[#161820] rounded-xl p-4 border border-[#e3eaf4] dark:border-[#2a2c3a] flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <Tag label={card.tagLabel} color={card.tag} />
                <span className="text-[11px] text-[#9d99ac] dark:text-[#6b6f85]">{card.date}</span>
              </div>
              <div className="font-semibold text-[15px] text-[#171a24] dark:text-[#e8e9ef]">{card.title}</div>
              <div className="text-[13px] text-[#6e6b7b] dark:text-[#8b8fa8] leading-snug">{card.desc}</div>
              <button className="self-start text-[12px] font-medium text-[#0080ff] hover:text-[#006fe0] transition-colors flex items-center gap-1">
                Подробнее <ChevronRight size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <SubLabel>Таблица данных</SubLabel>
        <div className="bg-white dark:bg-[#161820] rounded-xl border border-[#e3eaf4] dark:border-[#2a2c3a] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#e3eaf4] dark:border-[#2a2c3a] bg-[#f5f7fa] dark:bg-[#1e2028]">
                {["Клиент", "Заказ", "Сумма", "Статус", "Дата"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#9d99ac] dark:text-[#6b6f85]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f3f8] dark:divide-[#2a2c3a]">
              {[
                { client: "Антонов А.В.", order: "#10482", amount: "12 400 ₽", status: "green", statusLabel: "Доставлен", date: "27.06.2026" },
                { client: "Смирнова М.И.", order: "#10483", amount: "3 750 ₽", status: "blue", statusLabel: "В пути", date: "27.06.2026" },
                { client: "Петров И.Г.", order: "#10484", amount: "8 900 ₽", status: "amber", statusLabel: "Обрабатывается", date: "26.06.2026" },
                { client: "Козлова О.Д.", order: "#10485", amount: "650 ₽", status: "red", statusLabel: "Отменён", date: "25.06.2026" },
              ].map((row) => (
                <tr key={row.order} className="hover:bg-[#fafbfd] dark:bg-[#161820] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#332c38] dark:text-[#e8e9ef]">{row.client}</td>
                  <td className="px-4 py-3 text-[#6e6b7b] dark:text-[#8b8fa8] font-mono">{row.order}</td>
                  <td className="px-4 py-3 font-semibold text-[#171a24] dark:text-[#e8e9ef]">{row.amount}</td>
                  <td className="px-4 py-3"><Tag label={row.statusLabel} color={row.status} dot /></td>
                  <td className="px-4 py-3 text-[#9d99ac] dark:text-[#6b6f85]">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const iconCategories = [
  {
    name: "Навигация",
    icons: [
      { name: "ArrowLeft",      el: ArrowLeft },
      { name: "ArrowRight",     el: ArrowRight },
      { name: "ArrowUp",        el: ArrowUp },
      { name: "ArrowDown",      el: ArrowDown },
      { name: "ChevronLeft",    el: ChevronLeft },
      { name: "ChevronRight",   el: ChevronRight },
      { name: "ChevronDown",    el: ChevronDown },
      { name: "ChevronUp",      el: ArrowUp },
      { name: "Home",           el: Home },
      { name: "Menu",           el: Menu },
      { name: "Sidebar",        el: Sidebar },
      { name: "Layout",         el: Layout },
      { name: "Grid",           el: Grid },
      { name: "List",           el: List },
      { name: "Columns",        el: Columns },
      { name: "MoreHorizontal", el: MoreHorizontal },
      { name: "MoreVertical",   el: MoreVertical },
      { name: "Navigation",     el: Navigation },
      { name: "Compass",        el: Compass },
      { name: "Map",            el: Map },
      { name: "MapPin",         el: MapPin },
      { name: "LogIn",          el: LogIn },
      { name: "LogOut",         el: LogOut },
      { name: "Maximize2",      el: Maximize2 },
      { name: "Minimize2",      el: Minimize2 },
      { name: "Move",           el: Move },
    ],
  },
  {
    name: "Действия",
    icons: [
      { name: "Plus",       el: Plus },
      { name: "Minus",      el: Minus },
      { name: "X",          el: X },
      { name: "Check",      el: Check },
      { name: "Edit2",      el: Edit2 },
      { name: "Edit3",      el: Edit3 },
      { name: "Trash",      el: Trash },
      { name: "Trash2",     el: Trash2 },
      { name: "Copy",       el: Copy },
      { name: "Clipboard",  el: Clipboard },
      { name: "Scissors",   el: Scissors },
      { name: "Link",       el: Link },
      { name: "Link2",      el: Link2 },
      { name: "Paperclip",  el: Paperclip },
      { name: "Download",   el: Download },
      { name: "Upload",     el: Upload },
      { name: "Share",      el: Share },
      { name: "Share2",     el: Share2 },
      { name: "Search",     el: Search },
      { name: "ZoomIn",     el: ZoomIn },
      { name: "ZoomOut",    el: ZoomOut },
      { name: "Filter",     el: Filter },
      { name: "SortAsc",    el: SortAsc },
      { name: "Save",       el: Save },
      { name: "RefreshCw",  el: RefreshCw },
      { name: "RotateCcw",  el: RotateCcw },
      { name: "Crop",       el: Crop },
      { name: "Sliders",    el: Sliders },
    ],
  },
  {
    name: "Файлы",
    icons: [
      { name: "File",        el: File },
      { name: "FileText",    el: FileText },
      { name: "Folder",      el: Folder },
      { name: "FolderOpen",  el: FolderOpen },
      { name: "Archive",     el: Archive },
      { name: "Inbox",       el: Inbox },
      { name: "Send",        el: Send },
      { name: "Database",    el: Database },
      { name: "Server",      el: Server },
      { name: "HardDrive",   el: HardDrive },
      { name: "Layers",      el: Layers },
      { name: "Package",     el: Package },
      { name: "Box",         el: Box },
      { name: "Image",       el: Image },
      { name: "Disc",        el: Disc },
    ],
  },
  {
    name: "Коммуникация",
    icons: [
      { name: "Mail",          el: Mail },
      { name: "MessageSquare", el: MessageSquare },
      { name: "MessageCircle", el: MessageCircle },
      { name: "Phone",         el: Phone },
      { name: "PhoneCall",     el: PhoneCall },
      { name: "Video",         el: Video },
      { name: "VideoOff",      el: VideoOff },
      { name: "Camera",        el: Camera },
      { name: "Mic",           el: Mic },
      { name: "MicOff",        el: MicOff },
      { name: "Bell",          el: Bell },
      { name: "Voicemail",     el: Voicemail },
      { name: "Rss",           el: Rss },
      { name: "Globe",         el: Globe },
      { name: "Wifi",          el: Wifi },
      { name: "WifiOff",       el: WifiOff },
      { name: "Bluetooth",     el: Bluetooth },
      { name: "Radio",         el: RadioIcon },
      { name: "Speaker",       el: Speaker },
      { name: "Headphones",    el: Headphones },
    ],
  },
  {
    name: "Пользователи",
    icons: [
      { name: "User",      el: User },
      { name: "Users",     el: Users },
      { name: "UserCheck", el: UserCheck },
      { name: "UserMinus", el: UserMinus },
      { name: "UserPlus",  el: UserPlus },
      { name: "UserX",     el: UserX },
      { name: "Briefcase", el: Briefcase },
      { name: "Building",  el: Building },
      { name: "Award",     el: Award },
      { name: "Star",      el: Star },
      { name: "Heart",     el: Heart },
      { name: "ThumbsUp",  el: ThumbsUp },
      { name: "ThumbsDown",el: ThumbsDown },
      { name: "Smile",     el: Smile },
      { name: "Meh",       el: Meh },
      { name: "Frown",     el: Frown },
    ],
  },
  {
    name: "Данные и аналитика",
    icons: [
      { name: "BarChart",  el: BarChart },
      { name: "BarChart2", el: BarChart2 },
      { name: "PieChart",  el: PieChart },
      { name: "LineChart", el: LineChart },
      { name: "TrendingUp",   el: TrendingUp },
      { name: "TrendingDown", el: TrendingDown },
      { name: "Activity",  el: Activity },
      { name: "Hash",      el: Hash },
      { name: "Percent",   el: Percent },
      { name: "Calendar",  el: Calendar },
      { name: "Clock",     el: Clock },
      { name: "Timer",     el: Timer },
      { name: "Watch",     el: Watch },
    ],
  },
  {
    name: "E-commerce",
    icons: [
      { name: "ShoppingCart", el: ShoppingCart },
      { name: "ShoppingBag",  el: ShoppingBag },
      { name: "CreditCard",   el: CreditCard },
      { name: "DollarSign",   el: DollarSign },
      { name: "Tag",          el: TagIcon as any },
      { name: "Gift",         el: Gift },
      { name: "Package",      el: Package },
      { name: "Truck",        el: Truck },
      { name: "Bookmark",     el: Bookmark },
      { name: "Flag",         el: Flag },
    ],
  },
  {
    name: "Статус и UI",
    icons: [
      { name: "CheckCircle",  el: CheckCircle },
      { name: "AlertCircle",  el: AlertCircle },
      { name: "AlertTriangle",el: AlertTriangle },
      { name: "AlertOctagon", el: AlertOctagon },
      { name: "Info",         el: Info },
      { name: "HelpCircle",   el: HelpCircle },
      { name: "Loader",       el: Loader },
      { name: "Zap",          el: Zap },
      { name: "Lock",         el: Lock },
      { name: "Unlock",       el: Unlock },
      { name: "Shield",       el: Shield },
      { name: "Key",          el: Key },
      { name: "Eye",          el: Eye },
      { name: "EyeOff",       el: EyeOff },
      { name: "Settings",     el: Settings },
      { name: "Wrench",       el: Wrench },
      { name: "Power",        el: Power },
      { name: "Terminal",     el: Terminal },
      { name: "ToggleLeft",   el: ToggleLeft },
      { name: "ToggleRight",  el: ToggleRight },
    ],
  },
  {
    name: "Бренды",
    icons: [
      { name: "Github",    el: Github },
      { name: "Instagram", el: Instagram },
      { name: "Twitter",   el: Twitter },
      { name: "Linkedin",  el: Linkedin },
      { name: "Facebook",  el: Facebook },
      { name: "Youtube",   el: Youtube },
      { name: "Figma",     el: Figma },
      { name: "Chrome",    el: Chrome },
    ],
  },
];

function IconsSection() {
  const [query, setQuery]   = useState("");
  const [size, setSize]     = useState(24);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleCopy = (name: string) => {
    navigator.clipboard.writeText(name).catch(() => {});
    setCopied(name);
    setTimeout(() => setCopied(null), 1500);
  };

  const filtered = iconCategories.map(cat => ({
    ...cat,
    icons: cat.icons.filter(ic =>
      ic.name.toLowerCase().includes(query.toLowerCase())
    ),
  })).filter(cat =>
    (activeCategory === null || cat.name === activeCategory) && cat.icons.length > 0
  );

  const totalVisible = filtered.reduce((s, c) => s + c.icons.length, 0);

  return (
    <div className="p-6 space-y-5">
      <SectionLabel>Иконки · Lucide React</SectionLabel>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-lg px-3 h-9 bg-white dark:bg-[#161820] focus-within:border-[#0080ff] transition-colors flex-1 min-w-[200px] max-w-xs">
          <Search size={13} className="text-[#9d99ac] dark:text-[#6b6f85] shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Поиск иконки..."
            className="flex-1 text-[13px] text-[#171a24] dark:text-[#e8e9ef] placeholder-[#b8bfcc] outline-none bg-transparent"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-[#9d99ac] dark:text-[#6b6f85] hover:text-[#6e6b7b] dark:text-[#8b8fa8]">
              <X size={12} />
            </button>
          )}
        </div>

        {/* Size switcher */}
        <div className="flex items-center gap-1 bg-[#f5f7fa] dark:bg-[#1e2028] rounded-lg p-1">
          {[16, 20, 24, 32].map(s => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`h-7 px-3 text-[12px] font-medium rounded-md transition-colors ${size === s ? "bg-white dark:bg-[#161820] text-[#171a24] dark:text-[#e8e9ef] shadow-sm" : "text-[#9d99ac] dark:text-[#6b6f85] hover:text-[#6e6b7b] dark:text-[#8b8fa8]"}`}
            >
              {s}
            </button>
          ))}
        </div>

        <span className="text-[12px] text-[#9d99ac] dark:text-[#6b6f85] ml-auto">{totalVisible} иконок</span>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory(null)}
          className={`h-7 px-3 text-[12px] font-medium rounded-lg border transition-colors ${activeCategory === null ? "bg-[#0080ff] text-white border-[#0080ff]" : "border-[#e3eaf4] dark:border-[#2a2c3a] text-[#6e6b7b] dark:text-[#8b8fa8] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028]"}`}
        >
          Все
        </button>
        {iconCategories.map(cat => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
            className={`h-7 px-3 text-[12px] font-medium rounded-lg border transition-colors ${activeCategory === cat.name ? "bg-[#0080ff] text-white border-[#0080ff]" : "border-[#e3eaf4] dark:border-[#2a2c3a] text-[#6e6b7b] dark:text-[#8b8fa8] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028]"}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* MyPoint module icons */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9d99ac] dark:text-[#6b6f85] mb-3">MyPoint · Иконки модулей</p>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Принтер",     el: CardIcon },
            { name: "Калькулятор", el: FnIcon },
            { name: "Время",       el: TimeIcon },
            { name: "Процент",     el: PercentIcon },
            { name: "Модули",      el: TableModulesIcon },
            { name: "Сканер",      el: ScanerIcon },
            { name: "Маркировка",  el: MarkirovkaIcon },
            { name: "Знак",        el: ZnakIcon },
            { name: "ФЗ-54",       el: () => <div style={{ transform: "scaleX(-1)" }} className="size-full"><Fz54Icon /></div> },
            { name: "Оптика",      el: OpticsIcon },
          ].map(({ name, el: Icon }) => (
            <Tooltip key={name} text={name} position="top">
              <button
                className="flex flex-col items-center gap-1.5 p-2 rounded-lg border border-[#e3eaf4] dark:border-[#2a2c3a] bg-white dark:bg-[#161820] hover:border-[#0080ff] hover:bg-[#f0f7ff] dark:bg-[#1a2035] transition-all"
                style={{ '--fill-0': '#4f4d5b' } as React.CSSProperties}
              >
                <div className="w-10 h-10 [&>div]:!bg-transparent [&>div]:rounded-none">
                  <Icon />
                </div>
                <span className="text-[9px] text-[#9d99ac] dark:text-[#6b6f85] max-w-[60px] text-center leading-tight">
                  {name}
                </span>
              </button>
            </Tooltip>
          ))}
        </div>
        <div className="mt-3 h-px bg-[#f0f3f8] dark:bg-[#1e2028]" />
      </div>

      {/* Icons grid */}
      <div className="space-y-6">
        {filtered.map(cat => (
          <div key={cat.name}>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9d99ac] dark:text-[#6b6f85] mb-3">{cat.name}</p>
            <div className="flex flex-wrap gap-1">
              {cat.icons.map(({ name, el: Icon }) => (
                <Tooltip key={name} text={copied === name ? "Скопировано!" : name} position="top">
                  <button
                    onClick={() => handleCopy(name)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border transition-all cursor-pointer group
                      ${copied === name
                        ? "bg-[#e6f2ff] border-[#0080ff] text-[#0080ff]"
                        : "bg-white dark:bg-[#161820] border-[#e3eaf4] dark:border-[#2a2c3a] text-[#4f4d5b] dark:text-[#a0a3b8] hover:border-[#0080ff] hover:text-[#0080ff] hover:bg-[#f0f7ff] dark:bg-[#1a2035]"}`}
                  >
                    <Icon size={size} strokeWidth={1.5} />
                    <span className="text-[9px] text-[#9d99ac] dark:text-[#6b6f85] group-hover:text-[#0080ff] transition-colors max-w-[60px] truncate text-center leading-none">
                      {name}
                    </span>
                  </button>
                </Tooltip>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <Search size={24} className="text-[#d6dde8] dark:text-[#3a3d50] mb-3" />
            <p className="text-[14px] font-medium text-[#4f4d5b] dark:text-[#a0a3b8]">Ничего не найдено</p>
            <p className="text-[13px] text-[#9d99ac] dark:text-[#6b6f85] mt-1">Попробуйте другой запрос</p>
          </div>
        )}
      </div>

      {/* Usage note */}
      <div className="flex items-start gap-3 bg-[#fefce8] border border-[#fcd34d] rounded-lg px-4 py-3 mt-4">
        <Info size={15} className="text-[#a16207] shrink-0 mt-0.5" />
        <span className="text-[13px] text-[#713f12]">
          Кликни на иконку — имя скопируется в буфер. Импорт: <code className="font-mono bg-[#fef9c3] px-1 rounded text-[12px]">import {"{ IconName }"} from "lucide-react"</code>
        </span>
      </div>
    </div>
  );
}

// ─── Accordion ───────────────────────────────────────────────────────────────

const accordionItems = [
  {
    id: "a1",
    title: "Как работает система лояльности?",
    content: "Система лояльности начисляет баллы за каждую покупку. 1 балл = 1 рубль скидки при следующей оплате. Баллы сгорают через 12 месяцев после начисления. Минимальная сумма для списания — 100 баллов.",
  },
  {
    id: "a2",
    title: "Какие способы оплаты доступны?",
    content: "Принимаем наличные, банковские карты Visa и Mastercard, оплату через СБП, а также корпоративные карты. При оплате картой возможен возврат в течение 14 дней.",
  },
  {
    id: "a3",
    title: "Как настроить интеграцию с кассой?",
    content: "Перейдите в Настройки → Интеграции → Кассовое оборудование. Выберите модель кассы из списка поддерживаемых устройств, введите серийный номер и следуйте инструкции подключения. Занимает около 5 минут.",
  },
  {
    id: "a4",
    title: "Что делать если чек не пробился?",
    content: "Проверьте подключение кассы в разделе Оборудование. Если статус «Офлайн» — перезапустите устройство. Непробитые чеки сохраняются в очереди и автоматически отправятся при восстановлении связи.",
  },
  {
    id: "a5",
    title: "Как добавить нового сотрудника?",
    content: "Откройте раздел Сотрудники → Добавить. Укажите ФИО, роль и контактные данные. Система автоматически отправит приглашение на email. Сотрудник может войти через мобильное приложение или веб-интерфейс.",
    disabled: true,
  },
];

function AccordionItem({
  item, open, onToggle,
}: {
  item: typeof accordionItems[0]; open: boolean; onToggle: () => void;
}) {
  return (
    <div className={`border rounded-lg overflow-hidden transition-colors ${item.disabled ? "opacity-40" : ""} ${open ? "border-[#0080ff]/30" : "border-[#e3eaf4] dark:border-[#2a2c3a]"}`}>
      <button
        disabled={item.disabled}
        onClick={onToggle}
        className={`w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors
          ${open ? "bg-[#f0f7ff] dark:bg-[#1a2035]" : "bg-white dark:bg-[#161820] hover:bg-[#fafbfd] dark:bg-[#161820]"}
          ${item.disabled ? "cursor-not-allowed" : ""}`}
      >
        <span className={`text-[14px] font-medium ${open ? "text-[#0080ff]" : "text-[#171a24] dark:text-[#e8e9ef]"}`}>
          {item.title}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-[#0080ff]" : "text-[#9d99ac] dark:text-[#6b6f85]"}`}
        />
      </button>
      {open && (
        <div className="px-5 py-4 bg-white dark:bg-[#161820] border-t border-[#e3eaf4] dark:border-[#2a2c3a]">
          <p className="text-[14px] text-[#4f4d5b] dark:text-[#a0a3b8] leading-relaxed">{item.content}</p>
        </div>
      )}
    </div>
  );
}

function AccordionSection() {
  const [openId, setOpenId] = useState<string | null>("a1");
  const [multiOpen, setMultiOpen] = useState<string[]>(["a1"]);
  const [isMulti, setIsMulti] = useState(false);

  const toggle = (id: string) => {
    if (isMulti) {
      setMultiOpen(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    } else {
      setOpenId(prev => prev === id ? null : id);
    }
  };

  const isOpen = (id: string) => isMulti ? multiOpen.includes(id) : openId === id;

  return (
    <div className="p-6 space-y-6">
      <SectionLabel>Accordion · Аккордеон</SectionLabel>

      <div className="flex items-start gap-3 bg-[#f0fdf4] border border-[#86efac] rounded-lg px-4 py-3">
        <Info size={15} className="text-[#15803d] shrink-0 mt-0.5" />
        <span className="text-[13px] text-[#14532d]">
          Два режима: <strong>одиночный</strong> — открыт только один элемент; <strong>множественный</strong> — можно открыть несколько одновременно.
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[13px] text-[#4f4d5b] dark:text-[#a0a3b8]">Режим:</span>
        <div className="flex items-center gap-1 bg-[#f5f7fa] dark:bg-[#1e2028] rounded-lg p-1">
          <button
            onClick={() => setIsMulti(false)}
            className={`h-7 px-3 text-[12px] font-medium rounded-md transition-colors ${!isMulti ? "bg-white dark:bg-[#161820] text-[#171a24] dark:text-[#e8e9ef] shadow-sm" : "text-[#9d99ac] dark:text-[#6b6f85] hover:text-[#6e6b7b] dark:text-[#8b8fa8]"}`}
          >
            Одиночный
          </button>
          <button
            onClick={() => setIsMulti(true)}
            className={`h-7 px-3 text-[12px] font-medium rounded-md transition-colors ${isMulti ? "bg-white dark:bg-[#161820] text-[#171a24] dark:text-[#e8e9ef] shadow-sm" : "text-[#9d99ac] dark:text-[#6b6f85] hover:text-[#6e6b7b] dark:text-[#8b8fa8]"}`}
          >
            Множественный
          </button>
        </div>
      </div>

      <div className="space-y-2 max-w-2xl">
        {accordionItems.map(item => (
          <AccordionItem
            key={item.id}
            item={item}
            open={isOpen(item.id)}
            onToggle={() => toggle(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── File Upload ──────────────────────────────────────────────────────────────

interface UploadedFile { id: string; name: string; size: string; status: "uploading" | "done" | "error"; progress: number; }

function FileUploadSection() {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([
    { id: "f1", name: "Прайс-лист Q3 2026.xlsx", size: "84 KB",  status: "done",      progress: 100 },
    { id: "f2", name: "Фото товара_001.jpg",       size: "2.4 MB", status: "uploading", progress: 62  },
    { id: "f3", name: "Договор поставки.pdf",      size: "512 KB", status: "error",     progress: 35  },
  ]);

  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));

  const statusIcon = (f: UploadedFile) => {
    if (f.status === "done")      return <CheckCircle size={14} className="text-[#22c55e] shrink-0" />;
    if (f.status === "error")     return <AlertCircle size={14} className="text-[#ef4444] shrink-0" />;
    return <Loader size={14} className="text-[#0080ff] shrink-0 animate-spin" />;
  };

  const progressColor = (f: UploadedFile) =>
    f.status === "error" ? "#ef4444" : f.status === "done" ? "#22c55e" : "#0080ff";

  return (
    <div className="p-6 space-y-6">
      <SectionLabel>File Upload · Загрузка файлов</SectionLabel>

      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          {/* Drop zone */}
          <SubLabel>Drop zone</SubLabel>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); }}
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all cursor-pointer
              ${dragging ? "border-[#0080ff] bg-[#f0f7ff] dark:bg-[#1a2035]" : "border-[#e3eaf4] dark:border-[#2a2c3a] bg-[#fafbfd] dark:bg-[#161820] hover:border-[#b8bfcc] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028]"}`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${dragging ? "bg-[#e6f2ff]" : "bg-[#f0f3f8] dark:bg-[#1e2028]"}`}>
              <Upload size={20} className={dragging ? "text-[#0080ff]" : "text-[#9d99ac] dark:text-[#6b6f85]"} />
            </div>
            <div>
              <p className="text-[14px] font-medium text-[#171a24] dark:text-[#e8e9ef]">
                {dragging ? "Отпустите файл" : "Перетащите файл или нажмите"}
              </p>
              <p className="text-[12px] text-[#9d99ac] dark:text-[#6b6f85] mt-0.5">PDF, XLSX, JPG, PNG до 50 MB</p>
            </div>
            <button className="h-8 px-4 text-[12px] font-medium bg-white dark:bg-[#161820] border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-lg text-[#4f4d5b] dark:text-[#a0a3b8] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] transition-colors">
              Выбрать файл
            </button>
          </div>

          {/* Compact variant */}
          <SubLabel>Компактный вариант</SubLabel>
          <label className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#161820] border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-lg cursor-pointer hover:border-[#0080ff] hover:bg-[#f0f7ff] dark:bg-[#1a2035] transition-all group">
            <div className="w-8 h-8 rounded-lg bg-[#e6f2ff] flex items-center justify-center shrink-0">
              <Upload size={14} className="text-[#0080ff]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#171a24] dark:text-[#e8e9ef]">Прикрепить файл</p>
              <p className="text-[11px] text-[#9d99ac] dark:text-[#6b6f85]">Любой формат, до 50 MB</p>
            </div>
            <ChevronRight size={14} className="text-[#9d99ac] dark:text-[#6b6f85] group-hover:text-[#0080ff] transition-colors" />
          </label>
        </div>

        {/* File list */}
        <div className="space-y-3">
          <SubLabel>Список загруженных файлов</SubLabel>
          <div className="space-y-2">
            {files.map(f => (
              <div key={f.id} className="bg-white dark:bg-[#161820] border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-lg px-3 py-2.5 space-y-2">
                <div className="flex items-center gap-2.5">
                  {statusIcon(f)}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#171a24] dark:text-[#e8e9ef] truncate">{f.name}</p>
                    <p className="text-[11px] text-[#9d99ac] dark:text-[#6b6f85]">{f.size} · {f.status === "done" ? "Загружен" : f.status === "error" ? "Ошибка" : `${f.progress}%`}</p>
                  </div>
                  <button onClick={() => removeFile(f.id)} className="text-[#9d99ac] dark:text-[#6b6f85] hover:text-[#ef4444] transition-colors shrink-0">
                    <X size={13} />
                  </button>
                </div>
                {f.status !== "done" && (
                  <div className="h-1 bg-[#f0f3f8] dark:bg-[#1e2028] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${f.progress}%`, background: progressColor(f) }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          {files.length === 0 && (
            <div className="text-center py-6 text-[13px] text-[#9d99ac] dark:text-[#6b6f85]">Нет загруженных файлов</div>
          )}
        </div>
      </div>

      {/* Mobile upload */}
      <div className="border-t border-[#f0f3f8] dark:border-[#2a2c3a] pt-5">
        <div className="flex items-center gap-3 mb-3">
          <SubLabel>Mobile · Tap to upload</SubLabel>
          <span className="text-[11px] bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa] px-2 py-0.5 rounded-full font-medium">Mobile only</span>
        </div>
        <div className="flex items-start gap-3 bg-[#fff7ed] border border-[#fed7aa] rounded-lg px-4 py-3 mb-4">
          <AlertTriangle size={15} className="text-[#c2410c] shrink-0 mt-0.5" />
          <span className="text-[13px] text-[#9a3412]">
            На мобильных drag-and-drop недоступен. Используй нативный file picker через <code className="bg-[#fef3c7] px-1 rounded text-[12px]">input[type=file]</code> с выбором источника: фото, файлы, камера.
          </span>
        </div>
        <div className="flex flex-wrap gap-4">
          {/* Source selector */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] text-[#9d99ac] dark:text-[#6b6f85]">Выбор источника</span>
            <div className="bg-white dark:bg-[#161820] border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-xl overflow-hidden w-[240px]">
              {[
                { icon: Camera,   label: "Сделать фото",   sub: "Открыть камеру" },
                { icon: Image,    label: "Из галереи",     sub: "Фото и видео" },
                { icon: FileText, label: "Файлы",          sub: "PDF, XLSX, DOCX" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className={`flex items-center gap-3 px-4 py-3 hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] transition-colors cursor-pointer ${i > 0 ? "border-t border-[#f0f3f8] dark:border-[#2a2c3a]" : ""}`}>
                    <div className="w-9 h-9 rounded-xl bg-[#e6f2ff] flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-[#0080ff]" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[#171a24] dark:text-[#e8e9ef]">{item.label}</p>
                      <p className="text-[11px] text-[#9d99ac] dark:text-[#6b6f85]">{item.sub}</p>
                    </div>
                    <ChevronRight size={13} className="text-[#d6dde8] dark:text-[#3a3d50] ml-auto" />
                  </div>
                );
              })}
            </div>
          </div>
          {/* Inline button */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] text-[#9d99ac] dark:text-[#6b6f85]">Кнопка в форме</span>
            <div className="space-y-3 w-[240px]">
              <label className="flex items-center justify-center gap-2 w-full h-12 border-2 border-dashed border-[#e3eaf4] dark:border-[#2a2c3a] rounded-xl text-[13px] font-medium text-[#0080ff] cursor-pointer hover:border-[#0080ff] hover:bg-[#f0f7ff] dark:bg-[#1a2035] transition-all">
                <Upload size={16} /> Прикрепить файл
              </label>
              <label className="flex items-center gap-2.5 px-4 h-11 bg-[#f5f7fa] dark:bg-[#1e2028] rounded-xl text-[13px] text-[#4f4d5b] dark:text-[#a0a3b8] cursor-pointer hover:bg-[#e3eaf4] dark:bg-[#2a2c3a] transition-colors">
                <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#161820] border border-[#e3eaf4] dark:border-[#2a2c3a] flex items-center justify-center shrink-0">
                  <Paperclip size={13} className="text-[#6e6b7b] dark:text-[#8b8fa8]" />
                </div>
                <span className="flex-1">Добавить вложение</span>
                <span className="text-[11px] text-[#9d99ac] dark:text-[#6b6f85]">до 50 MB</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Range Slider ─────────────────────────────────────────────────────────────

function RangeSlider({
  min = 0, max = 100, step = 1,
  defaultValue, label, unit = "",
  color = "#0080ff",
}: {
  min?: number; max?: number; step?: number;
  defaultValue?: [number, number] | number;
  label?: string; unit?: string; color?: string;
}) {
  const isRange = Array.isArray(defaultValue);
  const [single, setSingle] = useState(typeof defaultValue === "number" ? defaultValue : 50);
  const [range, setRange] = useState<[number, number]>(
    Array.isArray(defaultValue) ? defaultValue : [20, 80]
  );

  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  if (!isRange) {
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <div className="flex justify-between text-[12px]">
            <span className="font-medium text-[#4f4d5b] dark:text-[#a0a3b8]">{label}</span>
            <span className="text-[#9d99ac] dark:text-[#6b6f85]">{single}{unit}</span>
          </div>
        )}
        <div className="relative h-5 flex items-center">
          <div className="absolute inset-x-0 h-1.5 bg-[#f0f3f8] dark:bg-[#1e2028] rounded-full">
            <div className="absolute left-0 h-full rounded-full" style={{ width: `${pct(single)}%`, background: color }} />
          </div>
          <input
            type="range" min={min} max={max} step={step} value={single}
            onChange={e => setSingle(+e.target.value)}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
          <div
            className="absolute w-4 h-4 rounded-full bg-white dark:bg-[#161820] border-2 shadow-sm -translate-x-1/2 transition-none"
            style={{ left: `${pct(single)}%`, borderColor: color }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-[#b8bfcc] dark:text-[#3a3d50]">
          <span>{min}{unit}</span><span>{max}{unit}</span>
        </div>
      </div>
    );
  }

  const [lo, hi] = range;
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <div className="flex justify-between text-[12px]">
          <span className="font-medium text-[#4f4d5b] dark:text-[#a0a3b8]">{label}</span>
          <span className="text-[#9d99ac] dark:text-[#6b6f85]">{lo}{unit} — {hi}{unit}</span>
        </div>
      )}
      <div className="relative h-5 flex items-center">
        <div className="absolute inset-x-0 h-1.5 bg-[#f0f3f8] dark:bg-[#1e2028] rounded-full">
          <div
            className="absolute h-full rounded-full"
            style={{ left: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%`, background: color }}
          />
        </div>
        {/* Low handle */}
        <input
          type="range" min={min} max={hi - step} step={step} value={lo}
          onChange={e => setRange([+e.target.value, hi])}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ zIndex: lo > max - 10 ? 5 : 3 }}
        />
        {/* High handle */}
        <input
          type="range" min={lo + step} max={max} step={step} value={hi}
          onChange={e => setRange([lo, +e.target.value])}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ zIndex: 4 }}
        />
        <div className="absolute w-4 h-4 rounded-full bg-white dark:bg-[#161820] border-2 shadow-sm -translate-x-1/2 pointer-events-none" style={{ left: `${pct(lo)}%`, borderColor: color }} />
        <div className="absolute w-4 h-4 rounded-full bg-white dark:bg-[#161820] border-2 shadow-sm -translate-x-1/2 pointer-events-none" style={{ left: `${pct(hi)}%`, borderColor: color }} />
      </div>
      <div className="flex justify-between text-[11px] text-[#b8bfcc] dark:text-[#3a3d50]">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

function RangeSliderSection() {
  return (
    <div className="p-6 space-y-8">
      <SectionLabel>Range Slider · Ползунок</SectionLabel>

      <div className="grid grid-cols-2 gap-10">
        <div className="space-y-6">
          <SubLabel>Одиночный</SubLabel>
          <RangeSlider label="Скидка" defaultValue={30} unit="%" />
          <RangeSlider label="Громкость уведомлений" defaultValue={70} color="#22c55e" />
          <RangeSlider label="Максимум заказов в день" defaultValue={25} min={1} max={50} color="#f59e0b" />
        </div>
        <div className="space-y-6">
          <SubLabel>Диапазон (Range)</SubLabel>
          <RangeSlider label="Диапазон цен" defaultValue={[1500, 8000] as [number,number]} min={0} max={10000} step={100} unit=" ₽" />
          <RangeSlider label="Возраст клиентов" defaultValue={[18, 55] as [number,number]} min={0} max={100} unit=" лет" color="#a78bfa" />
          <RangeSlider label="Рейтинг товаров" defaultValue={[3, 5] as [number,number]} min={1} max={5} step={0.5} color="#f59e0b" />
        </div>
      </div>

      <div>
        <SubLabel>Варианты состояний</SubLabel>
        <div className="flex flex-wrap gap-6">
          {[
            { label: "Default",  v: 40, color: "#0080ff" },
            { label: "Success",  v: 75, color: "#22c55e" },
            { label: "Warning",  v: 60, color: "#f59e0b" },
            { label: "Danger",   v: 85, color: "#ef4444" },
            { label: "Brand",    v: 50, color: "#5a4d6b" },
          ].map(s => (
            <div key={s.label} className="w-44">
              <RangeSlider label={s.label} defaultValue={s.v} color={s.color} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Popover ──────────────────────────────────────────────────────────────────

function PopoverDemo({ trigger, title, children, position = "bottom" }: {
  trigger: React.ReactNode; title?: string; children: React.ReactNode; position?: "top"|"bottom"|"left"|"right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const posMap = {
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    top:    "bottom-full left-1/2 -translate-x-1/2 mb-2",
    left:   "right-full top-1/2 -translate-y-1/2 mr-2",
    right:  "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div
          className={`absolute z-50 ${posMap[position]}`}
          style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)" }}
        >
          <div className="bg-white dark:bg-[#161820] border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-xl min-w-[200px] overflow-hidden">
            {title && (
              <div className="px-4 py-3 border-b border-[#f0f3f8] dark:border-[#2a2c3a]">
                <p className="text-[13px] font-semibold text-[#171a24] dark:text-[#e8e9ef]">{title}</p>
              </div>
            )}
            <div className="p-1">{children}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function PopoverItem({ icon, label, danger, onClick }: { icon: React.ReactNode; label: string; danger?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors text-left
        ${danger ? "text-[#ef4444] hover:bg-[#fef2f2]" : "text-[#4f4d5b] dark:text-[#a0a3b8] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028]"}`}
    >
      <span className="shrink-0">{icon}</span>
      {label}
    </button>
  );
}

function PopoverSection() {
  return (
    <div className="p-6 space-y-6">
      <SectionLabel>Popover · Всплывающая панель</SectionLabel>

      <div className="flex items-start gap-3 bg-[#f0f9ff] border border-[#93c5fd] rounded-lg px-4 py-3">
        <Info size={15} className="text-[#0369a1] shrink-0 mt-0.5" />
        <span className="text-[13px] text-[#0c4a6e]">
          Popover — интерактивная панель, открывается по клику. В отличие от Tooltip, содержит кнопки и формы. Закрывается кликом вне области.
        </span>
      </div>

      <div className="flex flex-wrap gap-8 items-start py-4">
        {/* Context menu */}
        <div className="flex flex-col items-center gap-2">
          <SubLabel>Контекстное меню</SubLabel>
          <PopoverDemo
            position="bottom"
            trigger={
              <button className="h-9 px-4 text-[13px] font-medium bg-white dark:bg-[#161820] border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-lg text-[#4f4d5b] dark:text-[#a0a3b8] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] transition-colors flex items-center gap-2">
                Действия <ChevronDown size={13} />
              </button>
            }
          >
            <PopoverItem icon={<Edit2 size={14} />} label="Редактировать" />
            <PopoverItem icon={<Copy size={14} />}  label="Дублировать" />
            <PopoverItem icon={<Share size={14} />} label="Поделиться" />
            <div className="my-1 h-px bg-[#f0f3f8] dark:bg-[#1e2028]" />
            <PopoverItem icon={<Trash2 size={14} />} label="Удалить" danger />
          </PopoverDemo>
        </div>

        {/* User card */}
        <div className="flex flex-col items-center gap-2">
          <SubLabel>Карточка пользователя</SubLabel>
          <PopoverDemo
            position="bottom"
            trigger={
              <div className="w-9 h-9 rounded-full bg-[#5a4d6b] flex items-center justify-center text-white text-[13px] font-semibold cursor-pointer hover:ring-2 hover:ring-[#5a4d6b]/30 transition-all">
                АА
              </div>
            }
          >
            <div className="px-4 py-3 border-b border-[#f0f3f8] dark:border-[#2a2c3a] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#5a4d6b] flex items-center justify-center text-white text-[13px] font-semibold shrink-0">АА</div>
              <div>
                <p className="text-[13px] font-semibold text-[#171a24] dark:text-[#e8e9ef]">Алексей Антонов</p>
                <p className="text-[11px] text-[#9d99ac] dark:text-[#6b6f85]">admin@mypoint.ru</p>
              </div>
            </div>
            <div className="p-1">
              <PopoverItem icon={<User size={14} />}     label="Мой профиль" />
              <PopoverItem icon={<Settings size={14} />} label="Настройки" />
              <div className="my-1 h-px bg-[#f0f3f8] dark:bg-[#1e2028]" />
              <PopoverItem icon={<LogOut size={14} />}   label="Выйти" danger />
            </div>
          </PopoverDemo>
        </div>

        {/* Filter popover */}
        <div className="flex flex-col items-center gap-2">
          <SubLabel>Фильтр</SubLabel>
          <PopoverDemo
            position="bottom"
            title="Фильтр по статусу"
            trigger={
              <button className="h-9 px-4 text-[13px] font-medium bg-white dark:bg-[#161820] border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-lg text-[#4f4d5b] dark:text-[#a0a3b8] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] transition-colors flex items-center gap-2">
                <Filter size={13} /> Фильтр
              </button>
            }
          >
            <div className="px-3 py-2 space-y-1.5">
              {["Активен", "Обрабатывается", "Доставлен", "Отменён"].map(s => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked={s !== "Отменён"} className="accent-[#0080ff]" />
                  <span className="text-[13px] text-[#4f4d5b] dark:text-[#a0a3b8]">{s}</span>
                </label>
              ))}
              <div className="pt-2 border-t border-[#f0f3f8] dark:border-[#2a2c3a] flex gap-2">
                <button className="flex-1 h-7 text-[12px] font-medium bg-[#0080ff] text-white rounded-lg hover:bg-[#006fe0] transition-colors">Применить</button>
                <button className="h-7 px-3 text-[12px] font-medium border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-lg text-[#6e6b7b] dark:text-[#8b8fa8] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] transition-colors">Сброс</button>
              </div>
            </div>
          </PopoverDemo>
        </div>

        {/* Info popover */}
        <div className="flex flex-col items-center gap-2">
          <SubLabel>Подробнее</SubLabel>
          <PopoverDemo
            position="top"
            title="Информация о товаре"
            trigger={
              <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e3eaf4] dark:border-[#2a2c3a] text-[#9d99ac] dark:text-[#6b6f85] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] transition-colors">
                <Info size={14} />
              </button>
            }
          >
            <div className="px-4 py-3 space-y-2 text-[13px] text-[#4f4d5b] dark:text-[#a0a3b8]">
              <div className="flex justify-between"><span className="text-[#9d99ac] dark:text-[#6b6f85]">Артикул</span><span className="font-medium">CAP-3001</span></div>
              <div className="flex justify-between"><span className="text-[#9d99ac] dark:text-[#6b6f85]">Остаток</span><span className="font-medium text-[#22c55e]">142 шт</span></div>
              <div className="flex justify-between"><span className="text-[#9d99ac] dark:text-[#6b6f85]">Категория</span><span className="font-medium">Напитки</span></div>
              <div className="flex justify-between"><span className="text-[#9d99ac] dark:text-[#6b6f85]">Добавлен</span><span className="font-medium">12.03.2026</span></div>
            </div>
          </PopoverDemo>
        </div>
      </div>
    </div>
  );
}

// ─── Border Radius ────────────────────────────────────────────────────────────

const radiusTokens = [
  { token: "radius-none", value: "0px",   label: "None",  usage: "Таблицы, разделители, строгие UI" },
  { token: "radius-xs",   value: "2px",   label: "XS",    usage: "Бейджи, теги, маленькие чипы" },
  { token: "radius-sm",   value: "4px",   label: "SM",    usage: "Кнопки SM, инпуты, чекбоксы" },
  { token: "radius-md",   value: "8px",   label: "MD",    usage: "Кнопки, карточки, инпуты (основной)" },
  { token: "radius-lg",   value: "12px",  label: "LG",    usage: "Модальные окна, боковые панели" },
  { token: "radius-xl",   value: "16px",  label: "XL",    usage: "Крупные карточки, hero-блоки" },
  { token: "radius-2xl",  value: "24px",  label: "2XL",   usage: "Иллюстративные элементы" },
  { token: "radius-full", value: "999px", label: "Full",  usage: "Аватары, пилюли, переключатели" },
];

const semanticTokens = [
  { token: "background",            cssVar: "--background",            light: "#f0f3f8", dark: "#0d0e12", usage: "Фон страницы" },
  { token: "foreground",            cssVar: "--foreground",            light: "#171a24", dark: "#e8e9ef", usage: "Основной текст" },
  { token: "card",                  cssVar: "--card",                  light: "#ffffff", dark: "#161820", usage: "Фон карточек и панелей" },
  { token: "card-foreground",       cssVar: "--card-foreground",       light: "#171a24", dark: "#e8e9ef", usage: "Текст на карточках" },
  { token: "primary",               cssVar: "--primary",               light: "#0080ff", dark: "#0080ff", usage: "Основной акцент, CTA" },
  { token: "primary-foreground",    cssVar: "--primary-foreground",    light: "#ffffff", dark: "#ffffff", usage: "Текст на primary-фоне" },
  { token: "secondary",             cssVar: "--secondary",             light: "#edf2fb", dark: "#1e2028", usage: "Вторичные кнопки, фоны" },
  { token: "muted",                 cssVar: "--muted",                 light: "#ebf1f5", dark: "#1e2028", usage: "Приглушённые фоны" },
  { token: "muted-foreground",      cssVar: "--muted-foreground",      light: "#9d99ac", dark: "#6b6f85", usage: "Вспомогательный текст" },
  { token: "accent",                cssVar: "--accent",                light: "#e6f2ff", dark: "#1a2035", usage: "Hover-состояния, подсветка" },
  { token: "destructive",           cssVar: "--destructive",           light: "#ef4444", dark: "#ef4444", usage: "Ошибки, удаление" },
  { token: "border",                cssVar: "--border",                light: "#e3eaf4", dark: "#2a2c3a", usage: "Границы элементов" },
  { token: "input-background",      cssVar: "--input-background",      light: "#f5f7fa", dark: "#1e2028", usage: "Фон полей ввода" },
  { token: "ring",                  cssVar: "--ring",                  light: "#0080ff", dark: "#0080ff", usage: "Focus ring" },
  { token: "radius",                cssVar: "--radius",                light: "0.5rem",  dark: "0.5rem",  usage: "Базовое скругление (8px)" },
];

const breakpointTokens = [
  { token: "screen-mobile",  value: "375px",  usage: "Мобильные устройства" },
  { token: "screen-tablet",  value: "768px",  usage: "Планшеты" },
  { token: "screen-desktop", value: "1280px", usage: "Десктоп" },
];

const TOKEN_TABS = [
  { id: "overview",   label: "Обзор" },
  { id: "color",      label: "Color" },
  { id: "semantic",   label: "Semantic" },
  { id: "typography", label: "Typography" },
  { id: "spacing",    label: "Spacing" },
  { id: "radius",     label: "Radius" },
  { id: "shadow",     label: "Shadow" },
] as const;

type TokenTabId = typeof TOKEN_TABS[number]["id"];

function TokenTable({
  headers,
  rows,
}: {
  headers: { key: string; label: string; mono?: boolean }[];
  rows: Record<string, React.ReactNode>[];
}) {
  return (
    <div className="bg-white dark:bg-[#161820] rounded-xl border border-[#e3eaf4] dark:border-[#2a2c3a] overflow-x-auto">
      <table className="w-full text-[13px] min-w-[560px]">
        <thead>
          <tr className="bg-[#f5f7fa] dark:bg-[#1e2028] border-b border-[#e3eaf4] dark:border-[#2a2c3a]">
            {headers.map((h) => (
              <th
                key={h.key}
                className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#9d99ac] dark:text-[#6b6f85] whitespace-nowrap"
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#f0f3f8] dark:divide-[#2a2c3a]">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-[#fafbfd] dark:hover:bg-[#1a1c24] transition-colors">
              {headers.map((h) => (
                <td
                  key={h.key}
                  className={`px-4 py-2.5 text-[#4f4d5b] dark:text-[#a0a3b8] ${h.mono ? "font-mono text-[12px] text-[#5b21b6] dark:text-[#a78bfa]" : ""}`}
                >
                  {row[h.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ColorSwatch({ hex }: { hex: string }) {
  const isRem = !hex.startsWith("#");
  return (
    <span className="inline-flex items-center gap-2">
      {!isRem && (
        <span
          className="inline-block w-5 h-5 rounded border border-black/10 shrink-0"
          style={{ background: hex }}
        />
      )}
      <span className="font-mono text-[12px] text-[#5b21b6] dark:text-[#a78bfa]">{hex}</span>
    </span>
  );
}

function TokensSection() {
  const [tab, setTab] = useState<TokenTabId>("overview");

  const colorRows = [
    ...Object.entries(tokens.brand).map(([step, hex]) => ({
      swatch: <ColorSwatch hex={hex} />,
      token: `color-brand-${step}`,
      primitive: `brand.${step}`,
      usage: step === "500" ? "Логотип, акценты бренда" : step === "700" ? "Тёмный текст, logo mark" : "—",
    })),
    ...Object.entries(tokens.blue).map(([step, hex]) => ({
      swatch: <ColorSwatch hex={hex} />,
      token: `color-blue-${step}`,
      primitive: `blue.${step}`,
      usage: step === "500" ? "Primary, ссылки, CTA" : step === "600" ? "Hover primary" : "—",
    })),
    ...Object.entries(tokens.neutral).map(([step, hex]) => ({
      swatch: <ColorSwatch hex={hex} />,
      token: `color-neutral-${step}`,
      primitive: `neutral.${step}`,
      usage: step === "200" ? "Borders, dividers" : step === "600" ? "Secondary text" : "—",
    })),
    ...Object.entries(tokens.semantic).map(([name, hex]) => ({
      swatch: <ColorSwatch hex={hex} />,
      token: `color-${name}`,
      primitive: `semantic.${name}`,
      usage: { success: "Успех", warning: "Предупреждение", error: "Ошибка", info: "Информация", purple: "Акцент" }[name] ?? "—",
    })),
  ];

  return (
    <div className="p-6 space-y-6">
      <SectionLabel>Design Tokens · Справочник</SectionLabel>

      <div className="flex items-start gap-3 bg-[#eef2ff] border border-[#c7d2fe] rounded-xl px-4 py-3">
        <Hash size={15} className="text-[#4338ca] shrink-0 mt-0.5" />
        <span className="text-[13px] text-[#3730a3] dark:text-[#a5b4fc]">
          Токены — единый словарь дизайн-системы. Используй <strong>семантические</strong> токены (<code className="font-mono text-[12px]">--primary</code>) в компонентах, а не сырые hex-значения.
        </span>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-[#e3eaf4] dark:border-[#2a2c3a] pb-px">
        {TOKEN_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-[12px] font-medium relative transition-colors whitespace-nowrap rounded-t-lg
              ${tab === t.id
                ? "text-[#4338ca] dark:text-[#a5b4fc] bg-[#eef2ff] dark:bg-[#1a1c35]"
                : "text-[#9d99ac] dark:text-[#6b6f85] hover:text-[#6e6b7b] dark:hover:text-[#8b8fa8]"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div>
            <SubLabel>Соглашения об именовании</SubLabel>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { pattern: "color-{palette}-{step}", example: "color-blue-500", desc: "Примитивные цвета" },
                { pattern: "color-{semantic}", example: "color-success", desc: "Семантические цвета" },
                { pattern: "text-{role}", example: "text-h1", desc: "Типографика" },
                { pattern: "space-{n}", example: "space-4", desc: "Отступы (4px base)" },
                { pattern: "radius-{size}", example: "radius-md", desc: "Скругления" },
                { pattern: "shadow-{level}", example: "shadow-md", desc: "Elevation" },
                { pattern: "--{role}", example: "--primary", desc: "CSS-переменные темы" },
                { pattern: "screen-{device}", example: "screen-tablet", desc: "Брейкпоинты" },
              ].map((item) => (
                <div key={item.pattern} className="bg-[#f5f7fa] dark:bg-[#1e2028] rounded-lg px-4 py-3 border border-[#e3eaf4] dark:border-[#2a2c3a]">
                  <code className="text-[12px] font-mono font-bold text-[#4338ca] dark:text-[#a5b4fc]">{item.pattern}</code>
                  <p className="text-[11px] font-mono text-[#9d99ac] dark:text-[#6b6f85] mt-1">{item.example}</p>
                  <p className="text-[12px] text-[#4f4d5b] dark:text-[#a0a3b8] mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SubLabel>Сводка по категориям</SubLabel>
            <TokenTable
              headers={[
                { key: "category", label: "Категория" },
                { key: "count", label: "Токенов" },
                { key: "prefix", label: "Префикс", mono: true },
                { key: "section", label: "Визуальный раздел" },
              ]}
              rows={[
                { category: "Color (primitive)", count: colorRows.length, prefix: "color-*", section: "Colors" },
                { category: "Color (semantic CSS)", count: semanticTokens.length, prefix: "--*", section: "Semantic tab" },
                { category: "Typography", count: typeScale.length, prefix: "text-*", section: "Typography" },
                { category: "Spacing", count: spacingScale.length, prefix: "space-*", section: "Spacing" },
                { category: "Border radius", count: radiusTokens.length, prefix: "radius-*", section: "Border Radius" },
                { category: "Shadow", count: shadowLevels.length, prefix: "shadow-*", section: "Shadows" },
                { category: "Breakpoints", count: breakpointTokens.length, prefix: "screen-*", section: "Spacing" },
              ]}
            />
          </div>

          <div>
            <SubLabel>Breakpoints</SubLabel>
            <TokenTable
              headers={[
                { key: "token", label: "Token", mono: true },
                { key: "value", label: "Value", mono: true },
                { key: "usage", label: "Применение" },
              ]}
              rows={breakpointTokens.map((b) => ({
                token: b.token,
                value: b.value,
                usage: b.usage,
              }))}
            />
          </div>
        </div>
      )}

      {tab === "color" && (
        <TokenTable
          headers={[
            { key: "swatch", label: "" },
            { key: "token", label: "Token", mono: true },
            { key: "primitive", label: "Primitive", mono: true },
            { key: "usage", label: "Применение" },
          ]}
          rows={colorRows}
        />
      )}

      {tab === "semantic" && (
        <TokenTable
          headers={[
            { key: "token", label: "Token", mono: true },
            { key: "cssVar", label: "CSS Variable", mono: true },
            { key: "light", label: "Light" },
            { key: "dark", label: "Dark" },
            { key: "usage", label: "Применение" },
          ]}
          rows={semanticTokens.map((s) => ({
            token: s.token,
            cssVar: s.cssVar,
            light: <ColorSwatch hex={s.light} />,
            dark: <ColorSwatch hex={s.dark} />,
            usage: s.usage,
          }))}
        />
      )}

      {tab === "typography" && (
        <TokenTable
          headers={[
            { key: "token", label: "Token", mono: true },
            { key: "spec", label: "Спецификация", mono: true },
            { key: "sample", label: "Пример" },
          ]}
          rows={typeScale.map((row) => ({
            token: row.token,
            spec: `${row.size} · ${row.weight === "700" ? "Bold" : row.weight === "500" ? "Medium" : "Regular"}${row.tracking !== "0" ? ` · ${row.tracking}` : ""}`,
            sample: (
              <span style={{ fontSize: row.sampleSize, fontWeight: row.weight }} className="text-[#332c38] dark:text-[#e8e9ef]">
                {row.sample}
              </span>
            ),
          }))}
        />
      )}

      {tab === "spacing" && (
        <TokenTable
          headers={[
            { key: "token", label: "Token", mono: true },
            { key: "value", label: "Value", mono: true },
            { key: "preview", label: "Preview" },
          ]}
          rows={spacingScale.map((s) => ({
            token: s.token,
            value: s.label,
            preview: (
              <div className="flex items-center gap-2">
                <div className="rounded-[3px] h-4" style={{ background: s.color, width: Math.min(s.px * 2, 200) }} />
              </div>
            ),
          }))}
        />
      )}

      {tab === "radius" && (
        <TokenTable
          headers={[
            { key: "preview", label: "" },
            { key: "token", label: "Token", mono: true },
            { key: "value", label: "Value", mono: true },
            { key: "usage", label: "Применение" },
          ]}
          rows={radiusTokens.map((r) => ({
            preview: (
              <div className="w-8 h-8 bg-[#e6f2ff] border-2 border-[#0080ff]" style={{ borderRadius: r.value }} />
            ),
            token: r.token,
            value: r.value,
            usage: r.usage,
          }))}
        />
      )}

      {tab === "shadow" && (
        <TokenTable
          headers={[
            { key: "preview", label: "" },
            { key: "token", label: "Token", mono: true },
            { key: "value", label: "CSS Value", mono: true },
            { key: "usage", label: "Применение" },
          ]}
          rows={shadowLevels.map((s) => ({
            preview: (
              <div className="w-14 h-10 bg-white dark:bg-[#161820] rounded-lg" style={{ boxShadow: s.value }} />
            ),
            token: s.token,
            value: <span className="text-[11px] break-all">{s.value}</span>,
            usage: s.usage,
          }))}
        />
      )}
    </div>
  );
}

function BorderRadiusSection() {
  return (
    <div className="p-6 space-y-8">
      <SectionLabel>Border Radius · Скругление</SectionLabel>

      {/* Scale */}
      <div>
        <SubLabel>Шкала токенов</SubLabel>
        <div className="flex flex-wrap items-end gap-5">
          {radiusTokens.map(r => (
            <div key={r.token} className="flex flex-col items-center gap-2">
              <div
                className="w-16 h-16 bg-[#e6f2ff] border-2 border-[#0080ff]"
                style={{ borderRadius: r.value }}
              />
              <div className="text-center">
                <p className="text-[12px] font-bold text-[#332c38] dark:text-[#e8e9ef]">{r.label}</p>
                <p className="text-[10px] font-mono text-[#9d99ac] dark:text-[#6b6f85]">{r.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Usage table */}
      <div>
        <SubLabel>Применение</SubLabel>
        <div className="bg-white dark:bg-[#161820] rounded-xl border border-[#e3eaf4] dark:border-[#2a2c3a] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[#f5f7fa] dark:bg-[#1e2028] border-b border-[#e3eaf4] dark:border-[#2a2c3a]">
                {["Уровень", "Токен", "Значение", "Где использовать"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-[#9d99ac] dark:text-[#6b6f85]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f3f8] dark:divide-[#2a2c3a]">
              {radiusTokens.map(r => (
                <tr key={r.token} className="hover:bg-[#fafbfd] dark:bg-[#161820] transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="w-6 h-6 bg-[#e6f2ff] border-2 border-[#0080ff] inline-block" style={{ borderRadius: r.value }} />
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-[#5b21b6]">{r.token}</td>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-[#9d99ac] dark:text-[#6b6f85]">{r.value}</td>
                  <td className="px-4 py-2.5 text-[#4f4d5b] dark:text-[#a0a3b8]">{r.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live preview on components */}
      <div>
        <SubLabel>Как скругление влияет на компоненты</SubLabel>
        <div className="flex flex-wrap gap-4 items-center">
          {radiusTokens.filter(r => r.label !== "None").map(r => (
            <div key={r.token} className="flex flex-col items-center gap-2">
              <button
                className="h-9 px-4 text-[13px] font-medium bg-[#0080ff] text-white border-0"
                style={{ borderRadius: r.value }}
              >
                Кнопка
              </button>
              <span className="text-[10px] text-[#9d99ac] dark:text-[#6b6f85]">{r.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Number Input ─────────────────────────────────────────────────────────────

function NumberInput({
  label, min = 0, max = 999, step = 1,
  defaultValue = 1, unit = "", disabled = false,
}: {
  label?: string; min?: number; max?: number; step?: number;
  defaultValue?: number; unit?: string; disabled?: boolean;
}) {
  const [value, setValue] = useState(defaultValue);
  const dec = () => setValue(v => Math.max(min, v - step));
  const inc = () => setValue(v => Math.min(max, v + step));

  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <div className={`flex flex-col gap-1 ${disabled ? "opacity-40" : ""}`}>
      {label && <label className="text-[13px] font-medium text-[#4f4d5b] dark:text-[#a0a3b8]">{label}</label>}
      <div className={`inline-flex items-center border rounded-lg overflow-hidden bg-white dark:bg-[#161820] transition-colors ${disabled ? "border-[#e3eaf4] dark:border-[#2a2c3a]" : "border-[#e3eaf4] dark:border-[#2a2c3a] focus-within:border-[#0080ff] focus-within:ring-2 focus-within:ring-[#0080ff]/15"}`}>
        <button
          onClick={dec}
          disabled={disabled || atMin}
          className="w-10 h-10 flex items-center justify-center text-[#6e6b7b] dark:text-[#8b8fa8] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] disabled:text-[#d6dde8] dark:text-[#3a3d50] disabled:cursor-not-allowed transition-colors shrink-0"
        >
          <Minus size={14} />
        </button>
        <div className="h-6 w-px bg-[#e3eaf4] dark:bg-[#2a2c3a] shrink-0" />
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          disabled={disabled}
          onChange={e => {
            const v = Math.min(max, Math.max(min, +e.target.value || min));
            setValue(v);
          }}
          className="w-16 text-center text-[14px] font-medium text-[#171a24] dark:text-[#e8e9ef] bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {unit && <span className="text-[13px] text-[#9d99ac] dark:text-[#6b6f85] pr-1">{unit}</span>}
        <div className="h-6 w-px bg-[#e3eaf4] dark:bg-[#2a2c3a] shrink-0" />
        <button
          onClick={inc}
          disabled={disabled || atMax}
          className="w-10 h-10 flex items-center justify-center text-[#6e6b7b] dark:text-[#8b8fa8] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] disabled:text-[#d6dde8] dark:text-[#3a3d50] disabled:cursor-not-allowed transition-colors shrink-0"
        >
          <Plus size={14} />
        </button>
      </div>
      <div className="flex justify-between text-[11px] text-[#b8bfcc] dark:text-[#3a3d50]">
        <span>min {min}{unit}</span>
        <span>max {max}{unit}</span>
      </div>
    </div>
  );
}

function NumberInputSection() {
  return (
    <div className="p-6 space-y-8">
      <SectionLabel>Number Input · Числовой ввод</SectionLabel>

      <div className="grid grid-cols-3 gap-8">
        <div className="space-y-5">
          <SubLabel>Базовые варианты</SubLabel>
          <NumberInput label="Количество товара" defaultValue={1} min={1} max={99} />
          <NumberInput label="Количество порций" defaultValue={2} min={1} max={10} />
          <NumberInput label="Неактивный" defaultValue={5} disabled />
        </div>

        <div className="space-y-5">
          <SubLabel>С единицами измерения</SubLabel>
          <NumberInput label="Вес" defaultValue={500} min={0} max={9999} step={50} unit=" г" />
          <NumberInput label="Цена" defaultValue={290} min={0} max={99999} step={10} unit=" ₽" />
          <NumberInput label="Скидка" defaultValue={10} min={0} max={100} step={5} unit="%" />
        </div>

        <div className="space-y-5">
          <SubLabel>Состояния лимитов</SubLabel>
          <NumberInput label="На минимуме" defaultValue={0} min={0} max={10} />
          <NumberInput label="На максимуме" defaultValue={10} min={0} max={10} />
          <NumberInput label="Шаг 0.5" defaultValue={2.5} min={0} max={5} step={0.5} unit=" кг" />
        </div>
      </div>

      {/* Sizes */}
      <div>
        <SubLabel>В контексте — строка товара</SubLabel>
        <div className="bg-white dark:bg-[#161820] border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-xl overflow-hidden">
          {[
            { name: "Капучино 300мл", price: "290 ₽", qty: 2 },
            { name: "Латте 400мл",    price: "320 ₽", qty: 1 },
            { name: "Круассан",       price: "150 ₽", qty: 3 },
          ].map((item, i) => {
            const [qty, setQty] = useState(item.qty);
            return (
              <div key={item.name} className={`flex items-center gap-4 px-4 py-3 ${i > 0 ? "border-t border-[#f0f3f8] dark:border-[#2a2c3a]" : ""}`}>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-[#171a24] dark:text-[#e8e9ef]">{item.name}</p>
                  <p className="text-[12px] text-[#9d99ac] dark:text-[#6b6f85]">{item.price} / шт</p>
                </div>
                <div className="inline-flex items-center border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-lg overflow-hidden bg-white dark:bg-[#161820]">
                  <button onClick={() => setQty(v => Math.max(0, v - 1))} className="w-8 h-8 flex items-center justify-center text-[#6e6b7b] dark:text-[#8b8fa8] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] disabled:text-[#d6dde8] dark:text-[#3a3d50] transition-colors">
                    <Minus size={12} />
                  </button>
                  <span className="w-10 text-center text-[13px] font-medium text-[#171a24] dark:text-[#e8e9ef]">{qty}</span>
                  <button onClick={() => setQty(v => v + 1)} className="w-8 h-8 flex items-center justify-center text-[#6e6b7b] dark:text-[#8b8fa8] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] transition-colors">
                    <Plus size={12} />
                  </button>
                </div>
                <div className="w-20 text-right">
                  <p className="text-[14px] font-semibold text-[#171a24] dark:text-[#e8e9ef]">
                    {(parseInt(item.price) * qty).toLocaleString()} ₽
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Date Picker ──────────────────────────────────────────────────────────────

const MONTHS = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const DAYS_SHORT = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // Mon=0
}

function CalendarGrid({
  year, month, selected, rangeStart, rangeEnd,
  onSelect, isRange = false,
}: {
  year: number; month: number;
  selected?: Date | null; rangeStart?: Date | null; rangeEnd?: Date | null;
  onSelect: (d: Date) => void; isRange?: boolean;
}) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isSame = (a: Date | null | undefined, b: Date) =>
    a ? a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate() : false;

  const inRange = (d: Date) => {
    if (!rangeStart || !rangeEnd) return false;
    return d > rangeStart && d < rangeEnd;
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 mb-1">
        {DAYS_SHORT.map(d => (
          <div key={d} className="text-center text-[11px] font-semibold text-[#9d99ac] dark:text-[#6b6f85] py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const date = new Date(year, month, day);
          date.setHours(0,0,0,0);
          const isToday  = date.getTime() === today.getTime();
          const isSelected = isSame(selected, date) || isSame(rangeStart, date) || isSame(rangeEnd, date);
          const isInRange  = inRange(date);
          const isStart = isSame(rangeStart, date);
          const isEnd   = isSame(rangeEnd, date);

          return (
            <button
              key={i}
              onClick={() => onSelect(date)}
              className={`relative h-8 flex items-center justify-center text-[13px] transition-colors
                ${isSelected ? "bg-[#0080ff] text-white font-semibold rounded-lg z-10"
                  : isInRange  ? "bg-[#e6f2ff] text-[#0080ff]"
                  : isToday    ? "text-[#0080ff] font-semibold hover:bg-[#f0f7ff] dark:bg-[#1a2035] rounded-lg"
                  : "text-[#4f4d5b] dark:text-[#a0a3b8] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] rounded-lg"}
                ${isInRange && !isStart && !isEnd ? "rounded-none" : ""}
                ${isStart && isRange && rangeEnd ? "rounded-r-none" : ""}
                ${isEnd   && isRange             ? "rounded-l-none" : ""}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DatePickerSingle() {
  const today = new Date();
  const [selected, setSelected] = useState<Date | null>(today);
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [open, setOpen]   = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fmt = (d: Date | null) => d ? d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" }) : "";

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0);  setYear(y => y + 1); } else setMonth(m => m + 1); };

  return (
    <div ref={ref} className="relative inline-block">
      <div
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2.5 px-3 h-[46px] bg-input-background border rounded-lg cursor-pointer transition-all w-[200px]
          ${open ? "border-[#0080ff] ring-2 ring-[#0080ff]/15" : "border-[#e3eaf4] dark:border-[#2a2c3a] hover:border-[#b8bfcc]"}`}
      >
        <Calendar size={15} className="text-[#9d99ac] dark:text-[#6b6f85] shrink-0" />
        <div className="flex-1 relative h-full">
          {selected ? (
            <>
              <span className="absolute top-2 left-0 text-[11px] font-medium text-[#9d99ac] dark:text-[#6b6f85] leading-none">Дата</span>
              <span className="absolute bottom-0 left-0 top-0 flex items-end pb-[5px] pt-5 text-[14px] text-[#171a24] dark:text-[#e8e9ef] leading-none">{fmt(selected)}</span>
            </>
          ) : (
            <span className="absolute inset-0 flex items-center text-[14px] text-[#9d99ac] dark:text-[#6b6f85]">Выберите дату</span>
          )}
        </div>
        <ChevronDown size={13} className={`text-[#9d99ac] dark:text-[#6b6f85] transition-transform ${open ? "rotate-180" : ""}`} />
      </div>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-[#161820] border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-xl p-4 w-[280px]"
          style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)" }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] text-[#6e6b7b] dark:text-[#8b8fa8] transition-colors">
              <ChevronLeft size={14} />
            </button>
            <span className="text-[13px] font-semibold text-[#171a24] dark:text-[#e8e9ef]">{MONTHS[month]} {year}</span>
            <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] text-[#6e6b7b] dark:text-[#8b8fa8] transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
          <CalendarGrid
            year={year} month={month} selected={selected}
            onSelect={d => { setSelected(d); setOpen(false); }}
          />
          <div className="mt-3 pt-3 border-t border-[#f0f3f8] dark:border-[#2a2c3a] flex gap-2">
            <button onClick={() => { setSelected(new Date()); setOpen(false); }}
              className="flex-1 h-8 text-[12px] font-medium bg-[#0080ff] text-white rounded-lg hover:bg-[#006fe0] transition-colors">
              Сегодня
            </button>
            <button onClick={() => { setSelected(null); setOpen(false); }}
              className="h-8 px-3 text-[12px] font-medium border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-lg text-[#6e6b7b] dark:text-[#8b8fa8] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] transition-colors">
              Сбросить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DatePickerRange() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 6);

  const [from, setFrom] = useState(formatCompactDate(weekAgo));
  const [to, setTo] = useState(formatCompactDate(today));

  return (
    <CompactDateRangeField
      from={from}
      to={to}
      onFromChange={setFrom}
      onToChange={setTo}
      className="w-[280px]"
    />
  );
}

function DatePickerSection() {
  return (
    <div className="p-6 space-y-8">
      <SectionLabel>Date Picker · Выбор даты</SectionLabel>

      <div className="flex items-start gap-3 bg-[#fdf4ff] border border-[#d8b4fe] rounded-lg px-4 py-3">
        <Info size={15} className="text-[#9333ea] shrink-0 mt-0.5" />
        <span className="text-[13px] text-[#5b21b6]">
          Два варианта: <strong>одиночная дата</strong> и <strong>диапазон дат</strong> с быстрыми пресетами. Навигация по месяцам, подсветка сегодня, сброс.
        </span>
      </div>

      <div className="flex flex-wrap gap-12 items-start">
        <div className="space-y-3">
          <SubLabel>Одиночная дата</SubLabel>
          <DatePickerSingle />
        </div>
        <div className="space-y-3">
          <SubLabel>Диапазон дат</SubLabel>
          <DatePickerRange />
        </div>
      </div>

      <div>
        <SubLabel>Inline — встроенный календарь</SubLabel>
        <InlineCalendar />
      </div>

      {/* Mobile */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <SubLabel>Mobile · Date Picker как Bottom Sheet</SubLabel>
          <span className="text-[11px] bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa] px-2 py-0.5 rounded-full font-medium">Mobile only</span>
        </div>
        <div className="flex items-start gap-3 bg-[#fff7ed] border border-[#fed7aa] rounded-lg px-4 py-3 mb-5">
          <AlertTriangle size={15} className="text-[#c2410c] shrink-0 mt-0.5" />
          <span className="text-[13px] text-[#9a3412]">
            На мобильных дропдаун не помещается по высоте. Calendar открывается как <strong>Bottom Sheet</strong> на всю ширину экрана с увеличенными tap-зонами (min 44×44px).
          </span>
        </div>
        <div className="flex gap-8 items-start flex-wrap">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] text-[#9d99ac] dark:text-[#6b6f85]">Открыть</span>
            <MobileDatePickerDemo />
          </div>
          {/* Static phone preview */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] text-[#9d99ac] dark:text-[#6b6f85]">Превью</span>
            <div className="w-[220px] bg-[#f0f3f8] dark:bg-[#1e2028] rounded-3xl p-2 border border-[#e3eaf4] dark:border-[#2a2c3a]">
              <div className="bg-white dark:bg-[#161820] rounded-2xl overflow-hidden relative h-[400px]">
                {/* Screen */}
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-[#f5f7fa] dark:bg-[#1e2028] rounded w-1/3" />
                  <div className="h-10 bg-[#f5f7fa] dark:bg-[#1e2028] rounded-lg border border-[#e3eaf4] dark:border-[#2a2c3a] flex items-center px-3 gap-2">
                    <Calendar size={13} className="text-[#9d99ac] dark:text-[#6b6f85]" />
                    <div>
                      <div className="h-1.5 bg-[#e3eaf4] dark:bg-[#2a2c3a] rounded w-8 mb-0.5" />
                      <div className="h-2 bg-[#d6dde8] rounded w-16" />
                    </div>
                  </div>
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-[#0f1117]/40" />
                {/* Sheet */}
                <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#161820] rounded-t-2xl px-3 pb-5 pt-2">
                  <div className="flex justify-center mb-2">
                    <div className="w-8 h-1 bg-[#e3eaf4] dark:bg-[#2a2c3a] rounded-full" />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-5 h-5 flex items-center justify-center"><ChevronLeft size={12} className="text-[#6e6b7b] dark:text-[#8b8fa8]" /></div>
                    <span className="text-[11px] font-semibold text-[#171a24] dark:text-[#e8e9ef]">{MONTHS[new Date().getMonth()]} {new Date().getFullYear()}</span>
                    <div className="w-5 h-5 flex items-center justify-center"><ChevronRight size={12} className="text-[#6e6b7b] dark:text-[#8b8fa8]" /></div>
                  </div>
                  {/* Mini calendar */}
                  <div className="grid grid-cols-7 gap-0.5 mb-1">
                    {DAYS_SHORT.map(d => <div key={d} className="text-center text-[8px] text-[#9d99ac] dark:text-[#6b6f85] font-medium">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-0.5">
                    {Array.from({ length: 35 }, (_, i) => {
                      const d = i - getFirstDayOfMonth(new Date().getFullYear(), new Date().getMonth()) + 1;
                      const today = new Date().getDate();
                      return (
                        <div key={i} className={`h-6 flex items-center justify-center text-[9px] rounded-lg
                          ${d === today ? "bg-[#0080ff] text-white font-bold" :
                            d > 0 && d <= getDaysInMonth(new Date().getFullYear(), new Date().getMonth()) ? "text-[#4f4d5b] dark:text-[#a0a3b8]" : ""}`}>
                          {d > 0 && d <= getDaysInMonth(new Date().getFullYear(), new Date().getMonth()) ? d : ""}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <div className="flex-1 h-8 bg-[#0080ff] rounded-xl flex items-center justify-center">
                      <span className="text-[10px] font-semibold text-white">Выбрать</span>
                    </div>
                    <div className="h-8 px-3 border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-xl flex items-center">
                      <span className="text-[10px] text-[#6e6b7b] dark:text-[#8b8fa8]">Отмена</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileDatePickerDemo() {
  const today = new Date();
  today.setHours(0,0,0,0);
  const [selected, setSelected] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const fmt = (d: Date | null) => d ? d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : "";
  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  return (
    <>
      {/* Trigger field */}
      <div
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2.5 px-3 h-[46px] bg-input-background border rounded-lg cursor-pointer transition-all w-[220px]
          ${open ? "border-[#0080ff] ring-2 ring-[#0080ff]/15" : "border-[#e3eaf4] dark:border-[#2a2c3a] hover:border-[#b8bfcc]"}`}
      >
        <Calendar size={15} className="text-[#9d99ac] dark:text-[#6b6f85] shrink-0" />
        <div className="flex-1 relative h-full">
          {selected ? (
            <>
              <span className="absolute top-2 left-0 text-[11px] font-medium text-[#9d99ac] dark:text-[#6b6f85] leading-none">Дата</span>
              <span className="absolute bottom-0 left-0 top-0 flex items-end pb-[5px] pt-5 text-[14px] text-[#171a24] dark:text-[#e8e9ef] leading-none">{fmt(selected)}</span>
            </>
          ) : (
            <span className="absolute inset-0 flex items-center text-[14px] text-[#9d99ac] dark:text-[#6b6f85]">Выберите дату</span>
          )}
        </div>
        <ChevronDown size={13} className="text-[#9d99ac] dark:text-[#6b6f85] shrink-0" />
      </div>

      {/* Bottom Sheet */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-[#0f1117]/50 backdrop-blur-[2px]" onClick={() => setOpen(false)} />
          <div className="relative bg-white dark:bg-[#161820] w-full max-w-md rounded-t-2xl"
            style={{ boxShadow: "0 -8px 32px rgba(0,0,0,0.16)" }}>
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-[#e3eaf4] dark:bg-[#2a2c3a] rounded-full" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4">
              <h3 className="text-[17px] font-semibold text-[#171a24] dark:text-[#e8e9ef]">Выберите дату</h3>
              <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9d99ac] dark:text-[#6b6f85] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028]">
                <X size={16} />
              </button>
            </div>
            {/* Calendar */}
            <div className="px-5">
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] text-[#6e6b7b] dark:text-[#8b8fa8] transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <span className="text-[15px] font-semibold text-[#171a24] dark:text-[#e8e9ef]">{MONTHS[month]} {year}</span>
                <button onClick={nextMonth} className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] text-[#6e6b7b] dark:text-[#8b8fa8] transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>
              {/* Days - larger tap targets for mobile */}
              <div className="grid grid-cols-7 mb-1">
                {DAYS_SHORT.map(d => (
                  <div key={d} className="text-center text-[12px] font-semibold text-[#9d99ac] dark:text-[#6b6f85] py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-1">
                {(() => {
                  const cells: (number | null)[] = [];
                  const first = getFirstDayOfMonth(year, month);
                  const days  = getDaysInMonth(year, month);
                  for (let i = 0; i < first; i++) cells.push(null);
                  for (let d = 1; d <= days; d++) cells.push(d);
                  while (cells.length % 7 !== 0) cells.push(null);
                  return cells.map((day, i) => {
                    if (!day) return <div key={i} />;
                    const date = new Date(year, month, day);
                    date.setHours(0,0,0,0);
                    const isSel   = selected?.getTime() === date.getTime();
                    const isToday = date.getTime() === today.getTime();
                    return (
                      <button key={i} onClick={() => setSelected(date)}
                        className={`h-11 flex items-center justify-center text-[15px] rounded-xl transition-colors
                          ${isSel   ? "bg-[#0080ff] text-white font-semibold"
                            : isToday ? "text-[#0080ff] font-semibold hover:bg-[#f0f7ff] dark:bg-[#1a2035]"
                            : "text-[#4f4d5b] dark:text-[#a0a3b8] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028]"}`}>
                        {day}
                      </button>
                    );
                  });
                })()}
              </div>
            </div>
            {/* Footer */}
            <div className="px-5 pt-4 pb-8 flex gap-3">
              <button onClick={() => { setSelected(today); setOpen(false); }}
                className="flex-1 h-12 text-[15px] font-medium bg-[#0080ff] text-white rounded-xl hover:bg-[#006fe0] transition-colors">
                {selected ? "Применить" : "Сегодня"}
              </button>
              <button onClick={() => { setSelected(null); setOpen(false); }}
                className="h-12 px-5 text-[15px] font-medium border border-[#e3eaf4] dark:border-[#2a2c3a] text-[#6e6b7b] dark:text-[#8b8fa8] rounded-xl hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] transition-colors">
                Сброс
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function InlineCalendar() {
  const today = new Date();
  today.setHours(0,0,0,0);
  const [selected, setSelected] = useState<Date | null>(today);
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0);  setYear(y => y + 1); } else setMonth(m => m + 1); };

  return (
    <div className="bg-white dark:bg-[#161820] border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-xl p-4 w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] text-[#6e6b7b] dark:text-[#8b8fa8] transition-colors">
          <ChevronLeft size={14} />
        </button>
        <span className="text-[13px] font-semibold text-[#171a24] dark:text-[#e8e9ef]">{MONTHS[month]} {year}</span>
        <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] text-[#6e6b7b] dark:text-[#8b8fa8] transition-colors">
          <ChevronRight size={14} />
        </button>
      </div>
      <CalendarGrid year={year} month={month} selected={selected} onSelect={setSelected} />
      <div className="mt-3 pt-3 border-t border-[#f0f3f8] dark:border-[#2a2c3a] text-center text-[12px] text-[#9d99ac] dark:text-[#6b6f85]">
        {selected ? selected.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) : "Дата не выбрана"}
      </div>
    </div>
  );
}

// ─── Toolbar & Filters ──────────────────────────────────────────────────────
// Обнаружено при разборе раздела «Заказы» модуля Operator: тулбар таблицы
// (главное действие + мульти-фильтр + поиск + иконки-действия) и выезжающая
// панель расширенных фильтров — общий паттерн для всех справочников и реестров
// ERP. Раньше собирался вручную на каждой странице — теперь это компоненты
// кита: ToolbarIconButton, MultiSelectField, CompactSelect/CompactRangeField,
// SearchField, ReorderableListPopover (src/app/components/toolbar).

function ToolbarSection() {
  const [points, setPoints] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [status, setStatus] = useState("Все");
  const [createdBy, setCreatedBy] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sumFrom, setSumFrom] = useState("");
  const [sumTo, setSumTo] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const COLUMN_ITEMS = [
    { id: "id", label: "№ заказа", locked: true },
    { id: "client", label: "Клиент" },
    { id: "address", label: "Адрес" },
    { id: "sum", label: "Сумма" },
    { id: "status", label: "Статус" },
  ];
  const [columnOrder, setColumnOrder] = useState(COLUMN_ITEMS.map((c) => c.id));
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);

  const activeFilterCount =
    (points.length > 0 ? 1 : 0) +
    (status !== "Все" ? 1 : 0) +
    (createdBy.length > 0 ? 1 : 0) +
    (dateFrom !== "" || dateTo !== "" ? 1 : 0) +
    (sumFrom !== "" || sumTo !== "" ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;

  const resetFilters = () => {
    setPoints([]);
    setStatus("Все");
    setCreatedBy([]);
    setDateFrom("");
    setDateTo("");
    setSumFrom("");
    setSumTo("");
  };

  return (
    <div className="p-6 space-y-6">
      <SectionLabel>Toolbar & Filters · Панель управления реестром</SectionLabel>

      <div className="flex items-start gap-3 bg-[#eef2ff] border border-[#c7d2fe] rounded-xl px-4 py-3">
        <Info size={15} className="text-[#4338ca] shrink-0 mt-0.5" />
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-[#3730a3] block mb-0.5">Назначение</span>
          <span className="text-[13px] text-[#4338ca]">
            Стандартная панель над таблицей/реестром: основное действие слева, мульти-select
            фильтр, поиск, иконки-действия справа (звонок, настройка колонок, переключатель
            расширенных фильтров). Ниже — выезжающая панель фильтров с компактными полями.
          </span>
        </div>
      </div>

      <div className="flex items-start gap-3 bg-[#f0fdf4] border border-[#86efac] rounded-xl px-4 py-3">
        <CheckCircle size={15} className="text-[#16a34a] shrink-0 mt-0.5" />
        <span className="text-[13px] text-[#166534]">
          Поля фильтра (CompactSelect / CompactRangeField) используют тот же floating-label
          Dropdown, что и раздел «Поля ввода» — единый паттерн, а не отдельный «компактный»
          вариант. Единственное отличие от обычной формы — здесь метка всегда в «заполненном»
          положении, так как у фильтра всегда есть значение по умолчанию («Все»).
        </span>
      </div>

      {/* Live demo — точная копия тулбара «Заказы» из Operator */}
      <div className="rounded-xl border border-[#e3eaf4] dark:border-[#2a2c3a] bg-[#f0f3f8] dark:bg-[#0d0e12] p-4">
        <div className="rounded-xl bg-white dark:bg-[#161820] shadow-sm">
          <div className="flex w-full flex-wrap items-center gap-3 p-4">
            <button
              type="button"
              className="h-[45px] shrink-0 rounded-lg bg-[#0080ff] px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#006fe0]"
            >
              Создать
            </button>

            <MultiSelectField
              options={["Центральный", "Северный", "Лента", "Южный", "Восточный"]}
              selected={points}
              onChange={setPoints}
              placeholder="Выберите точки..."
              emptyLabel="Все точки"
            />

            <SearchField value={search} onChange={setSearch} />

            <div className="ml-auto flex shrink-0 items-center gap-3">
              <ToolbarIconButton
                tone="success"
                title="Позвонить"
                icon={<Phone size={18} />}
              />
              <ReorderableListPopover
                open={settingsOpen}
                onOpenChange={setSettingsOpen}
                title="Столбцы таблицы"
                hint="Перетащите для смены порядка. Снимите галочку, чтобы скрыть столбец."
                items={COLUMN_ITEMS}
                order={columnOrder}
                hidden={hiddenColumns}
                onOrderChange={setColumnOrder}
                onHiddenChange={setHiddenColumns}
                onReset={() => {
                  setColumnOrder(COLUMN_ITEMS.map((c) => c.id));
                  setHiddenColumns([]);
                }}
                trigger={
                  <ToolbarIconButton
                    tone="neutral"
                    active={settingsOpen}
                    title="Настройки столбцов"
                    icon={<Settings size={18} />}
                  />
                }
              />
              <div className="relative shrink-0">
                <ToolbarIconButton
                  tone="primary"
                  active={filtersOpen}
                  title="Фильтры"
                  onClick={() => setFiltersOpen((o) => !o)}
                  icon={<Filter size={18} fill={filtersOpen ? "currentColor" : "none"} />}
                />
                {activeFilterCount > 0 && (
                  <span className="pointer-events-none absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ff4d4f] px-1 text-[11px] font-semibold leading-none text-white ring-2 ring-white dark:ring-[#161820]">
                    {activeFilterCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          {filtersOpen && (
            <div className="border-t border-[#e8eaed] dark:border-[#2a2c3a] px-4 py-4">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <CompactDateRangeField
                  label="Дата создания"
                  from={dateFrom}
                  to={dateTo}
                  onFromChange={setDateFrom}
                  onToChange={setDateTo}
                />
                <CompactSelect
                  label="Статус"
                  value={status}
                  options={["Все", "Принят", "В работе", "Доставлен", "Отменён"]}
                  onChange={setStatus}
                />
                <CompactRangeField
                  label="Сумма"
                  from={sumFrom}
                  to={sumTo}
                  onFromChange={setSumFrom}
                  onToChange={setSumTo}
                  placeholderFrom="0"
                  placeholderTo="∞"
                />
                <MultiSelectField
                  options={["Оператор 1", "Оператор 2", "Оператор 3"]}
                  selected={createdBy}
                  onChange={setCreatedBy}
                  filterLabel="Кто создал"
                  emptyLabel="Все"
                  searchMode="auto"
                  className="w-full min-w-0 flex-none"
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-[13px] text-[#9d99ac] dark:text-[#6b6f85]">
                  {hasActiveFilters ? (
                    <>
                      Активных фильтров:{" "}
                      <span className="font-semibold text-[#171a24] dark:text-[#e8e9ef]">
                        {activeFilterCount}
                      </span>
                    </>
                  ) : (
                    "Фильтры не заданы"
                  )}
                </span>
                <button
                  type="button"
                  disabled={!hasActiveFilters}
                  title="Сбросить фильтры"
                  onClick={resetFilters}
                  className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-[#6e7686] transition-colors hover:bg-[#f0f3f8] hover:text-[#0080ff] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#6e7686] dark:text-[#8b8fa8] dark:hover:bg-[#1e2028] dark:disabled:hover:text-[#8b8fa8]"
                >
                  <RotateCcw size={15} />
                  Сбросить
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile — фильтры как Bottom Sheet */}
      <div className="pt-3 border-t border-[#f0f3f8] dark:border-[#2a2c3a]">
        <div className="flex items-center gap-3 mb-3">
          <SubLabel>Mobile · Фильтры как Bottom Sheet</SubLabel>
          <span className="text-[11px] bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa] px-2 py-0.5 rounded-full font-medium">Mobile only</span>
        </div>
        <div className="flex items-start gap-3 bg-[#fff7ed] border border-[#fed7aa] rounded-lg px-4 py-3 mb-5">
          <AlertTriangle size={15} className="text-[#c2410c] shrink-0 mt-0.5" />
          <span className="text-[13px] text-[#9a3412]">
            На узких экранах выезжающая панель фильтров не помещается в строку. Кнопка «Фильтры» открывает <strong>Bottom Sheet</strong> на всю ширину: поля идут в один столбец с увеличенными tap-зонами, «Применить / Сбросить» закреплены снизу с учётом safe area.
          </span>
        </div>
        <div className="flex gap-8 items-start flex-wrap">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] text-[#9d99ac] dark:text-[#6b6f85]">Открыть</span>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="relative flex h-[45px] items-center gap-2 rounded-lg border border-[#e3eaf4] dark:border-[#2a2c3a] bg-white dark:bg-[#161820] px-4 text-[14px] font-medium text-[#171a24] dark:text-[#e8e9ef] transition-colors hover:border-[#b8bfcc]"
            >
              <Filter size={16} className="text-[#0080ff]" />
              Фильтры
              {activeFilterCount > 0 && (
                <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ff4d4f] px-1 text-[11px] font-semibold leading-none text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Static phone preview */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] text-[#9d99ac] dark:text-[#6b6f85]">Превью</span>
            <div className="w-[220px] bg-[#f0f3f8] dark:bg-[#1e2028] rounded-3xl p-2 border border-[#e3eaf4] dark:border-[#2a2c3a]">
              <div className="bg-white dark:bg-[#161820] rounded-2xl overflow-hidden relative h-[400px]">
                {/* Screen */}
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-[#f5f7fa] dark:bg-[#1e2028] rounded w-1/3" />
                  <div className="flex items-center gap-2">
                    <div className="h-8 flex-1 bg-[#f5f7fa] dark:bg-[#1e2028] rounded-lg border border-[#e3eaf4] dark:border-[#2a2c3a]" />
                    <div className="h-8 w-8 bg-[#eaf3ff] rounded-lg border border-[#cfe4ff] flex items-center justify-center">
                      <Filter size={13} className="text-[#0080ff]" />
                    </div>
                  </div>
                  <div className="h-8 bg-[#f5f7fa] dark:bg-[#1e2028] rounded-lg" />
                  <div className="h-8 bg-[#f5f7fa] dark:bg-[#1e2028] rounded-lg" />
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-[#0f1117]/40" />
                {/* Sheet */}
                <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#161820] rounded-t-2xl px-3 pb-4 pt-2">
                  <div className="flex justify-center mb-2">
                    <div className="w-8 h-1 bg-[#e3eaf4] dark:bg-[#2a2c3a] rounded-full" />
                  </div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-semibold text-[#171a24] dark:text-[#e8e9ef]">Фильтры</span>
                    <X size={11} className="text-[#9d99ac] dark:text-[#6b6f85]" />
                  </div>
                  {["Дата создания", "Статус", "Сумма", "Кто создал"].map((f) => (
                    <div key={f} className="mb-1.5 rounded-lg border border-[#e3eaf4] dark:border-[#2a2c3a] px-2.5 py-1.5">
                      <div className="text-[7px] text-[#9d99ac] dark:text-[#6b6f85] mb-0.5">{f}</div>
                      <div className="h-1.5 bg-[#e3eaf4] dark:bg-[#2a2c3a] rounded w-2/3" />
                    </div>
                  ))}
                  <div className="mt-2.5 flex gap-2">
                    <div className="flex-1 h-8 bg-[#0080ff] rounded-xl flex items-center justify-center">
                      <span className="text-[10px] font-semibold text-white">Применить</span>
                    </div>
                    <div className="h-8 px-3 border border-[#e3eaf4] dark:border-[#2a2c3a] rounded-xl flex items-center">
                      <span className="text-[10px] text-[#6e6b7b] dark:text-[#8b8fa8]">Сбросить</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Рабочий Bottom Sheet фильтров — то же состояние, что и в десктоп-панели */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-[#0f1117]/50 backdrop-blur-[2px]"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div
            className="relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl bg-white dark:bg-[#161820]"
            style={{ boxShadow: "0 -8px 32px rgba(0,0,0,0.16)" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-[#e3eaf4] dark:bg-[#2a2c3a] rounded-full" />
            </div>
            {/* Header */}
            <div className="flex items-start justify-between px-5 pt-2 pb-4 shrink-0">
              <div>
                <h3 className="text-[17px] font-semibold text-[#171a24] dark:text-[#e8e9ef]">Фильтры</h3>
                <p className="text-[13px] text-[#9d99ac] dark:text-[#6b6f85] mt-0.5">
                  {hasActiveFilters ? `Активных фильтров: ${activeFilterCount}` : "Фильтры не заданы"}
                </p>
              </div>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9d99ac] dark:text-[#6b6f85] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-kit px-5 pb-3 space-y-3">
              <CompactDateRangeField
                label="Дата создания"
                from={dateFrom}
                to={dateTo}
                onFromChange={setDateFrom}
                onToChange={setDateTo}
              />
              <CompactSelect
                label="Статус"
                value={status}
                options={["Все", "Принят", "В работе", "Доставлен", "Отменён"]}
                onChange={setStatus}
              />
              <CompactRangeField
                label="Сумма"
                from={sumFrom}
                to={sumTo}
                onFromChange={setSumFrom}
                onToChange={setSumTo}
                placeholderFrom="0"
                placeholderTo="∞"
              />
              <MultiSelectField
                options={["Оператор 1", "Оператор 2", "Оператор 3"]}
                selected={createdBy}
                onChange={setCreatedBy}
                filterLabel="Кто создал"
                emptyLabel="Все"
                searchMode="auto"
                className="w-full min-w-0 flex-none"
              />
            </div>
            {/* Footer safe area */}
            <div className="px-5 pt-3 pb-6 border-t border-[#f0f3f8] dark:border-[#2a2c3a] flex gap-2.5 shrink-0">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 h-11 text-[14px] font-medium text-white bg-[#0080ff] rounded-xl hover:bg-[#006fe0] transition-colors"
              >
                Применить
              </button>
              <button
                disabled={!hasActiveFilters}
                onClick={resetFilters}
                className="h-11 px-5 text-[14px] font-medium border border-[#e3eaf4] dark:border-[#2a2c3a] text-[#4f4d5b] dark:text-[#a0a3b8] rounded-xl transition-colors hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Anatomy */}
      <div className="flex flex-col gap-3 pt-3 border-t border-[#f0f3f8] dark:border-[#2a2c3a]">
        <span className="text-[11px] font-semibold text-[#9d99ac] dark:text-[#6b6f85] uppercase tracking-wide">Компоненты</span>
        {[
          { color: "#0080ff", label: "ToolbarIconButton — icon-кнопка 45×45 с тремя тонами (neutral / success / primary) и активным состоянием" },
          { color: "#22c55e", label: "MultiSelectField — мульти-select на Radix Popover: поиск от 7 пунктов (auto), «Применить» от 16, ширина попапа = триггер, режим фильтра через filterLabel + emptyLabel «Все»" },
          { color: "#f59e0b", label: "CompactSelect / CompactRangeField / CompactDateRangeField — floating-label поля фильтра; числовой диапазон «от → до» (Сумма) и диапазон дат — календарь с пресетами из раздела Date Picker" },
          { color: "#5a4d6b", label: "SearchField — строчный поиск 45px с иконкой" },
          { color: "#ef4444", label: "ReorderableListPopover — попап настройки списка с drag-reorder и чекбоксами видимости" },
          { color: "#0ea5e9", label: "Mobile — на узких экранах фильтры открываются как Bottom Sheet: поля в один столбец, «Применить / Сбросить» закреплены снизу (safe area)" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full shrink-0 mt-0.5" style={{ background: item.color }} />
            <span className="text-[13px] text-[#4f4d5b] dark:text-[#a0a3b8]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Code view ────────────────────────────────────────────────────────────────
// Глобальный режим «Код»: тумблер в шапке переключает все секции между живым
// демо (Preview) и сниппетом использования (Code). Сниппеты — короткие примеры
// «как применить компонент», а не полный исходник (исходник живёт в файлах).

type PropRow = { name: string; type: string; def?: string; desc: string };
type SectionDoc = {
  description: string;
  importLine?: string;
  props?: PropRow[];
  usage: string;
  notes?: string[];
};

function CodeSnippet({ code, title }: { code: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard недоступен (нет https/разрешения) — молча игнорируем
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#1e2430] bg-[#0d1117]">
      <div className="flex items-center justify-between border-b border-[#1e2430] px-4 py-2">
        <span className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-[#8b949e]">
          <Code2 size={13} />
          {title}
        </span>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium text-[#8b949e] transition-colors hover:bg-[#1e2430] hover:text-[#e6edf3]"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Скопировано" : "Копировать"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed scrollbar-kit">
        <code className="font-mono text-[#c9d1d9] whitespace-pre">{code.trim()}</code>
      </pre>
    </div>
  );
}

function CodeBlock({ doc }: { doc: SectionDoc }) {
  return (
    <div className="space-y-5 p-6">
      {/* Описание */}
      <p className="text-[14px] leading-relaxed text-[#4f4d5b] dark:text-[#a0a3b8]">
        {doc.description}
      </p>

      {/* Импорт */}
      {doc.importLine && <CodeSnippet title="Импорт" code={doc.importLine} />}

      {/* Таблица пропсов */}
      {doc.props && doc.props.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-[#e3eaf4] dark:border-[#2a2c3a]">
          <div className="flex items-center gap-2 border-b border-[#e3eaf4] bg-[#f5f7fa] px-4 py-2 dark:border-[#2a2c3a] dark:bg-[#1e2028]">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#6e6b7b] dark:text-[#8b8fa8]">
              Параметры
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#e3eaf4] text-[11px] uppercase tracking-wide text-[#9d99ac] dark:border-[#2a2c3a] dark:text-[#6b6f85]">
                  <th className="px-4 py-2 font-medium">Проп</th>
                  <th className="px-4 py-2 font-medium">Тип</th>
                  <th className="px-4 py-2 font-medium">По умолчанию</th>
                  <th className="px-4 py-2 font-medium">Описание</th>
                </tr>
              </thead>
              <tbody>
                {doc.props.map((p) => (
                  <tr
                    key={p.name}
                    className="border-b border-[#f0f3f8] last:border-0 align-top dark:border-[#22242e]"
                  >
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <code className="rounded bg-[#eef2ff] px-1.5 py-0.5 font-mono text-[12px] font-medium text-[#4338ca] dark:bg-[#1a2035] dark:text-[#8aa8ff]">
                        {p.name}
                      </code>
                    </td>
                    <td className="px-4 py-2.5">
                      <code className="font-mono text-[12px] text-[#c2410c] dark:text-[#f0a875]">
                        {p.type}
                      </code>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <code className="font-mono text-[12px] text-[#9d99ac] dark:text-[#6b6f85]">
                        {p.def ?? "—"}
                      </code>
                    </td>
                    <td className="px-4 py-2.5 text-[13px] text-[#4f4d5b] dark:text-[#a0a3b8]">
                      {p.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Пример */}
      <CodeSnippet title="Пример использования" code={doc.usage} />

      {/* Заметки */}
      {doc.notes && doc.notes.length > 0 && (
        <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] px-4 py-3 dark:border-[#5c4a1a] dark:bg-[#231d0f]">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-[#b45309] dark:text-[#e0b44a]">
            Важно
          </span>
          <ul className="space-y-1">
            {doc.notes.map((n, i) => (
              <li key={i} className="flex gap-2 text-[13px] text-[#92400e] dark:text-[#e0b44a]">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-current" />
                <span className="leading-relaxed">{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const SECTION_DOCS: Record<string, SectionDoc> = {
  tokens: {
    description:
      "Дизайн-токены — единый источник значений (цвета, отступы, радиусы, тени). Задаются как CSS-переменные и Tailwind-классы. Всегда используйте токены вместо хардкода, чтобы тема и ребрендинг применялись автоматически.",
    usage: `// Через Tailwind-классы:
<div className="bg-[#0080ff] text-white rounded-lg p-4">Brand / blue-500</div>

// Либо через CSS-переменную темы:
<div style={{ background: "var(--color-primary)" }} />`,
    notes: [
      "Не хардкодьте цвета в компонентах — берите из палитры (blue-500 = #0080ff и т.д.).",
      "Тёмная тема включается классом .dark на <html> — используйте пары light/dark: bg-white dark:bg-[#161820].",
    ],
  },

  colors: {
    description:
      "Палитра из 4 групп: brand (фиолетовая, акценты бренда), blue (основное действие), neutral (текст, фоны, границы), semantic (успех/предупреждение/ошибка/инфо). Применяется через Tailwind-классы произвольных значений.",
    usage: `<span className="text-[#0080ff]">Primary</span>
<span className="text-[#22c55e]">Success</span>
<span className="text-[#f59e0b]">Warning</span>
<span className="text-[#ef4444]">Error</span>

<div className="bg-[#f5f7fa] dark:bg-[#161820]">Surface</div>`,
    notes: [
      "Основное действие — blue-500 (#0080ff). Один основной акцент на экран.",
      "Semantic-цвета только по назначению: красный = ошибка/удаление, зелёный = успех.",
    ],
  },

  typography: {
    description:
      "Шрифт Roboto для всего интерфейса. Размеры и веса задаются Tailwind-классами. Иерархия: заголовки — bold/semibold, тело — regular 14px, подписи — 11px приглушённым цветом.",
    usage: `<h1 className="text-[28px] font-bold leading-tight">Заголовок H1</h1>
<h2 className="text-[20px] font-semibold">Заголовок H2</h2>
<p className="text-[14px] text-[#4f4d5b]">Основной текст</p>
<span className="text-[11px] text-[#9d99ac]">Подпись / caption</span>`,
    notes: ["Базовый размер тела — 14px. Не опускайте текст ниже 11px."],
  },

  spacing: {
    description:
      "Шкала отступов кратна 4px (4 / 8 / 12 / 16 / 24 / 32…). Используйте utility-классы gap, p, m — не произвольные пиксели. Единая шкала держит ритм макета.",
    usage: `<div className="flex flex-col gap-4 p-6">
  <div className="p-3">Контент с отступом 12px</div>
</div>`,
    notes: ["Предпочитайте gap во flex/grid вместо margin на детях — меньше «схлопывания» отступов."],
  },

  shadows: {
    description:
      "Уровни теней задают высоту элемента над поверхностью. Чем выше слой (карточка → дропдаун → модалка), тем крупнее тень. Карточки используют готовый класс shadow-sm, поповеры и модалки — кастомные значения.",
    usage: `<div className="rounded-xl bg-white shadow-sm">sm — карточки</div>

<div style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>поповеры / дропдауны</div>

<div style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>модалки</div>`,
    notes: ["В тёмной теме тени почти не видны — глубину там задаёт цвет фона/границы, а не тень."],
  },

  buttons: {
    description:
      "Базовая кнопка на CVA-вариантах. variant задаёт визуальную важность, size — габариты. Один primary-акцент на секцию; остальные действия — secondary / outline / ghost.",
    importLine: `import { Button } from "@/app/components/ui/button";`,
    props: [
      { name: "variant", type: '"default" | "secondary" | "outline" | "ghost" | "destructive" | "link"', def: '"default"', desc: "Визуальный стиль и важность действия." },
      { name: "size", type: '"default" | "sm" | "lg" | "icon"', def: '"default"', desc: "Размер кнопки." },
      { name: "disabled", type: "boolean", def: "false", desc: "Блокирует клик и приглушает кнопку." },
      { name: "asChild", type: "boolean", def: "false", desc: "Отрендерить как дочерний элемент (напр. ссылку) вместо <button>." },
    ],
    usage: `<Button>Основная</Button>
<Button variant="secondary">Вторичная</Button>
<Button variant="outline">Контур</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Удалить</Button>
<Button size="sm">Маленькая</Button>
<Button disabled>Недоступна</Button>`,
    notes: ["destructive — только для необратимых действий (удаление). Обычно с подтверждением."],
  },

  inputs: {
    description:
      "Текстовое поле ввода. Оборачивайте в <Label> для доступности. Поддерживает все нативные атрибуты <input> (type, placeholder, value, onChange, disabled).",
    importLine: `import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";`,
    props: [
      { name: "type", type: "string", def: '"text"', desc: "Тип поля: text, email, password, number и т.д." },
      { name: "placeholder", type: "string", desc: "Подсказка внутри пустого поля." },
      { name: "value", type: "string", desc: "Управляемое значение." },
      { name: "onChange", type: "(e) => void", desc: "Обработчик изменения." },
      { name: "disabled", type: "boolean", def: "false", desc: "Блокирует поле." },
    ],
    usage: `<div className="space-y-1.5">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="you@mail.com" />
</div>`,
    notes: ["Всегда связывайте Label с полем через htmlFor / id — это важно для скринридеров."],
  },

  tags: {
    description:
      "Tag — статусная метка (заказ принят / отменён и т.п.), Badge — счётчик или короткий числовой индикатор. Оба принимают текст через проп label, а не children.",
    importLine: `import { Tag, Badge } from "@/app/components/primitives";`,
    props: [
      { name: "label", type: "string", desc: "Текст метки (у Badge — string | number)." },
      { name: "color", type: '"blue" | "green" | "red" | "amber" | "purple" | "gray" | "brand"', desc: "Цветовая схема." },
      { name: "dot", type: "boolean", def: "false", desc: "Tag: показать цветную точку слева." },
      { name: "removable", type: "boolean", def: "false", desc: "Tag: показать крестик удаления." },
    ],
    usage: `<Tag label="Новый" color="blue" dot />
<Tag label="Оплачен" color="green" />
<Tag label="Отменён" color="red" removable />

<Badge label={12} color="blue" />`,
    notes: ["Текст передаётся пропом label, НЕ как children: <Tag label=\"…\" />, а не <Tag>…</Tag>."],
  },

  avatars: {
    description:
      "Аватар пользователя на Radix Avatar. AvatarImage грузит фото, AvatarFallback показывает инициалы, пока фото не загрузилось или отсутствует.",
    importLine: `import { Avatar, AvatarImage, AvatarFallback } from "@/app/components/ui/avatar";`,
    props: [
      { name: "AvatarImage.src", type: "string", desc: "URL изображения." },
      { name: "AvatarImage.alt", type: "string", desc: "Альт-текст." },
      { name: "AvatarFallback", type: "ReactNode", desc: "Запасной контент (обычно инициалы)." },
    ],
    usage: `<Avatar>
  <AvatarImage src="/user.jpg" alt="Иван Петров" />
  <AvatarFallback>ИП</AvatarFallback>
</Avatar>`,
    notes: ["Всегда указывайте AvatarFallback — без фото пользователь увидит инициалы, а не пустоту."],
  },

  alerts: {
    description:
      "Инлайн-уведомление внутри страницы (не всплывающее). Для информирования о состоянии блока или формы. Для временных уведомлений используйте Toast.",
    importLine: `import { Alert, AlertTitle, AlertDescription } from "@/app/components/ui/alert";`,
    props: [
      { name: "variant", type: '"default" | "destructive"', def: '"default"', desc: "Обычное или тревожное оформление." },
    ],
    usage: `<Alert>
  <AlertTitle>Внимание</AlertTitle>
  <AlertDescription>Проверьте введённые данные.</AlertDescription>
</Alert>`,
  },

  formcontrols: {
    description:
      "Управляемые контролы форм на Radix: Checkbox (множественный выбор), Switch (вкл/выкл настройки), RadioGroup (выбор одного из вариантов). Все управляются через value/checked + onChange-колбэк.",
    importLine: `import { Checkbox } from "@/app/components/ui/checkbox";
import { Switch } from "@/app/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";`,
    props: [
      { name: "checked", type: "boolean", desc: "Checkbox / Switch: состояние." },
      { name: "onCheckedChange", type: "(v: boolean) => void", desc: "Checkbox / Switch: обработчик." },
      { name: "value", type: "string", desc: "RadioGroup: выбранное значение." },
      { name: "onValueChange", type: "(v: string) => void", desc: "RadioGroup: обработчик выбора." },
      { name: "disabled", type: "boolean", def: "false", desc: "Блокирует контрол." },
    ],
    usage: `<Checkbox checked={agree} onCheckedChange={setAgree} />

<Switch checked={on} onCheckedChange={setOn} />

<RadioGroup value={val} onValueChange={setVal}>
  <RadioGroupItem value="a" /> Вариант A
  <RadioGroupItem value="b" /> Вариант B
</RadioGroup>`,
    notes: ["Switch — для мгновенных настроек (вкл/выкл). Checkbox — для выбора, который применяется по кнопке."],
  },

  navigation: {
    description:
      "Компоненты навигации: Tabs (переключение вкладок в пределах страницы) и Breadcrumb (путь по иерархии). Tabs управляются через value/defaultValue.",
    importLine: `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink } from "@/app/components/ui/breadcrumb";`,
    props: [
      { name: "defaultValue", type: "string", desc: "Tabs: активная вкладка по умолчанию." },
      { name: "value", type: "string", desc: "Tabs: управляемое значение активной вкладки." },
      { name: "onValueChange", type: "(v: string) => void", desc: "Tabs: смена вкладки." },
    ],
    usage: `<Tabs defaultValue="orders">
  <TabsList>
    <TabsTrigger value="orders">Заказы</TabsTrigger>
    <TabsTrigger value="clients">Клиенты</TabsTrigger>
  </TabsList>
  <TabsContent value="orders">…</TabsContent>
  <TabsContent value="clients">…</TabsContent>
</Tabs>`,
  },

  cards: {
    description:
      "Карточка — контейнер для сгруппированного контента (метрика, сводка, блок настроек). Состоит из под-компонентов: Header/Title/Description/Content/Footer.",
    importLine: `import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/card";`,
    usage: `<Card>
  <CardHeader>
    <CardTitle>Выручка за месяц</CardTitle>
  </CardHeader>
  <CardContent>
    <span className="text-2xl font-bold">₽ 1 240 000</span>
  </CardContent>
</Card>`,
  },

  modal: {
    description:
      "Модальное окно на Radix Dialog. Открывается через DialogTrigger, закрывается по клику вне, Esc или крестику. Для важных действий, требующих фокуса пользователя.",
    importLine: `import {
  Dialog, DialogTrigger, DialogContent,
  DialogHeader, DialogTitle, DialogFooter,
} from "@/app/components/ui/dialog";`,
    props: [
      { name: "open", type: "boolean", desc: "Управляемое состояние открытия." },
      { name: "onOpenChange", type: "(open: boolean) => void", desc: "Колбэк смены состояния." },
      { name: "DialogTrigger.asChild", type: "boolean", def: "false", desc: "Использовать свой элемент как триггер." },
    ],
    usage: `<Dialog>
  <DialogTrigger asChild><Button>Открыть</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader><DialogTitle>Заголовок</DialogTitle></DialogHeader>
    <p>Контент модалки…</p>
    <DialogFooter><Button>Сохранить</Button></DialogFooter>
  </DialogContent>
</Dialog>`,
    notes: ["Не вкладывайте модалку в модалку. Для подтверждений используйте AlertDialog."],
  },

  toast: {
    description:
      "Всплывающие временные уведомления через библиотеку sonner. <Toaster /> монтируется один раз в корне приложения, дальше вызывается функция toast() из любого места.",
    importLine: `import { toast } from "sonner";
import { Toaster } from "@/app/components/ui/sonner";`,
    props: [
      { name: "toast.success", type: "(msg: string) => void", desc: "Зелёное уведомление об успехе." },
      { name: "toast.error", type: "(msg: string) => void", desc: "Красное уведомление об ошибке." },
      { name: "Toaster.position", type: '"top-center" | "bottom-center" | …', def: '"bottom-right"', desc: "Где показывать тосты." },
    ],
    usage: `// Один раз в корне приложения:
<Toaster position="bottom-center" />

// Вызов из любого места:
toast.success("Сохранено");
toast.error("Не удалось сохранить");`,
    notes: ["Toast — для необязательной обратной связи. Для того, что требует действия, используйте Alert/Dialog."],
  },

  tooltip: {
    description:
      "Подсказка при наведении/фокусе на Radix Tooltip. Для пояснения иконок и сокращений. Не кладите в тултип важную информацию — он недоступен на тач-устройствах.",
    importLine: `import { Tooltip, TooltipTrigger, TooltipContent } from "@/app/components/ui/tooltip";`,
    props: [
      { name: "TooltipTrigger.asChild", type: "boolean", def: "false", desc: "Использовать свой элемент как триггер." },
      { name: "TooltipContent.side", type: '"top" | "right" | "bottom" | "left"', def: '"top"', desc: "Сторона появления." },
    ],
    usage: `<Tooltip>
  <TooltipTrigger asChild><Button size="icon">?</Button></TooltipTrigger>
  <TooltipContent>Подсказка к элементу</TooltipContent>
</Tooltip>`,
  },

  skeleton: {
    description:
      "Плейсхолдер-заглушка на время загрузки данных. Повторяет форму будущего контента, снижая ощущение ожидания. Задаётся размерами через className.",
    importLine: `import { Skeleton } from "@/app/components/ui/skeleton";`,
    usage: `<div className="space-y-2">
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
</div>`,
    notes: ["Форма скелета должна примерно совпадать с реальным контентом, иначе будет «прыжок» при загрузке."],
  },

  emptystate: {
    description:
      "Пустое состояние — экран, когда данных ещё нет или ничего не найдено. Паттерн: иконка + заголовок + короткое пояснение + основное действие. Отдельного компонента нет, собирается из примитивов.",
    usage: `<div className="flex flex-col items-center gap-3 py-12 text-center">
  <Inbox size={40} className="text-[#9d99ac]" />
  <h3 className="text-[15px] font-semibold">Пока ничего нет</h3>
  <p className="text-[13px] text-[#9d99ac]">Создайте первый заказ.</p>
  <Button>Создать заказ</Button>
</div>`,
    notes: ["Различайте «нет данных вообще» (предложите создать) и «ничего не найдено» (предложите сбросить фильтр)."],
  },

  progress: {
    description:
      "Горизонтальный индикатор прогресса на Radix Progress. Для детерминированных процессов, где известен процент выполнения (загрузка, заполнение профиля).",
    importLine: `import { Progress } from "@/app/components/ui/progress";`,
    props: [
      { name: "value", type: "number", desc: "Прогресс от 0 до 100." },
    ],
    usage: `<Progress value={64} />`,
    notes: ["Если процент неизвестен — используйте индикатор загрузки (спиннер), а не Progress."],
  },

  table: {
    description:
      "Таблица для реестров и списков. Набор семантических под-компонентов поверх нативных <table>-тегов. Для фильтрации/сортировки над таблицей — раздел Toolbar & Filters.",
    importLine: `import {
  Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/app/components/ui/table";`,
    usage: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>№</TableHead>
      <TableHead>Клиент</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>1024</TableCell>
      <TableCell>Иван Петров</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
  },

  icons: {
    description:
      "Иконки из библиотеки lucide-react. Импортируются по имени, размер задаётся пропом size, цвет — через className (наследует currentColor). В проекте также есть кастомные Figma-иконки в src/imports.",
    importLine: `import { Search, Filter, Trash2 } from "lucide-react";`,
    props: [
      { name: "size", type: "number", def: "24", desc: "Размер иконки в пикселях." },
      { name: "className", type: "string", desc: "Цвет через text-* и прочие классы." },
      { name: "strokeWidth", type: "number", def: "2", desc: "Толщина линии." },
    ],
    usage: `<Search size={18} />
<Filter size={18} className="text-[#0080ff]" />
<Trash2 size={18} className="text-[#ef4444]" />`,
    notes: ["Для тулбара 45×45 используйте size={18}. Цвет задавайте классом, а не пропом color — так работает тема."],
  },

  accordion: {
    description:
      "Разворачиваемые секции на Radix Accordion. Для FAQ, группировки настроек, длинных форм. type=\"single\" — открыта одна секция, type=\"multiple\" — несколько.",
    importLine: `import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/app/components/ui/accordion";`,
    props: [
      { name: "type", type: '"single" | "multiple"', desc: "Сколько секций можно открыть одновременно." },
      { name: "collapsible", type: "boolean", def: "false", desc: "single: разрешить закрыть все секции." },
    ],
    usage: `<Accordion type="single" collapsible>
  <AccordionItem value="delivery">
    <AccordionTrigger>Условия доставки</AccordionTrigger>
    <AccordionContent>Доставка от 1 до 3 дней.</AccordionContent>
  </AccordionItem>
</Accordion>`,
  },

  fileupload: {
    description:
      "Зона загрузки файлов: клик или drag-and-drop. Отдельного компонента нет — паттерн на <label> + скрытом <input type=\"file\">. Обрабатывайте файлы в onChange.",
    usage: `<label className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed
                  border-[#d6dde8] p-8 cursor-pointer hover:border-[#0080ff]">
  <Upload size={24} className="text-[#9d99ac]" />
  <span className="text-[13px]">Перетащите файл или нажмите</span>
  <input type="file" className="hidden" onChange={handleFiles} />
</label>`,
    notes: ["Показывайте прогресс и список загруженных файлов. Валидируйте тип и размер до отправки."],
  },

  rangeslider: {
    description:
      "Слайдер выбора значения или диапазона на Radix Slider. Один палец — одно значение, два — диапазон (передайте массив из двух чисел в defaultValue/value).",
    importLine: `import { Slider } from "@/app/components/ui/slider";`,
    props: [
      { name: "defaultValue", type: "number[]", desc: "Начальные значения (1 или 2 ползунка)." },
      { name: "value", type: "number[]", desc: "Управляемое значение." },
      { name: "onValueChange", type: "(v: number[]) => void", desc: "Обработчик изменения." },
      { name: "min / max", type: "number", def: "0 / 100", desc: "Границы диапазона." },
      { name: "step", type: "number", def: "1", desc: "Шаг." },
    ],
    usage: `<Slider defaultValue={[20, 80]} min={0} max={100} step={1} />`,
  },

  popover: {
    description:
      "Плавающая панель на Radix Popover, привязанная к триггеру. Для доп. контента и мини-форм. В отличие от тултипа — интерактивна и кликабельна. На её основе построены фильтры тулбара.",
    importLine: `import { Popover, PopoverTrigger, PopoverContent } from "@/app/components/ui/popover";`,
    props: [
      { name: "open", type: "boolean", desc: "Управляемое состояние." },
      { name: "onOpenChange", type: "(open: boolean) => void", desc: "Колбэк смены состояния." },
      { name: "PopoverContent.align", type: '"start" | "center" | "end"', def: '"center"', desc: "Выравнивание относительно триггера." },
    ],
    usage: `<Popover>
  <PopoverTrigger asChild><Button>Открыть</Button></PopoverTrigger>
  <PopoverContent>Содержимое поповера</PopoverContent>
</Popover>`,
  },

  borderradius: {
    description:
      "Шкала скруглений углов через Tailwind-классы rounded-*. Единая шкала связывает радиус с типом элемента: мелкие контролы — меньше, крупные контейнеры — больше.",
    usage: `<div className="rounded-md">6px — поля, кнопки</div>
<div className="rounded-lg">8px — карточки, дропдауны</div>
<div className="rounded-xl">12px — модалки, поповеры</div>
<div className="rounded-full">полное — аватары, чипы</div>`,
  },

  numberinput: {
    description:
      "Числовое поле со степперами +/−. Отдельного компонента нет — собирается из input и двух кнопок. Держите значение в состоянии и ограничивайте диапазон в обработчиках.",
    usage: `const [qty, setQty] = useState(1);

<div className="inline-flex items-center rounded-lg border border-[#e3eaf4]">
  <button onClick={() => setQty((n) => Math.max(0, n - 1))}>−</button>
  <input
    value={qty}
    onChange={(e) => setQty(+e.target.value || 0)}
    className="w-12 text-center outline-none"
  />
  <button onClick={() => setQty((n) => n + 1)}>+</button>
</div>`,
    notes: ["Ограничивайте min/max в обработчиках, а не только визуально. Учитывайте ручной ввод."],
  },

  datepicker: {
    description:
      "Выбор диапазона дат для фильтров — CompactDateRangeField из набора toolbar. Floating-label поле + попап с двумя календарями и быстрыми пресетами (Сегодня, Вчера, Неделя, Месяц, Год). Даты хранятся строками dd.mm.yy.",
    importLine: `import { CompactDateRangeField } from "@/app/components/toolbar";`,
    props: [
      { name: "label", type: "string", desc: "Подпись поля (floating-label)." },
      { name: "from", type: "string", desc: "Начальная дата, формат dd.mm.yy." },
      { name: "to", type: "string", desc: "Конечная дата, формат dd.mm.yy." },
      { name: "onFromChange", type: "(v: string) => void", desc: "Обработчик начальной даты." },
      { name: "onToChange", type: "(v: string) => void", desc: "Обработчик конечной даты." },
      { name: "className", type: "string", desc: "Доп. классы контейнера." },
    ],
    usage: `const [from, setFrom] = useState("");
const [to, setTo] = useState("");

<CompactDateRangeField
  label="Дата создания"
  from={from}
  to={to}
  onFromChange={setFrom}
  onToChange={setTo}
/>`,
    notes: ["Хелперы parseCompactDate / formatCompactDate из того же модуля конвертируют строку ⇄ Date."],
  },

  receipt: {
    description:
      "Готовый макет чека отложенного заказа (клиент, позиции, итоги, оплата). Принимает данные объектом DeferredOrderReceiptData. Для быстрой проверки есть готовый demoDeferredOrderReceipt.",
    importLine: `import {
  DeferredOrderReceipt, demoDeferredOrderReceipt,
} from "@/app/components/receipt";`,
    props: [
      { name: "orderNumber", type: "number", desc: "Номер заказа." },
      { name: "client", type: "{ name, phone, address, addressDetails? }", desc: "Данные клиента и адрес." },
      { name: "deliverBy", type: "string", desc: "Срок доставки." },
      { name: "items", type: "OrderLineItemData[]", desc: "Позиции: name, quantity, unitPrice, totalPrice, discount?." },
      { name: "subtotal / discount / total", type: "number", desc: "Суммы по заказу." },
      { name: "paid / change", type: "number", desc: "Оплачено и сдача." },
    ],
    usage: `// С готовыми демо-данными:
<DeferredOrderReceipt {...demoDeferredOrderReceipt} />

// Со своими:
<DeferredOrderReceipt
  orderNumber={1024}
  client={{ name: "Иван Петров", phone: "+7 987 898 78 78", address: "ул. Ленина, 1" }}
  deliverBy="Сегодня до 18:00"
  items={[{ name: "Товар", quantity: 2, unitPrice: 500, totalPrice: 1000 }]}
  subtotal={1000} discount={0} total={1000} paid={1000} change={0}
/>`,
  },

  toolbar: {
    description:
      "Панель управления реестром: основное действие + мульти-select + поиск + icon-кнопки, и выезжающая панель фильтров с компактными полями. Собирается из компонентов набора toolbar. Главный паттерн для всех справочников и реестров ERP.",
    importLine: `import {
  MultiSelectField, CompactSelect, CompactDateRangeField,
  SearchField, ToolbarIconButton, ReorderableListPopover,
} from "@/app/components/toolbar";`,
    props: [
      { name: "MultiSelectField", type: "options, selected, onChange, emptyLabel, filterLabel, searchMode", desc: "Мульти-select с чекбоксами; поиск от 7 пунктов, «Применить» от 16. Пустой выбор = «Все»." },
      { name: "CompactSelect", type: "label, value, options, onChange", desc: "Одиночный floating-label select для фильтра." },
      { name: "SearchField", type: "value, onChange, placeholder", desc: "Строка поиска 45px с очисткой." },
      { name: "ToolbarIconButton", type: "icon, tone, active, title", desc: "Квадратная icon-кнопка 45×45; tone: neutral / success / primary." },
      { name: "ReorderableListPopover", type: "items, order, hidden, onOrderChange, …", desc: "Настройка колонок: drag-reorder + чекбоксы видимости." },
    ],
    usage: `const [points, setPoints] = useState<string[]>([]);   // пусто = «Все»
const [search, setSearch] = useState("");
const [status, setStatus] = useState("Все");

<div className="flex items-center gap-3">
  <button className="h-[45px] rounded-lg bg-[#0080ff] px-5 text-white">Создать</button>

  <MultiSelectField
    options={["Центральный", "Северный", "Южный"]}
    selected={points}
    onChange={setPoints}
    placeholder="Выберите точки..."
    emptyLabel="Все точки"
  />

  <SearchField value={search} onChange={setSearch} />

  <ToolbarIconButton tone="primary" title="Фильтры" icon={<Filter size={18} />} />
</div>

{/* Панель фильтров */}
<CompactSelect
  label="Статус"
  value={status}
  options={["Все", "Принят", "В работе", "Доставлен"]}
  onChange={setStatus}
/>`,
    notes: [
      "Для фильтров: пустой выбор = «Все» = фильтр выключен. Не предвыбирайте все опции.",
      "MultiSelectField сам включает поиск (от 7 опций) и кнопки «Применить/Сбросить» (от 16).",
    ],
  },
};

// ─── App shell ────────────────────────────────────────────────────────────────

export default function App() {
  const [activeSection, setActiveSection] = useState("tokens");
  const [showCode, setShowCode] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const scrollToHash = () => {
      const id = window.location.hash.replace(/^#/, "");
      if (!id) return;
      const el = document.getElementById(id);
      if (el) {
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          setActiveSection(id);
        });
      }
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen font-['Roboto',sans-serif] bg-[#f0f3f8] dark:bg-[#0d0e12]">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#0d0e12] border-b border-[#e3eaf4] dark:border-[#2a2c3a]">
        <div className="max-w-[1344px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-[#332c38] flex items-center justify-center text-white font-bold text-[16px] font-['Roboto',sans-serif] select-none">
              M
            </div>
            <div>
              <div className="text-[15px] font-bold text-[#171a24] dark:text-[#e8e9ef] leading-tight">MyPoint Design System — UI Kit</div>
              <div className="text-[11px] text-[#9d99ac] dark:text-[#6b6f85]">Все компоненты · Все варианты · Все размеры</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-[#9d99ac] dark:text-[#6b6f85]">v 1.0 · Design System</span>

            {/* Тумблер Превью ⇄ Код — переводит весь Kit в режим сниппетов */}
            <div className="flex items-center rounded-lg border border-[#e3eaf4] dark:border-[#2a2c3a] p-0.5">
              <button
                onClick={() => setShowCode(false)}
                className={`flex items-center gap-1 h-7 px-2.5 rounded-md text-[12px] font-medium transition-colors ${
                  !showCode
                    ? "bg-[#0080ff] text-white"
                    : "text-[#6e6b7b] dark:text-[#8b8fa8] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028]"
                }`}
                title="Показать живые компоненты"
              >
                <Eye size={13} />
                Превью
              </button>
              <button
                onClick={() => setShowCode(true)}
                className={`flex items-center gap-1 h-7 px-2.5 rounded-md text-[12px] font-medium transition-colors ${
                  showCode
                    ? "bg-[#0080ff] text-white"
                    : "text-[#6e6b7b] dark:text-[#8b8fa8] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028]"
                }`}
                title="Показать код использования"
              >
                <Code2 size={13} />
                Код
              </button>
            </div>

            <button
              onClick={() => {
                const html = document.documentElement;
                html.classList.toggle("dark");
              }}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e3eaf4] dark:border-[#2a2c3a] dark:border-[#2a2c3a] text-[#6e6b7b] dark:text-[#8b8fa8] dark:text-[#9d99ac] dark:text-[#6b6f85] hover:bg-[#f5f7fa] dark:hover:bg-[#1e2028] dark:hover:bg-[#1e2028] transition-colors"
              title="Переключить тему"
            >
              <Sun size={14} className="dark:hidden" />
              <Moon size={14} className="hidden dark:block" />
            </button>
          </div>
        </div>
        {/* Tab bar */}
        <div className="border-t border-[#e3eaf4] dark:border-[#2a2c3a] bg-white dark:bg-[#0d0e12]">
          <div className="max-w-[1344px] mx-auto px-6 flex overflow-x-auto scrollbar-light scroll-smooth gap-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`shrink-0 px-4 py-2.5 text-[12px] font-medium relative transition-colors whitespace-nowrap
                  ${activeSection === s.id ? "text-[#0080ff]" : "text-[#9d99ac] dark:text-[#6b6f85] hover:text-[#6e6b7b] dark:text-[#8b8fa8]"}`}
              >
                {s.label}
                {activeSection === s.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0080ff]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main canvas */}
      <main ref={contentRef} className="max-w-[1344px] mx-auto px-6 py-8 space-y-6">
        {SECTIONS.map((section) => {
          const contentMap: Record<string, React.ReactNode> = {
            tokens: <TokensSection />,
            colors: <ColorsSection />,
            typography: <TypographySection />,
            spacing: <SpacingSection />,
            shadows: <ShadowsSection />,
            buttons: <ButtonsSection />,
            modal: <ModalSection />,
            toast: <ToastSection />,
            tooltip: <TooltipSection />,
            skeleton: <SkeletonSection />,
            emptystate: <EmptyStateSection />,
            progress: <ProgressSection />,
            table: <TableSection />,
            icons: <IconsSection />,
            accordion:    <AccordionSection />,
            fileupload:   <FileUploadSection />,
            rangeslider:  <RangeSliderSection />,
            popover:      <PopoverSection />,
            borderradius:  <BorderRadiusSection />,
            numberinput:  <NumberInputSection />,
            datepicker:   <DatePickerSection />,
            inputs: <InputsSection />,
            tags: <TagsSection />,
            avatars: <AvatarsSection />,
            alerts: <AlertsSection />,
            formcontrols: <FormControlsSection />,
            navigation: <NavigationSection />,
            cards: <CardsSection />,
            receipt: <ReceiptSection />,
            toolbar: <ToolbarSection />,
          };
          return (
            <SectionPanel key={section.id} id={section.id}>
              <div className="bg-white dark:bg-[#161820] rounded-2xl border border-[#e3eaf4] dark:border-[#2a2c3a] shadow-sm overflow-visible dark:shadow-none">
                <SectionChip section={section} />
                {showCode
                  ? (SECTION_DOCS[section.id]
                      ? <CodeBlock doc={SECTION_DOCS[section.id]} />
                      : <div className="p-6 text-[13px] text-[#9d99ac]">Документация для этой секции пока не добавлена.</div>)
                  : contentMap[section.id]}
              </div>
            </SectionPanel>
          );
        })}
      </main>
    </div>
  );
}
