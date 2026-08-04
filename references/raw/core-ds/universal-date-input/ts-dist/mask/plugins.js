import { findCursorPlace, getValueSegments } from './utils';
export function createCaretPosPlugin(template) {
    return (element) => {
        const handleKeyDown = (evt) => {
            const event = evt;
            const { selectionStart, selectionEnd, value } = element;
            if ([' ', '.'].includes(event.key) && selectionStart === selectionEnd) {
                const nextPos = findNextSegmentPos(value, template, selectionStart || 0);
                element.setSelectionRange(nextPos, nextPos);
            }
        };
        element.addEventListener('keydown', handleKeyDown);
        return () => element.removeEventListener('keydown', handleKeyDown);
    };
}
function findNextSegmentPos(value, template, cursorPos) {
    const segments = getValueSegments(value, template.separators);
    const selection = [cursorPos, cursorPos];
    const currCursorPlace = findCursorPlace(segments, template.segments, template.separators, selection);
    if (currCursorPlace) {
        let nextCursorPos = 0;
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const separatorLen = template.separators[i]?.length || 0;
            if (i === currCursorPlace.segmentIdx) {
                nextCursorPos += segment.length + separatorLen;
                return nextCursorPos;
            }
            nextCursorPos += segment.length + separatorLen;
        }
    }
    return cursorPos;
}
