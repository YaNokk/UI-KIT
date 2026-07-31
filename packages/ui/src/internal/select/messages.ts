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
      retry: "Повторить",
      remove: (textValue) => `Убрать ${textValue}`,
      selectedCount: (count) => `Выбрано: ${count}`,
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
      retry: "Қайталау",
      remove: (textValue) => `Алып тастау: ${textValue}`,
      selectedCount: (count) => `Таңдалды: ${count}`,
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
    retry: "Try again",
    remove: (textValue) => `Remove ${textValue}`,
    selectedCount: (count) => `${count} selected`,
    sheetTitle: "Select",
    sheetClose: "Close select"
  };
}
