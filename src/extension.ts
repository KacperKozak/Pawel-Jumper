import * as vscode from 'vscode'

export const activate = (context: vscode.ExtensionContext) => {
    const commands = [
        vscode.commands.registerCommand('pawel-jumper.move-up', () => {
            vscode.window.showInformationMessage('Pawel Jumper: move up (placeholder)')
        }),
        vscode.commands.registerCommand('pawel-jumper.move-down', () => {
            vscode.window.showInformationMessage('Pawel Jumper: move down (placeholder)')
        }),
        vscode.commands.registerCommand('pawel-jumper.selected-prev', () => {
            vscode.window.showInformationMessage(
                'Pawel Jumper: select previous (placeholder)',
            )
        }),
        vscode.commands.registerCommand('pawel-jumper.selected-next', () => {
            vscode.window.showInformationMessage(
                'Pawel Jumper: select next (placeholder)',
            )
        }),
    ]

    context.subscriptions.push(...commands)
}

export const deactivate = () => {}
