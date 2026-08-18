# BottomSheet contract

`BottomSheet` is a controlled modal surface anchored to the viewport bottom.
It dims and guards the page and reports backdrop, Escape, close-button,
ancestor or swipe close reasons.

The sheet uses `100dvh`, tracks `VisualViewport.height` only while active to
reduce keyboard overlap, and applies bottom safe-area padding. It does not yet
promise keyboard positioning or `VisualViewport.offsetTop` handling. Its body
remains independently scrollable. Like Dialog and Drawer, body content starts
after canonical `space.4`; each surface may independently tune only its inline
and bottom padding. A private touch/pen adapter dismisses on
downward velocity `0.4 px/ms` or distance `20%`, ignores horizontal/upward
gestures and gives the nearest vertically scrollable ancestor priority while
its `scrollTop` is above zero.

Gesture tuning, snap points and raw geometry are not public API. BottomSheet
remains mobile-hardening pending; Dialog and Drawer may freeze independently.
