import type { SelectMessages } from "./types";

export function resolveSelectMessages(locale: string): SelectMessages {
  const language = locale.toLowerCase().split("-")[0];
  if (language === "ru") {
    return {
      clear: "Очистить выбор",
      done: "Готово",
      empty: "Нет вариантов",
      error: "Не удалось загрузить варианты",
      loading: "Загрузка",
      noResults: "Ничего не найдено",
      search: "Поиск по вариантам",
      searchPlaceholder: "Поиск",
      retry: "Повторить",
      remove: (textValue) => `Убрать ${textValue}`,
      selectedCount: (count) => `Выбрано: ${count}`,
      selectedSummary: (items) => `Выбрано ${items.length}: ${items.join(", ")}`,
      sheetTitle: "Выбор",
      sheetClose: "Закрыть выбор"
    };
  }
  if (language === "kk") {
    return {
      clear: "Таңдауды тазалау",
      done: "Дайын",
      empty: "Нұсқалар жоқ",
      error: "Нұсқаларды жүктеу мүмкін болмады",
      loading: "Жүктелуде",
      noResults: "Ештеңе табылмады",
      search: "Нұсқалардан іздеу",
      searchPlaceholder: "Іздеу",
      retry: "Қайталау",
      remove: (textValue) => `Алып тастау: ${textValue}`,
      selectedCount: (count) => `Таңдалды: ${count}`,
      selectedSummary: (items) => `Таңдалды ${items.length}: ${items.join(", ")}`,
      sheetTitle: "Таңдау",
      sheetClose: "Таңдауды жабу"
    };
  }
  return {
    clear: "Clear selection",
    done: "Done",
    empty: "No options",
    error: "Could not load options",
    loading: "Loading",
    noResults: "No results",
    search: "Search options",
    searchPlaceholder: "Search",
    retry: "Try again",
    remove: (textValue) => `Remove ${textValue}`,
    selectedCount: (count) => `${count} selected`,
    selectedSummary: (items) => `Selected ${items.length}: ${items.join(", ")}`,
    sheetTitle: "Select",
    sheetClose: "Close select"
  };
}
