import * as assert from 'assert'
import * as vscode from 'vscode'

suite('Extension Template', () => {
    test('activates', async () => {
        const ext = vscode.extensions.getExtension('code-cooking.pawel-jumper')
        assert.ok(ext, 'Extension not found')
        await ext.activate()
        assert.ok(ext.isActive, 'Extension should be active')
    })
})
