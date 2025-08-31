import { describe, it, expect } from 'bun:test'
import dedent from 'dedent'
import { computeSectionAnchorsFromLines } from './anchors'

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

describe('sections.computeSectionAnchorsFromLines', () => {
    it('detects imports, component, hooks, handlers, return', () => {
        const anchors = computeSectionAnchorsFromLines(sampleReactComponent)
        const kinds = anchors.map((a) => a.kind)
        expect(kinds).toContain('imports')
        expect(kinds).toContain('component')
        expect(kinds).toContain('hooks')
        expect(kinds).toContain('handlers')
        expect(kinds).toContain('return')

        const byKind = Object.fromEntries(anchors.map((a) => [a.kind, a.line])) as Record<
            string,
            number
        >
        expect(byKind['imports']).toEqual(0)
        expect(byKind['component']).toEqual(3)
        expect(byKind['hooks']).toEqual(4)
        expect(byKind['handlers']).toEqual(8)
        expect(byKind['return']).toEqual(9)
    })

    it('handles files with no handlers gracefully', () => {
        const lines = dedent`
          import React, { useMemo } from 'react'
          
          export function Foo() {
            const v = useMemo(() => 1, [])
            return <span>{v}</span>
          }
        `.split('\n')
        const anchors = computeSectionAnchorsFromLines(lines)
        const kinds = anchors.map((a) => a.kind)
        expect(kinds).toContain('imports')
        expect(kinds).toContain('component')
        expect(kinds).toContain('hooks')
        expect(kinds).toContain('return')
    })

    it('does not crash on empty input', () => {
        const anchors = computeSectionAnchorsFromLines([])
        expect(anchors.length).toEqual(0)
    })
})
