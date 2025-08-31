import * as assert from 'assert'
import * as vscode from 'vscode'

suite('Pawel Jumper Integration', () => {
    const openWithContent = async (lines: string[]) => {
        const doc = await vscode.workspace.openTextDocument({
            language: 'plaintext',
            content: lines.join('\n'),
        })
        const editor = await vscode.window.showTextDocument(doc)
        return editor
    }

    test('activates', async () => {
        const ext = vscode.extensions.getExtension('code-cooking.pawel-jumper')
        assert.ok(ext, 'Extension not found')
        await ext.activate()
        assert.ok(ext.isActive, 'Extension should be active')
    })

    test('blank line hop up/down navigates between blank lines', async () => {
        const editor = await openWithContent([
            'alpha',
            '',
            'beta alpha',
            '',
            'gamma',
            'alpha',
        ])
        editor.selection = new vscode.Selection(
            new vscode.Position(0, 0),
            new vscode.Position(0, 0),
        )
        await vscode.commands.executeCommand('pawel-jumper.hop-down')
        assert.strictEqual(editor.selection.active.line, 1)
        assert.strictEqual(editor.selection.active.character, 0)

        await vscode.commands.executeCommand('pawel-jumper.hop-down')
        assert.strictEqual(editor.selection.active.line, 3)
        assert.strictEqual(editor.selection.active.character, 0)

        await vscode.commands.executeCommand('pawel-jumper.hop-up')
        assert.strictEqual(editor.selection.active.line, 1)
        assert.strictEqual(editor.selection.active.character, 0)

        await vscode.commands.executeCommand('workbench.action.closeAllEditors')
    })

    test('occurrence hop down/up selects next/previous matches without wrapping', async () => {
        const editor = await openWithContent([
            'alpha',
            '',
            'beta alpha',
            '',
            'gamma',
            'alpha',
        ])
        // select the first "alpha" at (0,0)-(0,5)
        const start = new vscode.Position(0, 0)
        const end = new vscode.Position(0, 5)
        editor.selection = new vscode.Selection(start, end)

        await vscode.commands.executeCommand('pawel-jumper.hop-down')
        assert.strictEqual(editor.selection.start.line, 2)
        assert.strictEqual(editor.selection.start.character, 5)
        assert.strictEqual(editor.selection.end.line, 2)
        assert.strictEqual(editor.selection.end.character, 10)

        await vscode.commands.executeCommand('pawel-jumper.hop-down')
        assert.strictEqual(editor.selection.start.line, 5)
        assert.strictEqual(editor.selection.start.character, 0)
        assert.strictEqual(editor.selection.end.line, 5)
        assert.strictEqual(editor.selection.end.character, 5)

        // at last occurrence, hop-down should not wrap and should keep selection
        await vscode.commands.executeCommand('pawel-jumper.hop-down')
        assert.strictEqual(editor.selection.start.line, 5)
        assert.strictEqual(editor.selection.start.character, 0)
        assert.strictEqual(editor.selection.end.line, 5)
        assert.strictEqual(editor.selection.end.character, 5)

        // now hop-up should go to previous occurrence at (2,5)
        await vscode.commands.executeCommand('pawel-jumper.hop-up')
        assert.strictEqual(editor.selection.start.line, 2)
        assert.strictEqual(editor.selection.start.character, 5)
        assert.strictEqual(editor.selection.end.line, 2)
        assert.strictEqual(editor.selection.end.character, 10)

        await vscode.commands.executeCommand('workbench.action.closeAllEditors')
    })

    test('select up/down expands selection to nearest blank line', async () => {
        const editor = await openWithContent(['a', '', 'b', '', 'c'])
        const anchor = new vscode.Position(0, 0)
        editor.selection = new vscode.Selection(anchor, anchor)

        await vscode.commands.executeCommand('pawel-jumper.select-down')
        // anchor stays at (0,0), active becomes next blank line (1,0)
        assert.strictEqual(editor.selection.anchor.line, 0)
        assert.strictEqual(editor.selection.anchor.character, 0)
        assert.strictEqual(editor.selection.active.line, 1)
        assert.strictEqual(editor.selection.active.character, 0)

        await vscode.commands.executeCommand('pawel-jumper.select-up')
        // active becomes previous blank line or BOF (here stays 0 due to previous blank line not existing)
        assert.strictEqual(editor.selection.anchor.line, 0)
        assert.strictEqual(editor.selection.active.line, 0)

        await vscode.commands.executeCommand('workbench.action.closeAllEditors')
    })
})
