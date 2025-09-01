import * as vscode from 'vscode'
import { isBlankLine } from '../utils/string'
import {
    findOccurrencesInLines,
    findNextOccurrenceIndexAfterBase,
    findPreviousOccurrenceIndexBeforeBase,
    findNextStopLine,
    findPreviousStopLine,
} from './pure'

export const findOccurrences = (
    document: vscode.TextDocument,
    term: string,
): { line: number; character: number }[] => {
    const lines: string[] = []
    for (let i = 0; i < document.lineCount; i++) {
        lines.push(document.lineAt(i).text)
    }
    return findOccurrencesInLines(lines, term)
}

export const jumpToNextOccurrence = (editor: vscode.TextEditor, term: string) => {
    const occurrences = findOccurrences(editor.document, term)
    if (occurrences.length === 0) return

    const sel = editor.selection
    const base = sel.isEmpty ? sel.active : sel.end
    const idx = findNextOccurrenceIndexAfterBase(occurrences, base.line, base.character)
    if (idx < 0) return
    const target = occurrences[idx]
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
    const idx = findPreviousOccurrenceIndexBeforeBase(
        occurrences,
        base.line,
        base.character,
    )
    if (idx < 0) return
    const target = occurrences[idx]
    const start = new vscode.Position(target.line, target.character)
    const end = new vscode.Position(target.line, target.character + term.length)
    editor.selection = new vscode.Selection(start, end)
    editor.revealRange(new vscode.Range(start, end), vscode.TextEditorRevealType.InCenter)
}

export const jumpToNextBlankLine = (editor: vscode.TextEditor) => {
    const doc = editor.document
    const current = editor.selection.active
    const maxJumpDistance = vscode.workspace
        .getConfiguration('pawel-jumper')
        .get<number>('maxJumpDistance', 5)
    const lines: string[] = []
    for (let i = 0; i < doc.lineCount; i++) lines.push(doc.lineAt(i).text)
    const nextLine = findNextStopLine(lines, current.line, maxJumpDistance)
    const pos = new vscode.Position(nextLine, 0)
    editor.selection = new vscode.Selection(pos, pos)
    editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter)
}

export const jumpToPreviousBlankLine = (editor: vscode.TextEditor) => {
    const doc = editor.document
    const current = editor.selection.active
    const maxJumpDistance = vscode.workspace
        .getConfiguration('pawel-jumper')
        .get<number>('maxJumpDistance', 5)
    const lines: string[] = []
    for (let i = 0; i < doc.lineCount; i++) lines.push(doc.lineAt(i).text)
    const prevLine = findPreviousStopLine(lines, current.line, maxJumpDistance)
    const pos = new vscode.Position(prevLine, 0)
    editor.selection = new vscode.Selection(pos, pos)
    editor.revealRange(new vscode.Range(pos, pos), vscode.TextEditorRevealType.InCenter)
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
