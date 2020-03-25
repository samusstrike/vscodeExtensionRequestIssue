const vscode = require('vscode')
const vscodeExtTest = require('./app')

/**
 * @param {vscode.ExtensionContext} context Context
 */
async function activate(context) {
	context.subscriptions.push(vscode.commands.registerCommand('vscodeExtTest.testRequestTryRepro', vscodeExtTest.testRequest))
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}