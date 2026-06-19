// 2026 © Lightingale Community
// Licensed under GNU LGPL v3.0 license.
"use strict";

import {
	ShadedMapleMessage
} from "../shade/tasks.mjs";

export default class ShadedMapleServiceWorker {
	/** @param {MessagePort} port */
	async #attachReceiver(port) {};
	/** @param {ExtendableEvent} ev */
	async activate(ev) {};
	/** @param {FetchEvent} */
	async fetch(ev) {};
	/** @param {MessageEvent} ev */
	async message(ev) {};
	/** @param {ServiceWorkerGlobalScope} scope */
	async attachAll(scope) {

	};
};
