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

export const findBlankRunBoundsStartingAt = (
    lines: string[],
    startIndex: number,
): { start: number; end: number } => {
    let end = startIndex
    while (end + 1 < lines.length && isBlankLine(lines[end + 1] ?? '')) end++
    return { start: startIndex, end }
}

export const findBlankRunBoundsEndingAt = (
    lines: string[],
    endIndex: number,
): { start: number; end: number } => {
    let start = endIndex
    while (start - 1 >= 0 && isBlankLine(lines[start - 1] ?? '')) start--
    return { start, end: endIndex }
}

export const getBlankRunBoundsAtIndex = (
    lines: string[],
    index: number,
): { start: number; end: number } | null => {
    if (!isBlankLine(lines[index] ?? '')) return null
    let start = index
    while (start - 1 >= 0 && isBlankLine(lines[start - 1] ?? '')) start--
    let end = index
    while (end + 1 < lines.length && isBlankLine(lines[end + 1] ?? '')) end++
    return { start, end }
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
    const currentIsBlank = isBlankLine(lines[currentLine] ?? '')
    if (currentIsBlank) {
        const bounds = getBlankRunBoundsAtIndex(lines, currentLine)!
        const center = Math.floor((bounds.start + bounds.end) / 2)
        if (currentLine < center) return center
        // After center: move to next content block or trailing blank group center
        const nextBlankAfterRun = indexOfNextBlankLineOrEnd(lines, bounds.end)
        const firstContentAfterRun = bounds.end + 1
        const lastContentAfterRun = Math.min(
            nextBlankAfterRun === lines.length ? lines.length - 1 : nextBlankAfterRun - 1,
            lines.length - 1,
        )
        if (lastContentAfterRun >= firstContentAfterRun) {
            const internal = computeInternalStops(
                firstContentAfterRun,
                lastContentAfterRun,
                maxJumpDistance,
            )
            for (const s of internal) if (s > currentLine) return s
        }
        if (nextBlankAfterRun === lines.length) return lines.length - 1
        const nextBlankRun = findBlankRunBoundsStartingAt(lines, nextBlankAfterRun)
        return Math.floor((nextBlankRun.start + nextBlankRun.end) / 2)
    }

    const nextBlank = indexOfNextBlankLineOrEnd(lines, currentLine)
    const startBlank = indexOfPreviousBlankLineOrStart(lines, currentLine)
    const firstContent = Math.max(startBlank + 1, 0)
    const lastContent = Math.min(
        nextBlank === lines.length ? lines.length - 1 : nextBlank - 1,
        lines.length - 1,
    )
    if (lastContent < firstContent) {
        // no content block, so boundary is either EOF or next blank group center
        if (nextBlank === lines.length) return lines.length - 1
        const run = findBlankRunBoundsStartingAt(lines, nextBlank)
        return Math.floor((run.start + run.end) / 2)
    }
    const internal = computeInternalStops(firstContent, lastContent, maxJumpDistance)
    const boundaryStop =
        nextBlank === lines.length
            ? lines.length - 1
            : Math.floor(
                  (findBlankRunBoundsStartingAt(lines, nextBlank).start +
                      findBlankRunBoundsStartingAt(lines, nextBlank).end) /
                      2,
              )
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
    const currentIsBlank = isBlankLine(lines[currentLine] ?? '')
    if (currentIsBlank) {
        const bounds = getBlankRunBoundsAtIndex(lines, currentLine)!
        const center = Math.floor((bounds.start + bounds.end) / 2)
        if (currentLine > center) return center
        // Before center: move to previous content block or leading blank group center
        const prevBlankBeforeRun = indexOfPreviousBlankLineOrStart(lines, bounds.start)
        const firstContentBeforeRun = Math.max(prevBlankBeforeRun + 1, 0)
        const lastContentBeforeRun = bounds.start - 1
        if (lastContentBeforeRun >= firstContentBeforeRun) {
            const internal = computeInternalStops(
                firstContentBeforeRun,
                lastContentBeforeRun,
                maxJumpDistance,
            )
            for (let i = internal.length - 1; i >= 0; i--)
                if (internal[i] < currentLine) return internal[i]
        }
        if (prevBlankBeforeRun < 0) return 0
        const prevBlankRun = findBlankRunBoundsEndingAt(lines, prevBlankBeforeRun)
        return Math.floor((prevBlankRun.start + prevBlankRun.end) / 2)
    }

    const prevBlank = indexOfPreviousBlankLineOrStart(lines, currentLine)
    const nextBlank = indexOfNextBlankLineOrEnd(lines, currentLine)
    const firstContent = Math.max(prevBlank + 1, 0)
    const lastContent = Math.min(
        (currentIsBlank ? currentLine : nextBlank) === lines.length
            ? lines.length - 1
            : (currentIsBlank ? currentLine : nextBlank) - 1,
        lines.length - 1,
    )
    if (lastContent < firstContent) {
        // no content block, so boundary is either BOF or previous blank group center
        if (prevBlank < 0) return 0
        const run = findBlankRunBoundsEndingAt(lines, prevBlank)
        return Math.floor((run.start + run.end) / 2)
    }
    const internal = computeInternalStops(firstContent, lastContent, maxJumpDistance)
    const boundaryStop =
        prevBlank < 0
            ? 0
            : Math.floor(
                  (findBlankRunBoundsEndingAt(lines, prevBlank).start +
                      findBlankRunBoundsEndingAt(lines, prevBlank).end) /
                      2,
              )
    const candidates = [boundaryStop, ...internal]
    let chosen = boundaryStop
    for (const c of candidates) {
        if (c < currentLine) chosen = c
    }
    return chosen
}
