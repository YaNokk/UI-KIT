export interface ActionMenuLabels {
  close: string;
  title: string;
  trigger: string;
}

export function resolveActionMenuLabels(locale: string): ActionMenuLabels {
  const language = locale.toLowerCase().split("-")[0];
  if (language === "ru") {
    return {
      close: "Закрыть действия",
      title: "Действия",
      trigger: "Действия"
    };
  }
  if (language === "kk") {
    return {
      close: "Әрекеттерді жабу",
      title: "Әрекеттер",
      trigger: "Әрекеттер"
    };
  }
  return {
    close: "Close actions",
    title: "Actions",
    trigger: "Actions"
  };
}
