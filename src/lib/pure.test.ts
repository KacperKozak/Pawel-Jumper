import { describe, it, expect } from 'bun:test'
import dedent from 'dedent'
import {
    getBlankLineIndicesFromLines,
    findOccurrencesInLines,
    findNextBlankLineIndexOrEnd,
    findPreviousBlankLineIndexOrStart,
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
})
