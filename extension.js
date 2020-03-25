const vscode = require('vscode')
const vscodeExtTest = require('./app')

/**
 * @param {vscode.ExtensionContext} context Context
 */
async function activate(context) {
	context.subscriptions.push(vscode.commands.registerCommand('vscodeExtTest.testRequestWithIssue', () => vscodeExtTest.testRequest(false)))
	context.subscriptions.push(vscode.commands.registerCommand('vscodeExtTest.testRequestWithoutIssue', () => vscodeExtTest.testRequest(true)))
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}