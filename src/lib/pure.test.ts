import { describe, it, expect } from 'bun:test'
import dedent from 'dedent'
import {
    getBlankLineIndicesFromLines,
    findOccurrencesInLines,
    findNextBlankLineIndexOrEnd,
    findPreviousBlankLineIndexOrStart,
    findNextOccurrenceIndexAfterBase,
    findPreviousOccurrenceIndexBeforeBase,
    computeInternalStops,
    findNextStopLine,
    findPreviousStopLine,
} from './pure'

const sampleReactComponent = dedent`
  import React, { useState, useEffect, useCallback } from 'react'
  import { Button } from './Button'

  export const MyComponent = () => {
    const [count, setCount] = useState(0)

    useEffect(() => {
      // side effect
    }, [])

    const handleClick = useCallback(() => setCount((c) => c + 1), [])

    return (
      <div>
        <Button onClick={handleClick}>Click {count}</Button>
      </div>
    )
  }
`.split('\n')

describe('pure', () => {
    it('finds blank line indices in a component', () => {
        const blankIndices = getBlankLineIndicesFromLines(sampleReactComponent)
        expect(blankIndices.length).toBeGreaterThan(0)
    })

    it('finds occurrences of a word', () => {
        const occ = findOccurrencesInLines(sampleReactComponent, 'useEffect')
        expect(occ.length).toBeGreaterThan(0)
        expect(occ[0].line).toBeGreaterThanOrEqual(0)
    })

    it('finds next/previous occurrence indices around a base', () => {
        const occ = findOccurrencesInLines(['alpha beta', 'beta gamma', 'alpha'], 'alpha')
        // occurrences at (0,0) and (2,0)
        expect(findNextOccurrenceIndexAfterBase(occ, 0, 0)).toBe(1)
        expect(findNextOccurrenceIndexAfterBase(occ, 0, -1)).toBe(0)
        expect(findNextOccurrenceIndexAfterBase(occ, 2, 0)).toBe(-1)
        expect(findPreviousOccurrenceIndexBeforeBase(occ, 2, 0)).toBe(0)
        expect(findPreviousOccurrenceIndexBeforeBase(occ, 0, 0)).toBe(-1)
    })

    it('does not crash on empty input', () => {
        expect(getBlankLineIndicesFromLines([]).length).toEqual(0)
        expect(findOccurrencesInLines([], 'foo').length).toEqual(0)
    })

    it('falls back to end when no next blank line', () => {
        const lines = ['a', 'b', 'c']
        const next = findNextBlankLineIndexOrEnd(lines, 0)
        expect(next).toEqual(2)
    })

    it('falls back to start when no previous blank line', () => {
        const lines = ['a', 'b', 'c']
        const prev = findPreviousBlankLineIndexOrStart(lines, 2)
        expect(prev).toEqual(0)
    })

    it('finds actual next/previous blank lines when present', () => {
        const lines = ['a', '', 'b', '', 'c']
        expect(findNextBlankLineIndexOrEnd(lines, 0)).toEqual(1)
        expect(findPreviousBlankLineIndexOrStart(lines, 4)).toEqual(3)
    })

    it('computes internal stops for large blocks', () => {
        // content lines 1..11 inside blanks at 0 and 12 with max=5 => one internal stop ~ middle
        const lines = ['']
            .concat(Array.from({ length: 11 }, (_, i) => `l${i + 1}`))
            .concat([''])
        const first = 1
        const last = 11
        const stops = computeInternalStops(first, last, 5)
        expect(stops.length).toBe(1)
        expect(stops[0]).toBeGreaterThanOrEqual(5)
        expect(stops[0]).toBeLessThanOrEqual(7)
    })

    it('next/previous stop line respects max jump distance', () => {
        const lines = ['']
            .concat(Array.from({ length: 16 }, (_, i) => `l${i + 1}`))
            .concat([''])
        // max 5 should produce two internal stops roughly at 5 and 10
        const next1 = findNextStopLine(lines, 1, 5)
        expect(next1).toBeGreaterThanOrEqual(5)
        expect(next1).toBeLessThanOrEqual(6)
        const next2 = findNextStopLine(lines, next1, 5)
        expect(next2).toBeGreaterThanOrEqual(10)
        expect(next2).toBeLessThanOrEqual(11)
        const next3 = findNextStopLine(lines, next2, 5)
        // Final next should be trailing blank at index length-1
        expect(next3).toEqual(lines.length - 1)

        // Going backwards
        const prev1 = findPreviousStopLine(lines, lines.length - 2, 5)
        expect(prev1).toBeGreaterThanOrEqual(10)
        expect(prev1).toBeLessThanOrEqual(11)
        const prev2 = findPreviousStopLine(lines, prev1, 5)
        expect(prev2).toBeGreaterThanOrEqual(5)
        expect(prev2).toBeLessThanOrEqual(6)
        const prev3 = findPreviousStopLine(lines, prev2, 5)
        expect(prev3).toEqual(0)
    })
    it('11-line block goes to center then to trailing blank', () => {
        const lines = ['']
            .concat(Array.from({ length: 11 }, (_, i) => `l${i + 1}`))
            .concat([''])
        const first = findNextStopLine(lines, 1, 5)
        expect(first).toBeGreaterThanOrEqual(5)
        expect(first).toBeLessThanOrEqual(7)
        const second = findNextStopLine(lines, first, 5)
        expect(second).toEqual(lines.length - 1)
    })

    it('11-line block upward: from end to center to leading blank', () => {
        const lines = ['']
            .concat(Array.from({ length: 11 }, (_, i) => `l${i + 1}`))
            .concat([''])
        const prev1 = findPreviousStopLine(lines, lines.length - 2, 5)
        expect(prev1).toBeGreaterThanOrEqual(5)
        expect(prev1).toBeLessThanOrEqual(7)
        const prev2 = findPreviousStopLine(lines, prev1, 5)
        expect(prev2).toEqual(0)
    })

    it('10-line block without edge blanks: start -> center -> end', () => {
        const lines = Array.from({ length: 10 }, (_, i) => `${i + 1}`)
        const first = findNextStopLine(lines, 0, 5)
        expect(first).toEqual(4)
        const second = findNextStopLine(lines, first, 5)
        expect(second).toEqual(lines.length - 1)
    })

    it('10-line block without edge blanks: end -> center -> start', () => {
        const lines = Array.from({ length: 10 }, (_, i) => `${i + 1}`)
        const prev1 = findPreviousStopLine(lines, lines.length - 1, 5)
        expect(prev1).toEqual(4)
        const prev2 = findPreviousStopLine(lines, prev1, 5)
        expect(prev2).toEqual(0)
    })

    it('10-line block with leading blank: start -> center -> trailing blank', () => {
        const lines = [''].concat(Array.from({ length: 10 }, (_, i) => `${i + 1}`))
        const first = findNextStopLine(lines, 0, 5)
        expect(first).toEqual(5) // center should be line 5 (1-based 6th), but index 5 due to leading blank
        const second = findNextStopLine(lines, first, 5)
        expect(second).toEqual(lines.length - 1) // trailing boundary blank
    })

    it('10-line block with trailing blank: start -> center -> trailing blank', () => {
        const lines = Array.from({ length: 10 }, (_, i) => `${i + 1}`).concat([''])
        const first = findNextStopLine(lines, 0, 5)
        expect(first).toEqual(4)
        const second = findNextStopLine(lines, first, 5)
        expect(second).toEqual(lines.length - 1)
    })

    it('10-line block with both edge blanks: start blank -> center -> trailing blank', () => {
        const lines = ['x', '']
            .concat(Array.from({ length: 10 }, (_, i) => `${i + 1}`))
            .concat(['', 'y'])
        const first = findNextStopLine(lines, 1, 5) // between x and big block
        expect(first).toEqual(6) // absolute index considering leading filler
        const second = findNextStopLine(lines, first, 5)
        expect(second).toEqual(lines.length - 2) // trailing blank between block and trailing filler
    })
})
