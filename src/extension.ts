import * as vscode from 'vscode'
import {
    jumpToNextOccurrence,
    jumpToPreviousOccurrence,
    jumpToNextBlankLine,
    jumpToPreviousBlankLine,
    selectToPreviousBlankLine,
    selectToNextBlankLine,
} from './lib/sections'

export const activate = (context: vscode.ExtensionContext) => {
    const commands = [
        vscode.commands.registerCommand('pawel-jumper.hop-up', () => {
            const editor = vscode.window.activeTextEditor
            if (!editor) return
            const sel = editor.selection
            const selectedText = editor.document.getText(sel).trim()
            if (selectedText.length > 0) jumpToPreviousOccurrence(editor, selectedText)
            else jumpToPreviousBlankLine(editor)
        }),
        vscode.commands.registerCommand('pawel-jumper.hop-down', () => {
            const editor = vscode.window.activeTextEditor
            if (!editor) return
            const sel = editor.selection
            const selectedText = editor.document.getText(sel).trim()
            if (selectedText.length > 0) jumpToNextOccurrence(editor, selectedText)
            else jumpToNextBlankLine(editor)
        }),
        vscode.commands.registerCommand('pawel-jumper.select-up', () => {
            const editor = vscode.window.activeTextEditor
            if (!editor) return
            selectToPreviousBlankLine(editor)
        }),
        vscode.commands.registerCommand('pawel-jumper.select-down', () => {
            const editor = vscode.window.activeTextEditor
            if (!editor) return
            selectToNextBlankLine(editor)
        }),
    ]

    context.subscriptions.push(...commands)
}

export const deactivate = () => {}
