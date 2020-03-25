const vscode = require('vscode')
const vscodeExtTest = require('./app')

/**
 * @param {vscode.ExtensionContext} context Context
 */
async function activate(context) {
	context.subscriptions.push(vscode.commands.registerCommand('vscodeExtTest.testRequestTryRepro', async () => { await vscodeExtTest.testRequest(true) }))
	context.subscriptions.push(vscode.commands.registerCommand('vscodeExtTest.testRequestNoRepro', async () => { await vscodeExtTest.testRequest(false) }))
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}