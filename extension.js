const vscode = require('vscode')
const vscodeExtTest = require('./app')

/**
 * @param {vscode.ExtensionContext} context Context
 */
async function activate(context) {
	context.subscriptions.push(vscode.commands.registerCommand('vscodeExtTest.getUrlTryRepro', () => { vscodeExtTest.getUrl(true) }))
	context.subscriptions.push(vscode.commands.registerCommand('vscodeExtTest.getUrlNoRepro', () => { vscodeExtTest.getUrl(false) }))
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}