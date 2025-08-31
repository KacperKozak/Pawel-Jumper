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
