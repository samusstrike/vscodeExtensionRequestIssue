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
function makeRequest(url, options, testPassUrlInOptions) {
	return new Promise((resolve, reject) => {
		let req
		if (testPassUrlInOptions) {
			//Does not reproduce the issue
			options = addUrlToOptions(url, options)
			req = https.request(options, handleRequest)
		} else {
			//Issue can occur with url as first parameter
			req = https.request(url, options, handleRequest)
		}

		if (options.body) {
			req.write(options.body)
		}
		req.on('error', (e) => {
			reject(e)
		})
		req.end()

		function handleRequest(res) {
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

				resolve(res)
			})
		}
	})
}

/**
 * @param {string} url https.request url
 * @param {RequestOptions} [options] https.request options. If not provided a new object is created. If provided, the options object will be modified.
 * @returns {RequestOptions} Options with URL parts added.
 */
function addUrlToOptions(url, options) {
	options = Object.assign({}, options)
	var parsedUrl = urlModule.parse(url)
	options.protocol = parsedUrl.protocol
	options.host = parsedUrl.host
	options.path = parsedUrl.path

	return options
}

/**
 * Execute a GET request to some URL. Prompt for a URL.
 */
async function testRequest(testPassUrlInOptions) {
	const url = "https://www.google.com"
	const options = {
		method: constants.methods.GET
	}

	vscode.window.showInformationMessage(`Starting test`)
	try {
		await makeRequest(url, options, testPassUrlInOptions)
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
