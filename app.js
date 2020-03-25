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
function makeRequestTryRepro(url, options) {
	options = Object.assign({}, options)
	options.method = options.method ? options.method : options.body ? constants.methods.POST : constants.methods.GET

	return new Promise((resolve, reject) => {
		const req = https.request(url, options, (res) => {
			const chunks = []
			res.on('data', (chunk) => {
				chunks.push(chunk)
			})
			res.on('end', () => {
				//Other 20* error codes should be handled.
				if (res.statusCode !== constants.statusCodes.ok) {
					reject(new Error(`Error accessing URL ${url}. StatusCode: ${res.statusCode}`))
					return
				}
				res.body = Buffer.concat(chunks).toString()
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
 * @param {string} url https.request url
 * @param {RequestOptions} options https.request options.
 * @returns {Promise<RequestResult>} Resolves with the request and response object.
 */
function makeRequestNoRepro(url, options) {
	options = addUrlToOptions(url, options)
	options.method = options.method ? options.method : options.body ? constants.methods.POST : constants.methods.GET

	return new Promise((resolve, reject) => {
		const req = https.request(options, (res) => {
			const chunks = []
			res.on('data', (chunk) => {
				chunks.push(chunk)
			})
			res.on('end', () => {
				//Other 20* error codes should be handled.
				if (res.statusCode !== constants.statusCodes.ok) {
					reject(new Error(`Error accessing URL ${url}. StatusCode: ${res.statusCode}`))
					return
				}
				res.body = Buffer.concat(chunks).toString()
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
 * @param {boolean} tryRepro If true, the code with the erroneous behavior will be used, else the non-erroneous behavior code will be run.
 */
async function testRequest(tryRepro) {
	// const { url, requestCount } = await getInput()
	// if (url === undefined) {
	// 	return
	// }

	const requestCount = 200
	const url = "https://mpclkmndev02.huronclick.com/irb/sd/PublicCustomLayouts/request"
	const options = {
		headers: {}
	}

	//Test case: Make a request. It seems multiple have to be made to trigger the issue.
	vscode.window.showInformationMessage(`Repro test? ${tryRepro}, Making requests: count: ${requestCount}`)
	const requests = []
	for (var i = 0; i < requestCount; i++) {
		if (tryRepro) {
			requests.push(makeRequestTryRepro(url, options))
		} else {
			requests.push(makeRequestNoRepro(url, options))
		}
	}
	Promise.all(requests)
		.then(() => {
			vscode.window.showInformationMessage(`Repro test? ${tryRepro}, Request succeeded: ${url}`)
		})
		.catch(e => {
			console.error(e.message)
			console.trace(`Repro test? ${tryRepro}`)
			vscode.window.showErrorMessage(`Error occurred: ${e.message}`)
		})

	async function getInput() {
		const url = await vscode.window.showInputBox({
			prompt: "Provide a URL to GET.",
			value: "https://www.google.com"
		})
		if (url === undefined) {
			return {}
		}
		let requestCount
		do {
			requestCount = await vscode.window.showInputBox({
				prompt: "How many requests to make?",
				value: "10"
			})
			if (requestCount === undefined) {
				return {}
			}
			if (isNaN(parseInt(requestCount))) {
				vscode.window.showWarningMessage("Request count must be a number.")
			}
		} while (isNaN(parseInt(requestCount)))

		return { url, requestCount }
	}
}



module.exports = {
	testRequest
}
