import * as vscode from 'vscode'

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
    // Matches: export const Name = ( ...
    if (/^\s*export\s+const\s+[A-Z][A-Za-z0-9_]*/.test(text)) return true
    // Matches: const Name: React.FC ... or const Name = ( ...
    if (/^\s*const\s+[A-Z][A-Za-z0-9_]*\s*(?::|=)/.test(text)) return true
    // Matches: export function Name( ... or function Name(
    if (/^\s*(export\s+)?function\s+[A-Z][A-Za-z0-9_]*/.test(text)) return true
    return false
}

const isHandlerDeclaration = (text: string) => {
    // const handleX = ... or function handleX(
    return /(^|\s)(const\s+handle[A-Z]|function\s+handle[A-Z])/.test(text)
}

const isReturnLine = (text: string) => /\breturn\b\s*(<|\(|null|false|\w)/.test(text)

export const computeSectionAnchorsFromLines = (lines: string[]): SectionAnchor[] => {
    const anchors: SectionAnchor[] = []
    const total = lines.length

    for (let i = 0; i < Math.min(total, 500); i++) {
        const lineText = lines[i] ?? ''
        if (i === 0 && (isTopComment(lineText) || isEslintDisable(lineText))) {
            continue
        }
        if (isImportLine(lineText)) {
            anchors.push({ label: 'imports', line: i, kind: 'imports' })
            break
        }
        if (lineText.trim().length > 0 && !isTopComment(lineText)) break
    }

    for (let i = 0; i < total; i++) {
        const text = lines[i] ?? ''
        if (isComponentDeclaration(text)) {
            anchors.push({ label: 'component', line: i, kind: 'component' })
            break
        }
    }

    for (let i = 0; i < total; i++) {
        const text = lines[i] ?? ''
        if (hookRegex.test(text)) {
            anchors.push({ label: 'hooks', line: i, kind: 'hooks' })
            break
        }
    }

    for (let i = 0; i < total; i++) {
        const text = lines[i] ?? ''
        if (isHandlerDeclaration(text)) {
            anchors.push({ label: 'handlers', line: i, kind: 'handlers' })
            break
        }
    }

    for (let i = 0; i < total; i++) {
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

export const computeSectionAnchors = (document: vscode.TextDocument): SectionAnchor[] => {
    const lines: string[] = []
    for (let i = 0; i < document.lineCount; i++) {
        lines.push(document.lineAt(i).text)
    }
    return computeSectionAnchorsFromLines(lines)
}

export const jumpToNextAnchor = (editor: vscode.TextEditor) => {
    const anchors = computeSectionAnchors(editor.document)
    if (anchors.length === 0) return

    const position = editor.selection.active
    const currentLine = position.line

    const next = anchors.find((a) => a.line > currentLine) ?? anchors[0]
    const newPos = new vscode.Position(next.line, 0)
    editor.selection = new vscode.Selection(newPos, newPos)
    editor.revealRange(
        new vscode.Range(newPos, newPos),
        vscode.TextEditorRevealType.AtTop,
    )
}

export const jumpToPreviousAnchor = (editor: vscode.TextEditor) => {
    const anchors = computeSectionAnchors(editor.document)
    if (anchors.length === 0) return

    const position = editor.selection.active
    const currentLine = position.line

    let prev = anchors[anchors.length - 1]
    for (let i = anchors.length - 1; i >= 0; i--) {
        if (anchors[i].line < currentLine) {
            prev = anchors[i]
            break
        }
    }
    const newPos = new vscode.Position(prev.line, 0)
    editor.selection = new vscode.Selection(newPos, newPos)
    editor.revealRange(
        new vscode.Range(newPos, newPos),
        vscode.TextEditorRevealType.AtTop,
    )
}
