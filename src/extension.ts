import * as vscode from 'vscode'
import {
    jumpToNextOccurrence,
    jumpToPreviousOccurrence,
    jumpToNextBlankLine,
    jumpToPreviousBlankLine,
} from './lib/sections'

export const activate = (context: vscode.ExtensionContext) => {
    const commands = [
        vscode.commands.registerCommand('pawel-jumper.move-up', () => {
            const editor = vscode.window.activeTextEditor
            if (!editor) return
            const sel = editor.selection
            const selectedText = editor.document.getText(sel).trim()
            if (selectedText.length > 0) jumpToPreviousOccurrence(editor, selectedText)
            else jumpToPreviousBlankLine(editor)
        }),
        vscode.commands.registerCommand('pawel-jumper.move-down', () => {
            const editor = vscode.window.activeTextEditor
            if (!editor) return
            const sel = editor.selection
            const selectedText = editor.document.getText(sel).trim()
            if (selectedText.length > 0) jumpToNextOccurrence(editor, selectedText)
            else jumpToNextBlankLine(editor)
        }),
    ]

    context.subscriptions.push(...commands)
}

export const deactivate = () => {}
