// 2026 © Lightingale Community
// Licensed under GNU LGPL v3.0 license.
"use strict";

import {
	ShadedMapleMessage
} from "../shade/index.mjs";

if (typeof self?.require !== "undefined") {
	throw(new Error("Environments supporting CommonJS are not supported."));
} else {
	delete self.process;
};

const ShadedMapleReceiverContext = class ShadedMapleReceiverContext {};

const ShadedMapleServiceWorker = class ShadedMapleServiceWorker {
	type = 0;
	/** @type {Map<String,Function>} */
	#handlers = new Map();
	/** @type {Map<String,Function>} */
	#responders = new Map();
	/** @param {MessagePort} port */
	async #attachReceiver(port) {
		const upThis = this;
		port.addEventListener("message", async (ev) => {
			/** @type {ShadedMapleMessage<any, any>} */
			const msg = ev.data;
			const respMsg = {
				type: msg.type,
				id: msg.id,
				result: null,
				error: null
			};
			//const msgId = msg.id;
			if (upThis.#handlers.has(msg.type)) {
				port.postMessage([1, respMsg]);
				let result;
				try {
					result = await upThis.#handlers.get(msg.type).call(upThis, msg.data);
				} catch (err) {
					respMsg.error = err;
					port.postMessage([2, respMsg], [respMsg.error]);
					return;
				};
				if (!msg.error) {
					respMsg.result = result;
					port.postMessage([3, respMsg], [respMsg.result]);
				};
			} else {
				console.info(`Message type "${msg.type}" is not handled.\n`, msg.data);
				port.postMessage([2, respMsg]);
			};
		});
		port.start();
		port.postMessage([0, {
			type: upThis.type
		}]);
	};
	async activate() {
		console.info(`Service Worker is activated.`);
		clients.claim();
	};
	/** @param {FetchEvent} ev */
	fetch(ev) {
		ev.waitUntil((async () => {
			const upThis = this;
			const req = ev.request;
			const url = new URL(req.url);
			const cleanPath = `${url.protocol}//${url.host}${url.pathname}${url.search}`;
			let unhandled = true;
			if (cleanPath.indexOf(self.registration.scope) === 0) {
				const relativePath = cleanPath.replace(self.registration.scope, "./");
				let matchPath = relativePath;
				while (matchPath.length >= 2) {
					matchPath = matchPath.slice(0, matchPath.lastIndexOf("/"));
					//console.debug(matchPath);
					if (this.#responders.has(matchPath)) {
						console.debug(`${req.method} ${cleanPath} (${matchPath})`);
						const resp = await upThis.#responders.get(matchPath)(req, {
							worker: self,
							host: upThis
						});
						if (resp instanceof Response) {
							unhandled = false;
							ev.respondWith(resp);
						};
						break;
					};
				};
			};
			if (unhandled) {
				console.debug(`${req.method} ${cleanPath}`);
				ev.respondWith(fetch(req));
			};
		})());
	};
	async install() {
		console.info(`Service Worker is downloaded.`);
		await self.skipWaiting();
		console.info(`Service Worker is installed.`);
	};
	/** @param {ExtendableMessageEvent} ev */
	async message(ev) {
		if (ev.data == null && ev.ports?.length > 0) {
			for (let port of ev.ports) {
				await this.#attachReceiver(port);
			};
		} else {
			console.debug("Unknown message.");
		};
	};
	/** @param {ExtendableMessageEvent} ev */
	async messageerror(ev) {
		console.warn(`Message cannot be deserialised.\n`, ev.data);
	};
	/** @param {ServiceWorkerGlobalScope} scope */
	attachAll(scope) {
		const upThis = this;
		scope.addEventListener("activate", upThis.activate.bind(upThis));
		scope.addEventListener("fetch", upThis.fetch.bind(upThis));
		scope.addEventListener("install", upThis.install.bind(upThis));
		scope.addEventListener("message", upThis.message.bind(upThis));
		scope.addEventListener("messageerror", upThis.messageerror.bind(upThis));
	};
	/** @param {String} type
	* @param {(message: ShadedMapleMessage<any>, context: {worker: ServiceWorkerGlobalScope, host: ShadedMapleServiceWorker}) => void} handler
	*/
	setHandler(type, handler) {
		this.#handlers.set(type, handler);
	};
	/** @param {String} pathPrefix
	* @param {(request: Request, context: {worker: ServiceWorkerGlobalScope, host: ShadedMapleServiceWorker}) => Response | Promise<Response>} handler
	*/
	setResponder(pathPrefix, handler) {
		if (pathPrefix.slice(0, 2) !== "./") {
			throw(new SyntaxError("Must be a relative path from the worker root scope."));
		};
		if (pathPrefix[pathPrefix.length - 1] === "/") {
			pathPrefix = pathPrefix.slice(0, pathPrefix.length - 1);
		} else {
			throw(new SyntaxError("Must be a root of a path (ends with a slash)."));
		};
		this.#responders.set(pathPrefix, handler);
	};
	constructor() {};
};

export {
	ShadedMapleReceiverContext,
	ShadedMapleServiceWorker
};
