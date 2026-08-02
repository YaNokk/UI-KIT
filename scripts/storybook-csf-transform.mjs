const executionMarker = "if (_isRunningFromThisFile) {";

export function forceExecuteTransformedStories(code) {
  const markerCount = code.split(executionMarker).length - 1;
  if (markerCount !== 1) {
    throw new Error(
      `Storybook CSF transform execution marker must appear exactly once; found ${markerCount}.`,
    );
  }
  return code.replace(executionMarker, "if (true) {");
}
