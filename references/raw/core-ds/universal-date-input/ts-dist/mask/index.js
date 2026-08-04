import { TEMPLATES } from '../consts';
import { createCaretPosPlugin } from './plugins';
import { createPreventCaretJumpPostprocessor } from './postprocessors';
import { createDisallowInputPreprocessor, createValidationPreprocessor } from './preprocessors';
import { getValueSegments, segmentsToPattern, segmentsToString, shiftSegmentsData } from './utils';
export function createMaskOptions(view, min, max, autoCorrection, onCorrection) {
    const template = TEMPLATES[view];
    const stringTemplate = segmentsToString(template.segments, template.separators);
    return {
        mask: createMaskExpression(template),
        preprocessors: [
            createDisallowInputPreprocessor(),
            ...(autoCorrection
                ? [createValidationPreprocessor(template, stringTemplate, min, max, onCorrection)]
                : []),
        ],
        postprocessors: [createPreventCaretJumpPostprocessor()],
        plugins: [createCaretPosPlugin(template)],
    };
}
function createMaskExpression({ segments: templateSegments, separators, }) {
    return ({ value }) => {
        if (value.length < 2)
            return [/\d/];
        const rawSegments = getValueSegments(value, separators);
        const segments = shiftSegmentsData(rawSegments, templateSegments);
        return segmentsToPattern(segments, separators);
    };
}
