// 2026 © Lightingale Community
// Licensed under GNU LGPL v3.0 license.
"use strict";

import {
	ShadedMapleMessage
} from "../shade/tasks.mjs";
import ShadedMapleServiceWorker from "../shadeSw/index.mjs";

// AIIFE
(async () => {

// Start of everything.
/** @param {MessagePort} port */
const attachReceiver = async (port) => {
	port.addEventListener("message", async (ev) => {
		/** @type {ShadedMapleMessage} */
		const unparsedMessage = ev.data;
	});
	port.start();
};

addEventListener("message", async (ev) => {
	if (ev.data == null && ev.ports?.length > 0) {
		for (let port of ev.ports) {
			await attachReceiver(port);
		};
	};
});

addEventListener("fetch", async () => {});

console.debug(`Shaded Maple's Service Worker is now running.`);

})();
