const vscode = require('vscode')
const https = require('https')
const urlModule = require('url')

const constants = {
	"statusCodes": {
		"ok": 200
	},
	"methods": {
		"GET": "GET",
		"POST": "POST"
	},
	"headers": {
		"contentType": "content-type"
	},
	"contentTypes": {
		"applicationJson": "application/json; charset=utf-8"
	}
}

/**
 * @typedef {import('http').RequestOptions} RequestOptions
 */
/**
 * @typedef {import('http').IncomingMessage} IncomingMessage
 */
/**
 * @typedef {import('http').ClientRequest} ClientRequest
 */

/**
 * @typedef {Object} RequestResult
 * @property {ClientRequest} req Original request
 * @property {IncomingMessage} res Response from the server
 */

/**
 * @param {string} url https.request url
 * @param {RequestOptions} options https.request options.
 * @returns {Promise<RequestResult>} Resolves with the request and response object.
 */
function makeRequest(url, options) {
	return new Promise((resolve, reject) => {
		const req = https.request(url, options, (res) => {
			const chunks = []
			res.on('data', (chunk) => {
				chunks.push(chunk)
			})

			res.on('end', () => {
				if (res.statusCode !== constants.statusCodes.ok) {
					reject(new Error(`Error accessing URL ${url}. StatusCode: ${res.statusCode}`))
					return
				}
				res.body = Buffer.concat(chunks).toString()
				try {
					if (res.headers[constants.headers.contentType] === constants.contentTypes.applicationJson) {
						res.bodyParsed = JSON.parse(res.body)
					}
				} catch (e) {
					reject(new Error("Could not parse the response."))
					return
				}

				resolve({
					req,
					res
				})
			})
		})

		if (options.body) {
			req.write(options.body)
		}
		req.on('error', (e) => {
			reject(e)
		})
		req.end()
	})
}

/**
 * Execute a GET request to some URL. Prompt for a URL.
 */
async function testRequest() {
	const url = "https://www.google.com"
	const options = {
		method: constants.methods.GET
	}

	vscode.window.showInformationMessage(`Starting test`)
	try {
		await makeRequest(url, options)
		vscode.window.showInformationMessage(`Request succeeded: ${url}`)
	} catch (e) {
		console.error(e.message)
		console.trace(`Repro test`)
		vscode.window.showErrorMessage(`Error occurred: ${e.message}`)
	}
	return
}

module.exports = {
	testRequest
}
