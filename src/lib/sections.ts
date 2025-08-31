import * as vscode from 'vscode'
import { isBlankLine } from '../utils/string'
import { escapeRegExp } from '../utils/regexp'

export const findOccurrences = (
    document: vscode.TextDocument,
    term: string,
): { line: number; character: number }[] => {
    const occurrences: { line: number; character: number }[] = []
    const isWordish = /^[A-Za-z0-9_]+$/.test(term)
    const pattern = isWordish ? `\\b${escapeRegExp(term)}\\b` : escapeRegExp(term)
    const regex = new RegExp(pattern, 'g')

    for (let i = 0; i < document.lineCount; i++) {
        const text = document.lineAt(i).text
        regex.lastIndex = 0
        let match: RegExpExecArray | null
        while ((match = regex.exec(text)) !== null) {
            occurrences.push({ line: i, character: match.index })
            if (match.index === regex.lastIndex) regex.lastIndex++
        }
    }
    return occurrences
}

export const jumpToNextOccurrence = (editor: vscode.TextEditor, term: string) => {
    const occurrences = findOccurrences(editor.document, term)
    if (occurrences.length === 0) return

    const sel = editor.selection
    const base = sel.isEmpty ? sel.active : sel.end
    const after = occurrences.find(
        (o) =>
            o.line > base.line || (o.line === base.line && o.character > base.character),
    )
    const target = after ?? occurrences[occurrences.length - 1]
    // If no "after" found, do nothing (no wrap)
    if (!after) return
    const start = new vscode.Position(target.line, target.character)
    const end = new vscode.Position(target.line, target.character + term.length)
    editor.selection = new vscode.Selection(start, end)
    editor.revealRange(new vscode.Range(start, end), vscode.TextEditorRevealType.InCenter)
}

export const jumpToPreviousOccurrence = (editor: vscode.TextEditor, term: string) => {
    const occurrences = findOccurrences(editor.document, term)
    if (occurrences.length === 0) return

    const sel = editor.selection
    const base = sel.isEmpty ? sel.active : sel.start
    let found: { line: number; character: number } | undefined
    for (let i = occurrences.length - 1; i >= 0; i--) {
        const o = occurrences[i]
        if (
            o.line < base.line ||
            (o.line === base.line && o.character < base.character)
        ) {
            found = o
            break
        }
    }
    if (!found) return // no wrap
    const start = new vscode.Position(found.line, found.character)
    const end = new vscode.Position(found.line, found.character + term.length)
    editor.selection = new vscode.Selection(start, end)
    editor.revealRange(new vscode.Range(start, end), vscode.TextEditorRevealType.InCenter)
}

export const jumpToNextBlankLine = (editor: vscode.TextEditor) => {
    const doc = editor.document
    const current = editor.selection.active
    for (let i = current.line + 1; i < doc.lineCount; i++) {
        if (isBlankLine(doc.lineAt(i).text)) {
            const pos = new vscode.Position(i, 0)
            editor.selection = new vscode.Selection(pos, pos)
            editor.revealRange(
                new vscode.Range(pos, pos),
                vscode.TextEditorRevealType.InCenter,
            )
            return
        }
    }
    // If no blank line found, jump to end of file
    const eof = new vscode.Position(doc.lineCount - 1, 0)
    editor.selection = new vscode.Selection(eof, eof)
    editor.revealRange(new vscode.Range(eof, eof), vscode.TextEditorRevealType.InCenter)
}

export const jumpToPreviousBlankLine = (editor: vscode.TextEditor) => {
    const doc = editor.document
    const current = editor.selection.active
    for (let i = current.line - 1; i >= 0; i--) {
        if (isBlankLine(doc.lineAt(i).text)) {
            const pos = new vscode.Position(i, 0)
            editor.selection = new vscode.Selection(pos, pos)
            editor.revealRange(
                new vscode.Range(pos, pos),
                vscode.TextEditorRevealType.InCenter,
            )
            return
        }
    }
    // If no blank line found, jump to start of file
    const bof = new vscode.Position(0, 0)
    editor.selection = new vscode.Selection(bof, bof)
    editor.revealRange(new vscode.Range(bof, bof), vscode.TextEditorRevealType.InCenter)
}

export const selectToPreviousBlankLine = (editor: vscode.TextEditor) => {
    const doc = editor.document
    const current = editor.selection.active
    const anchor = editor.selection.isEmpty ? current : editor.selection.anchor
    let target: vscode.Position | undefined
    for (let i = current.line - 1; i >= 0; i--) {
        if (isBlankLine(doc.lineAt(i).text)) {
            target = new vscode.Position(i, 0)
            break
        }
    }
    if (!target) target = new vscode.Position(0, 0)
    editor.selection = new vscode.Selection(anchor, target)
    editor.revealRange(
        new vscode.Range(anchor, target),
        vscode.TextEditorRevealType.InCenter,
    )
}

export const selectToNextBlankLine = (editor: vscode.TextEditor) => {
    const doc = editor.document
    const current = editor.selection.active
    const anchor = editor.selection.isEmpty ? current : editor.selection.anchor
    let target: vscode.Position | undefined
    for (let i = current.line + 1; i < doc.lineCount; i++) {
        if (isBlankLine(doc.lineAt(i).text)) {
            target = new vscode.Position(i, 0)
            break
        }
    }
    if (!target) target = new vscode.Position(doc.lineCount - 1, 0)
    editor.selection = new vscode.Selection(anchor, target)
    editor.revealRange(
        new vscode.Range(anchor, target),
        vscode.TextEditorRevealType.InCenter,
    )
}
