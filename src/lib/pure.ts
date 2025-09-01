import { escapeRegExp } from '../utils/regexp'
import { isBlankLine } from '../utils/string'

export interface OccurrencePosition {
    line: number
    character: number
}

export const getBlankLineIndicesFromLines = (lines: string[]): number[] => {
    const indices: number[] = []
    for (let i = 0; i < lines.length; i++) {
        if (isBlankLine(lines[i] ?? '')) indices.push(i)
    }
    return indices
}

export const findOccurrencesInLines = (
    lines: string[],
    term: string,
): OccurrencePosition[] => {
    const occurrences: OccurrencePosition[] = []
    const isWordish = /^[A-Za-z0-9_]+$/.test(term)
    const pattern = isWordish ? `\\b${escapeRegExp(term)}\\b` : escapeRegExp(term)
    const regex = new RegExp(pattern, 'g')
    for (let i = 0; i < lines.length; i++) {
        const text = lines[i] ?? ''
        regex.lastIndex = 0
        let match: RegExpExecArray | null
        while ((match = regex.exec(text)) !== null) {
            occurrences.push({ line: i, character: match.index })
            if (match.index === regex.lastIndex) regex.lastIndex++
        }
    }
    return occurrences
}

export const findNextOccurrenceIndexAfterBase = (
    occurrences: OccurrencePosition[],
    baseLine: number,
    baseCharacter: number,
): number => {
    for (let i = 0; i < occurrences.length; i++) {
        const o = occurrences[i]
        if (o.line > baseLine || (o.line === baseLine && o.character > baseCharacter)) {
            return i
        }
    }
    return -1
}

export const findPreviousOccurrenceIndexBeforeBase = (
    occurrences: OccurrencePosition[],
    baseLine: number,
    baseCharacter: number,
): number => {
    for (let i = occurrences.length - 1; i >= 0; i--) {
        const o = occurrences[i]
        if (o.line < baseLine || (o.line === baseLine && o.character < baseCharacter)) {
            return i
        }
    }
    return -1
}

export const findNextBlankLineIndexOrEnd = (
    lines: string[],
    currentLine: number,
): number => {
    for (let i = currentLine + 1; i < lines.length; i++) {
        if (isBlankLine(lines[i] ?? '')) return i
    }
    return Math.max(0, lines.length - 1)
}

export const findPreviousBlankLineIndexOrStart = (
    lines: string[],
    currentLine: number,
): number => {
    for (let i = currentLine - 1; i >= 0; i--) {
        if (isBlankLine(lines[i] ?? '')) return i
    }
    return 0
}

export const indexOfNextBlankLineOrEnd = (
    lines: string[],
    currentLine: number,
): number => {
    for (let i = currentLine + 1; i < lines.length; i++) {
        if (isBlankLine(lines[i] ?? '')) return i
    }
    return lines.length
}

export const indexOfPreviousBlankLineOrStart = (
    lines: string[],
    currentLine: number,
): number => {
    for (let i = currentLine - 1; i >= 0; i--) {
        if (isBlankLine(lines[i] ?? '')) return i
    }
    return -1
}

export const computeInternalStops = (
    firstContentLine: number,
    lastContentLine: number,
    maxJumpDistance: number,
): number[] => {
    if (lastContentLine < firstContentLine) return []
    const contentCount = lastContentLine - firstContentLine + 1
    const groups = Math.floor(contentCount / maxJumpDistance)
    const internalStopsCount = Math.max(0, groups - 1)
    if (internalStopsCount === 0) return []
    if (internalStopsCount === 1) {
        const center = Math.floor((firstContentLine + lastContentLine) / 2)
        return [center]
    }
    const stops: number[] = []
    for (let i = 1; i <= internalStopsCount; i++) {
        const raw =
            firstContentLine +
            Math.round((i * contentCount) / (internalStopsCount + 1)) -
            1
        const clamped = Math.min(Math.max(raw, firstContentLine), lastContentLine)
        if (stops.length === 0 || stops[stops.length - 1] !== clamped) stops.push(clamped)
    }
    return stops
}

export const findNextStopLine = (
    lines: string[],
    currentLine: number,
    maxJumpDistance: number,
): number => {
    const nextBlank = indexOfNextBlankLineOrEnd(lines, currentLine)
    const startBlank = indexOfPreviousBlankLineOrStart(lines, currentLine)
    const currentIsBlank = isBlankLine(lines[currentLine] ?? '')
    const firstContent = Math.max((currentIsBlank ? currentLine : startBlank) + 1, 0)
    const lastContent = Math.min(
        nextBlank === lines.length ? lines.length - 1 : nextBlank - 1,
        lines.length - 1,
    )
    if (lastContent < firstContent) {
        // no content block, so boundary is either blank line or EOF
        return nextBlank === lines.length ? lines.length - 1 : nextBlank
    }
    const internal = computeInternalStops(firstContent, lastContent, maxJumpDistance)
    const boundaryStop = nextBlank === lines.length ? lines.length - 1 : nextBlank
    const candidates = [...internal, boundaryStop]
    for (const c of candidates) {
        if (c > currentLine) return c
    }
    return boundaryStop
}

export const findPreviousStopLine = (
    lines: string[],
    currentLine: number,
    maxJumpDistance: number,
): number => {
    const prevBlank = indexOfPreviousBlankLineOrStart(lines, currentLine)
    const nextBlank = indexOfNextBlankLineOrEnd(lines, currentLine)
    const currentIsBlank = isBlankLine(lines[currentLine] ?? '')
    const firstContent = Math.max(prevBlank + 1, 0)
    const lastContent = Math.min(
        (currentIsBlank ? currentLine : nextBlank) === lines.length
            ? lines.length - 1
            : (currentIsBlank ? currentLine : nextBlank) - 1,
        lines.length - 1,
    )
    if (lastContent < firstContent) {
        // no content block, so boundary is either blank line or BOF
        return prevBlank < 0 ? 0 : prevBlank
    }
    const internal = computeInternalStops(firstContent, lastContent, maxJumpDistance)
    const boundaryStop = prevBlank < 0 ? 0 : prevBlank
    const candidates = [boundaryStop, ...internal]
    let chosen = boundaryStop
    for (const c of candidates) {
        if (c < currentLine) chosen = c
    }
    return chosen
}
