# 09. Decisions Needed Before Scaling

Документы можно использовать уже сейчас. Но следующие решения желательно зафиксировать до того, как библиотека станет большой.

## 1. Brand

Нужно определить:
- primary brand color;
- logo usage;
- допустима ли корректировка brand color в dark theme ради contrast;
- нужны ли дополнительные brand/accent colors.

Текущее рабочее предположение: `#0080ff` — primary.

## 2. Typography

Нужно решить:
- Inter остаётся основным шрифтом или нет;
- поддерживаемые weights;
- кириллица/латиница;
- нужен ли tabular numeric variant для денежных/табличных данных.

Текущее предположение: Inter + system fallback.

## 3. Density

Определить default density продукта:
- compact;
- default;
- comfortable.

Для backoffice/POS целесообразно рассмотреть compact/default для desktop и более крупные touch targets для tablet/mobile.

## 4. Target devices

Зафиксировать минимальные поддерживаемые размеры и реальные устройства:
- mobile minimum width;
- tablet portrait/landscape;
- POS touchscreen resolutions;
- desktop minimum;
- 4K/large desktop expectations.

После этого breakpoints корректируются по реальным layout failures.

## 5. Dark theme policy

Определить:
- system / light / dark;
- хранение user preference;
- допускается ли theme override на уровне организации;
- должны ли embedded/printed artifacts иметь отдельную theme policy.

## 6. Accessibility target

По умолчанию документ предполагает WCAG 2.2 AA как baseline. Если есть иные требования — зафиксировать.

## 7. Existing legacy components

Для каждой текущей UI-зависимости выбрать стратегию:

```text
keep behind wrapper
migrate gradually
remove
```

Новые feature screens не должны увеличивать direct dependency на legacy UI APIs.

## 8. Browser/platform support

Важно определить support matrix, особенно если активно использовать container queries, modern CSS и Electron/WebView versions.

## 9. Internationalization

Если UI может быть multilingual, компоненты и visual tests должны учитывать расширение текста, формат дат/денег и RTL при необходимости.

## 10. Reference screens

Выбрать 3–5 экранов, которые станут эталонными vertical slices:
- entity list;
- entity details;
- complex form;
- settings;
- mobile task flow.

На них проверяется первая версия foundations и patterns.
