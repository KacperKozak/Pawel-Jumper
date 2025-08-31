export interface SectionAnchor {
    label: string
    line: number
    kind: 'imports' | 'component' | 'hooks' | 'handlers' | 'return' | 'other'
}

const hookNames = [
    'useState',
    'useEffect',
    'useLayoutEffect',
    'useMemo',
    'useCallback',
    'useRef',
    'useReducer',
    'useContext',
    'useImperativeHandle',
    'useDeferredValue',
    'useTransition',
    'useSyncExternalStore',
    'useId',
]

const hookRegex = new RegExp(`\\b(${hookNames.join('|')})\\b`)

const isImportLine = (text: string) => /^\s*import\s+/.test(text)
const isEslintDisable = (text: string) => /eslint-disable/.test(text)
const isTopComment = (text: string) => /^\s*\/\//.test(text) || /^\s*\/*\*/.test(text)

const isComponentDeclaration = (text: string) => {
    if (/^\s*export\s+const\s+[A-Z][A-Za-z0-9_]*/.test(text)) return true
    if (/^\s*const\s+[A-Z][A-Za-z0-9_]*\s*(?::|=)/.test(text)) return true
    if (/^\s*(export\s+)?function\s+[A-Z][A-Za-z0-9_]*/.test(text)) return true
    return false
}

const isHandlerDeclaration = (text: string) => {
    return /(^|\s)(const\s+handle[A-Z]|function\s+handle[A-Z])/.test(text)
}

const isReturnLine = (text: string) => /\breturn\b\s*(<|\(|null|false|\w)/.test(text)

export const computeSectionAnchorsFromLines = (lines: string[]): SectionAnchor[] => {
    const anchors: SectionAnchor[] = []
    const total = lines.length

    let firstImportLine: number | undefined
    for (let i = 0; i < Math.min(total, 500); i++) {
        const lineText = lines[i] ?? ''
        if (i === 0 && (isTopComment(lineText) || isEslintDisable(lineText))) {
            continue
        }
        if (isImportLine(lineText)) {
            anchors.push({ label: 'imports', line: i, kind: 'imports' })
            firstImportLine = i
            break
        }
        if (lineText.trim().length > 0 && !isTopComment(lineText)) break
    }

    let componentLine: number | undefined
    for (let i = 0; i < total; i++) {
        const text = lines[i] ?? ''
        if (isComponentDeclaration(text)) {
            anchors.push({ label: 'component', line: i, kind: 'component' })
            componentLine = i
            break
        }
    }

    const hookScanStart =
        componentLine ?? (firstImportLine !== undefined ? firstImportLine + 1 : 0)
    for (let i = hookScanStart; i < total; i++) {
        const text = lines[i] ?? ''
        if (isImportLine(text)) continue
        if (hookRegex.test(text)) {
            anchors.push({ label: 'hooks', line: i, kind: 'hooks' })
            break
        }
    }

    for (let i = hookScanStart; i < total; i++) {
        const text = lines[i] ?? ''
        if (isHandlerDeclaration(text)) {
            anchors.push({ label: 'handlers', line: i, kind: 'handlers' })
            break
        }
    }

    for (let i = hookScanStart; i < total; i++) {
        const text = lines[i] ?? ''
        if (isReturnLine(text)) {
            anchors.push({ label: 'return', line: i, kind: 'return' })
            break
        }
    }

    const byLine = new Map<number, SectionAnchor>()
    for (const a of anchors) {
        if (!byLine.has(a.line)) byLine.set(a.line, a)
    }
    return Array.from(byLine.values()).sort((a, b) => a.line - b.line)
}
