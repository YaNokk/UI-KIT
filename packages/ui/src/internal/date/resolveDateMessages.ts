export interface DateMessages {
  previousMonth: string;
  nextMonth: string;
  selectMonth: string;
  selectYear: string;
  startDate: string;
  endDate: string;
  startDateTime: string;
  endDateTime: string;
  chooseDate: string;
  chooseRange: string;
  chooseDateTimeRange: string;
  chooseRangeStart: string;
  chooseRangeEnd: string;
  apply: string;
  cancel: string;
  close: string;
  reset: string;
  today: string;
  yesterday: string;
  thisWeek: string;
  previousWeek: string;
  last7Days: string;
  last30Days: string;
  last24Hours: string;
  thisMonth: string;
  previousMonthPreset: string;
  thisQuarter: string;
  previousQuarter: string;
  thisYear: string;
  previousYear: string;
  allTime: string;
  invalidDate: string;
  invalidTime: string;
  invalidRange: string;
}

const en: DateMessages = {
  previousMonth: "Previous month", nextMonth: "Next month",
  selectMonth: "Select month", selectYear: "Select year",
  startDate: "From", endDate: "To", startDateTime: "Start date and time",
  endDateTime: "End date and time", chooseDate: "Choose a date",
  chooseRange: "Choose a date range", chooseDateTimeRange: "Choose date and time range",
  chooseRangeStart: "Choose a start date", chooseRangeEnd: "Choose an end date",
  apply: "Apply", cancel: "Cancel", close: "Close", reset: "Reset",
  today: "Today", yesterday: "Yesterday", thisWeek: "This week",
  previousWeek: "Previous week", last7Days: "Last 7 days",
  last30Days: "Last 30 days", last24Hours: "Last 24 hours",
  thisMonth: "This month", previousMonthPreset: "Previous month",
  thisQuarter: "This quarter", previousQuarter: "Previous quarter",
  thisYear: "This year", previousYear: "Previous year", allTime: "All time",
  invalidDate: "Enter a valid date", invalidTime: "Enter a valid time",
  invalidRange: "End date or time is before start"
};

const ru: DateMessages = {
  previousMonth: "Предыдущий месяц", nextMonth: "Следующий месяц",
  selectMonth: "Выберите месяц", selectYear: "Выберите год",
  startDate: "От", endDate: "До", startDateTime: "Дата и время начала",
  endDateTime: "Дата и время окончания", chooseDate: "Выберите дату",
  chooseRange: "Выберите период", chooseDateTimeRange: "Выберите период и время",
  chooseRangeStart: "Выберите дату начала", chooseRangeEnd: "Выберите дату окончания",
  apply: "Применить", cancel: "Отмена", close: "Закрыть", reset: "Сбросить",
  today: "Сегодня", yesterday: "Вчера", thisWeek: "Эта неделя",
  previousWeek: "Прошлая неделя", last7Days: "Последние 7 дней",
  last30Days: "Последние 30 дней", last24Hours: "Последние 24 часа",
  thisMonth: "Этот месяц", previousMonthPreset: "Прошлый месяц",
  thisQuarter: "Этот квартал", previousQuarter: "Прошлый квартал",
  thisYear: "Этот год", previousYear: "Прошлый год", allTime: "Всё время",
  invalidDate: "Введите корректную дату", invalidTime: "Введите корректное время",
  invalidRange: "Дата или время окончания раньше начала"
};

export function resolveDateMessages(locale: string): DateMessages {
  return locale.toLowerCase().startsWith("ru") ? ru : en;
}
