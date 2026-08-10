# DataTable contract

`DataTable` сохраняет native table semantics и использует TanStack Table только
как внутренний headless state/model engine. Сортировка, загрузка и пагинация
данных остаются ответственностью consumer-а.

## Responsive column pinning

`DataTableColumn.sticky` объявляет допустимую логическую зону колонки.
`pinnedColumnIds` может передать responsive-effective подмножество этих колонок;
ID из другой зоны игнорируются, а итоговый порядок всегда берётся из controlled
`columnOrder`. `ResponsiveDataView` и product patterns могут выбирать это
подмножество по своим breakpoint/container rules, не меняя column definitions.

Renderer всегда применяет safety fallback после controlled inputs. Для start и
end зон резервируется минимум одна table special-column ширина (48 px) обычного
scroll flow. Затем закрепление сохраняется в стабильном порядке:

1. start — от внешнего logical start edge к внутреннему;
2. end — от внешнего logical end edge к внутреннему;
3. первая колонка, которая не помещается в оставшийся budget, и все следующие
   колонки этой зоны возвращаются в обычный horizontal scroll flow.

Start имеет приоритет перед end. Это renderer safety policy, а не продуктовая
приоритизация данных: consumer может заранее сузить `pinnedColumnIds`. До первого
измерения scroll viewport data-columns не закрепляются, поэтому SSR/первый render
не создаёт пересекающиеся sticky layers. Selection/expansion special cells
остаются logical-start controls и учитываются в доступном budget.

Policy не скрывает DOM-колонки, не меняет tab order и не виртуализирует строки.
Будущий virtual renderer обязан использовать финальные `table.getRowModel().rows`
и стабильный `getRowId`.
