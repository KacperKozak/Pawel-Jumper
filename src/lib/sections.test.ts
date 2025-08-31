import { describe, it, expect } from 'bun:test'
import dedent from 'dedent'
import { getBlankLineIndicesFromLines, findOccurrencesInLines } from '../utils/pure'

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

describe('blank-line and occurrence helpers', () => {
    it('finds blank line indices in a component', () => {
        const blankIndices = getBlankLineIndicesFromLines(sampleReactComponent)
        expect(blankIndices.length).toBeGreaterThan(0)
    })

    it('finds occurrences of a word', () => {
        const occ = findOccurrencesInLines(sampleReactComponent, 'useEffect')
        expect(occ.length).toBeGreaterThan(0)
        expect(occ[0].line).toBeGreaterThanOrEqual(0)
    })

    it('finds multiple matches on the same line', () => {
        const lines = dedent`
          const ref = useRef(); const other = { ref };
          <div ref={ref} data-ref="x" />
        `.split('\n')
        const occ = findOccurrencesInLines(lines, 'ref')
        // Expect at least 4 matches across two lines
        expect(occ.length).toBeGreaterThanOrEqual(4)
        // Ensure multiple entries on the same first line
        const firstLineMatches = occ.filter((o) => o.line === 0)
        expect(firstLineMatches.length).toBeGreaterThanOrEqual(2)
    })

    it('does not crash on empty input', () => {
        expect(getBlankLineIndicesFromLines([]).length).toEqual(0)
        expect(findOccurrencesInLines([], 'foo').length).toEqual(0)
    })
})
