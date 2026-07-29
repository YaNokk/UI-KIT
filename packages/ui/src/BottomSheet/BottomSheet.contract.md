# BottomSheet contract

`BottomSheet` is a controlled modal surface anchored to the viewport bottom.
It dims and guards the page and reports backdrop, Escape, close-button,
ancestor or swipe close reasons.

The sheet uses `100dvh`, `VisualViewport` height updates and bottom safe-area
padding. Its body remains independently scrollable. A private touch/pen
adapter dismisses on downward velocity `0.4 px/ms` or distance `20%`, ignores
horizontal/upward gestures and never takes a downward gesture from an inner
scroll container while that container is above `scrollTop=0`.

Gesture tuning, snap points and raw geometry are not public API.
