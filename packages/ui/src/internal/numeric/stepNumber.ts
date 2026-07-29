export type StepDirection = 1 | -1;

export interface StepNumberOptions {
  value: number | null;
  direction: StepDirection;
  step?: number;
  min?: number;
  max?: number;
  maximumFractionDigits?: number;
  allowNegative?: boolean;
}

const MAX_DECIMAL_PRECISION = 15;
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER;

function assertFiniteOption(name: string, value: number | undefined) {
  if (value !== undefined && !Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number.`);
  }
}

function decimalPlaces(value: number) {
  const normalized = Math.abs(value).toString().toLowerCase();
  const [coefficient = normalized, exponentText] = normalized.split("e");
  const exponent = exponentText ? Number(exponentText) : 0;
  const fractionLength = coefficient.split(".")[1]?.length ?? 0;

  return Math.max(0, fractionLength - exponent);
}

function resolvePrecision({
  value,
  step,
  min,
  max,
  maximumFractionDigits,
}: {
  value: number | null;
  step: number;
  min: number | undefined;
  max: number | undefined;
  maximumFractionDigits: number | undefined;
}) {
  const requiredPrecision = Math.max(
    decimalPlaces(step),
    value === null ? 0 : decimalPlaces(value),
    min === undefined ? 0 : decimalPlaces(min),
    max === undefined ? 0 : decimalPlaces(max),
  );

  if (maximumFractionDigits === undefined) {
    return Math.min(requiredPrecision, MAX_DECIMAL_PRECISION);
  }

  if (
    !Number.isInteger(maximumFractionDigits) ||
    maximumFractionDigits < 0 ||
    maximumFractionDigits > MAX_DECIMAL_PRECISION
  ) {
    throw new RangeError(
      `maximumFractionDigits must be an integer between 0 and ${MAX_DECIMAL_PRECISION}.`,
    );
  }

  if (decimalPlaces(step) > maximumFractionDigits) {
    throw new RangeError(
      "step precision cannot exceed maximumFractionDigits.",
    );
  }

  return Math.min(requiredPrecision, maximumFractionDigits);
}

function clamp(value: number, min?: number, max?: number) {
  return Math.min(
    max ?? Number.POSITIVE_INFINITY,
    Math.max(min ?? Number.NEGATIVE_INFINITY, value),
  );
}

function safelyScale(value: number, scale: number): number | null;
function safelyScale(value: undefined, scale: number): undefined;
function safelyScale(
  value: number | undefined,
  scale: number,
): number | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  const scaledValue = value * scale;
  if (
    !Number.isFinite(scaledValue) ||
    Math.abs(scaledValue) > MAX_SAFE_INTEGER
  ) {
    return null;
  }

  const roundedValue = Math.round(scaledValue);
  return Number.isSafeInteger(roundedValue) ? roundedValue : null;
}

export function stepNumber({
  value,
  direction,
  step = 1,
  min,
  max,
  maximumFractionDigits,
  allowNegative = true,
}: StepNumberOptions) {
  assertFiniteOption("value", value ?? undefined);
  assertFiniteOption("step", step);
  assertFiniteOption("min", min);
  assertFiniteOption("max", max);

  if (step <= 0) {
    throw new RangeError("step must be greater than 0.");
  }

  if (min !== undefined && max !== undefined && min > max) {
    throw new RangeError("min cannot be greater than max.");
  }

  const precision = resolvePrecision({
    value,
    step,
    min,
    max,
    maximumFractionDigits,
  });
  const scale = 10 ** precision;
  if (!Number.isSafeInteger(scale)) {
    return value;
  }

  const scaledValue =
    value === null ? undefined : safelyScale(value, scale);
  const scaledStep = safelyScale(step, scale);
  const scaledMin =
    min === undefined ? undefined : safelyScale(min, scale);
  const scaledMax =
    max === undefined ? undefined : safelyScale(max, scale);

  if (
    scaledValue === null ||
    scaledStep === null ||
    scaledMin === null ||
    scaledMax === null
  ) {
    return value;
  }

  let scaledCandidate: number;

  if (value === null) {
    if (scaledMin !== undefined) {
      scaledCandidate = scaledMin;
    } else if (direction === 1) {
      scaledCandidate = scaledStep;
    } else {
      scaledCandidate = allowNegative ? -scaledStep : 0;
    }
  } else {
    if (scaledValue === undefined) {
      return value;
    }
    scaledCandidate = scaledValue + direction * scaledStep;
  }

  if (!Number.isSafeInteger(scaledCandidate)) {
    return value;
  }

  if (!allowNegative && min === undefined) {
    scaledCandidate = Math.max(0, scaledCandidate);
  }

  return clamp(scaledCandidate, scaledMin, scaledMax) / scale;
}

export function canStepNumber(options: StepNumberOptions) {
  return !Object.is(stepNumber(options), options.value);
}
