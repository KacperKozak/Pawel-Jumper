import * as vscode from 'vscode'
import {
    computeSectionAnchors,
    jumpToNextAnchor,
    jumpToPreviousAnchor,
} from './utils/sections'

export const activate = (context: vscode.ExtensionContext) => {
    const commands = [
        vscode.commands.registerCommand('pawel-jumper.move-up', () => {
            const editor = vscode.window.activeTextEditor
            if (!editor) return
            jumpToPreviousAnchor(editor)
        }),
        vscode.commands.registerCommand('pawel-jumper.move-down', () => {
            const editor = vscode.window.activeTextEditor
            if (!editor) return
            jumpToNextAnchor(editor)
        }),
        vscode.commands.registerCommand('pawel-jumper.selected-prev', () => {
            const editor = vscode.window.activeTextEditor
            if (!editor) return
            const anchors = computeSectionAnchors(editor.document)
            if (anchors.length === 0) return
            const currentLine = editor.selection.active.line
            let prev = anchors[anchors.length - 1]
            for (let i = anchors.length - 1; i >= 0; i--) {
                if (anchors[i].line < currentLine) {
                    prev = anchors[i]
                    break
                }
            }
            const start = new vscode.Position(prev.line, 0)
            const end = editor.selection.active
            editor.selection = new vscode.Selection(start, end)
            editor.revealRange(
                new vscode.Range(start, end),
                vscode.TextEditorRevealType.InCenter,
            )
        }),
        vscode.commands.registerCommand('pawel-jumper.selected-next', () => {
            const editor = vscode.window.activeTextEditor
            if (!editor) return
            const anchors = computeSectionAnchors(editor.document)
            if (anchors.length === 0) return
            const currentLine = editor.selection.active.line
            const next = anchors.find((a) => a.line > currentLine) ?? anchors[0]
            const start = editor.selection.anchor
            const end = new vscode.Position(next.line, 0)
            editor.selection = new vscode.Selection(start, end)
            editor.revealRange(
                new vscode.Range(start, end),
                vscode.TextEditorRevealType.InCenter,
            )
        }),
    ]

    context.subscriptions.push(...commands)
}

export const deactivate = () => {}
