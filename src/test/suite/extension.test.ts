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
        await vscode.workspace
            .getConfiguration('pawel-jumper')
            .update('maxJumpDistance', 5, vscode.ConfigurationTarget.Global)
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
        await vscode.workspace
            .getConfiguration('pawel-jumper')
            .update('maxJumpDistance', 5, vscode.ConfigurationTarget.Global)
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
        await vscode.workspace
            .getConfiguration('pawel-jumper')
            .update('maxJumpDistance', 5, vscode.ConfigurationTarget.Global)
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

    test('max jump distance splits large blocks into internal stops', async () => {
        const lines = ['']
            .concat(Array.from({ length: 16 }, (_, i) => `l${i + 1}`))
            .concat([''])
        const editor = await openWithContent(lines)
        await vscode.workspace
            .getConfiguration('pawel-jumper')
            .update('maxJumpDistance', 5, vscode.ConfigurationTarget.Global)
        // start inside the block at line 1
        editor.selection = new vscode.Selection(
            new vscode.Position(1, 0),
            new vscode.Position(1, 0),
        )
        await vscode.commands.executeCommand('pawel-jumper.hop-down')
        // expect roughly first internal stop around 5-6
        assert.ok(editor.selection.active.line >= 5 && editor.selection.active.line <= 6)

        await vscode.commands.executeCommand('pawel-jumper.hop-down')
        // expect second internal stop around 10-11
        assert.ok(
            editor.selection.active.line >= 10 && editor.selection.active.line <= 11,
        )

        await vscode.commands.executeCommand('pawel-jumper.hop-down')
        // finally to trailing blank line at end
        assert.strictEqual(editor.selection.active.line, lines.length - 1)

        await vscode.commands.executeCommand('workbench.action.closeAllEditors')
    })

    test('11-line block centers first then exits, and hop-up goes back', async () => {
        const lines = ['']
            .concat(Array.from({ length: 11 }, (_, i) => `l${i + 1}`))
            .concat([''])
        const editor = await openWithContent(lines)
        await vscode.workspace
            .getConfiguration('pawel-jumper')
            .update('maxJumpDistance', 5, vscode.ConfigurationTarget.Global)
        editor.selection = new vscode.Selection(
            new vscode.Position(1, 0),
            new vscode.Position(1, 0),
        )
        // First hop-down should land roughly at the center (around lines 5-7)
        await vscode.commands.executeCommand('pawel-jumper.hop-down')
        assert.ok(editor.selection.active.line == 6)

        // Next hop-down should go to the trailing blank line
        await vscode.commands.executeCommand('pawel-jumper.hop-down')
        assert.strictEqual(editor.selection.active.line, lines.length - 1)

        // Hop-up should return to the centered internal stop (line 6)
        await vscode.commands.executeCommand('pawel-jumper.hop-up')
        assert.strictEqual(editor.selection.active.line, 6)

        // Hop-up again should land on the leading blank (line 0)
        await vscode.commands.executeCommand('pawel-jumper.hop-up')
        assert.strictEqual(editor.selection.active.line, 0)

        await vscode.commands.executeCommand('workbench.action.closeAllEditors')
    })

    test('upward flow on 11-line block: end -> center -> start', async () => {
        const lines = ['']
            .concat(Array.from({ length: 11 }, (_, i) => `l${i + 1}`))
            .concat([''])
        const editor = await openWithContent(lines)
        await vscode.workspace
            .getConfiguration('pawel-jumper')
            .update('maxJumpDistance', 5, vscode.ConfigurationTarget.Global)

        // place cursor at last content line
        editor.selection = new vscode.Selection(
            new vscode.Position(lines.length - 2, 0),
            new vscode.Position(lines.length - 2, 0),
        )

        await vscode.commands.executeCommand('pawel-jumper.hop-up')
        assert.ok(editor.selection.active.line == 6)

        await vscode.commands.executeCommand('pawel-jumper.hop-up')
        assert.strictEqual(editor.selection.active.line, 0)

        await vscode.commands.executeCommand('workbench.action.closeAllEditors')
    })

    test('10-line block without edge blanks: down goes center then end', async () => {
        const lines = Array.from({ length: 10 }, (_, i) => `${i + 1}`)
        const editor = await openWithContent(lines)
        await vscode.workspace
            .getConfiguration('pawel-jumper')
            .update('maxJumpDistance', 5, vscode.ConfigurationTarget.Global)

        editor.selection = new vscode.Selection(
            new vscode.Position(0, 0),
            new vscode.Position(0, 0),
        )
        await vscode.commands.executeCommand('pawel-jumper.hop-down')
        assert.strictEqual(editor.selection.active.line, 4)

        await vscode.commands.executeCommand('pawel-jumper.hop-down')
        assert.strictEqual(editor.selection.active.line, lines.length - 1)

        await vscode.commands.executeCommand('workbench.action.closeAllEditors')
    })

    test('10-line block without edge blanks: up goes center then start', async () => {
        const lines = Array.from({ length: 10 }, (_, i) => `${i + 1}`)
        const editor = await openWithContent(lines)
        await vscode.workspace
            .getConfiguration('pawel-jumper')
            .update('maxJumpDistance', 5, vscode.ConfigurationTarget.Global)

        editor.selection = new vscode.Selection(
            new vscode.Position(lines.length - 1, 0),
            new vscode.Position(lines.length - 1, 0),
        )

        await vscode.commands.executeCommand('pawel-jumper.hop-up')
        assert.strictEqual(editor.selection.active.line, 4)

        await vscode.commands.executeCommand('pawel-jumper.hop-up')
        assert.strictEqual(editor.selection.active.line, 0)

        await vscode.commands.executeCommand('workbench.action.closeAllEditors')
    })

    test('10-line with leading blank: down goes center then trailing blank', async () => {
        const lines = [''].concat(Array.from({ length: 10 }, (_, i) => `${i + 1}`))
        const editor = await openWithContent(lines)
        await vscode.workspace
            .getConfiguration('pawel-jumper')
            .update('maxJumpDistance', 5, vscode.ConfigurationTarget.Global)

        editor.selection = new vscode.Selection(
            new vscode.Position(0, 0),
            new vscode.Position(0, 0),
        )
        await vscode.commands.executeCommand('pawel-jumper.hop-down')
        assert.strictEqual(editor.selection.active.line, 5)

        await vscode.commands.executeCommand('pawel-jumper.hop-down')
        assert.strictEqual(editor.selection.active.line, lines.length - 1)

        await vscode.commands.executeCommand('workbench.action.closeAllEditors')
    })

    test('10-line with trailing blank: down goes center then trailing blank', async () => {
        const lines = Array.from({ length: 10 }, (_, i) => `${i + 1}`).concat([''])
        const editor = await openWithContent(lines)
        await vscode.workspace
            .getConfiguration('pawel-jumper')
            .update('maxJumpDistance', 5, vscode.ConfigurationTarget.Global)

        editor.selection = new vscode.Selection(
            new vscode.Position(0, 0),
            new vscode.Position(0, 0),
        )
        await vscode.commands.executeCommand('pawel-jumper.hop-down')
        assert.strictEqual(editor.selection.active.line, 4)

        await vscode.commands.executeCommand('pawel-jumper.hop-down')
        assert.strictEqual(editor.selection.active.line, lines.length - 1)

        await vscode.commands.executeCommand('workbench.action.closeAllEditors')
    })

    test('10-line with both edge blanks and filler: from between filler and block -> center -> trailing blank', async () => {
        const lines = ['x', '']
            .concat(Array.from({ length: 10 }, (_, i) => `${i + 1}`))
            .concat(['', 'y'])
        const editor = await openWithContent(lines)
        await vscode.workspace
            .getConfiguration('pawel-jumper')
            .update('maxJumpDistance', 5, vscode.ConfigurationTarget.Global)

        // Start at the space between x and block (line 1)
        editor.selection = new vscode.Selection(
            new vscode.Position(1, 0),
            new vscode.Position(1, 0),
        )
        await vscode.commands.executeCommand('pawel-jumper.hop-down')
        assert.strictEqual(editor.selection.active.line, 6)

        await vscode.commands.executeCommand('pawel-jumper.hop-down')
        assert.strictEqual(editor.selection.active.line, lines.length - 2)

        await vscode.commands.executeCommand('workbench.action.closeAllEditors')
    })
})
