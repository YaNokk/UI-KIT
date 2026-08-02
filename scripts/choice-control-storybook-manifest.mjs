export const storyFile =
  "packages/ui/src/internal/choice-control/ChoiceControlBrowserRegression.stories.tsx";

export const correctiveStories = [
  "RadioDescriptionAssociation",
  "SwitchBrandForeground",
  "GroupInvalidOwnership",
  "StandaloneFormSubmission",
  "UncontrolledIndicatorStates"
];

export const allExpectedStories = [
  ...correctiveStories,
  "NativeInteraction",
  "GroupsAndForms",
  "GeometryThemeAndMedia"
];

export const expectedEnvironmentNames = [
  "chromium",
  "chromium-forced-colors",
  "chromium-reduced-motion"
];
