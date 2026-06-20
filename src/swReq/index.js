// 2026 © Lightingale Community
// Licensed under GNU LGPL v3.0 license.
"use strict";

import {
	ShadedMapleServiceWorker
} from "../shadeSw/index.mjs";

const shadedMaple = new ShadedMapleServiceWorker();

// AIIFE
(async () => {

// Start of everything.

shadedMaple.type = 1;
shadedMaple.attachAll(self);
shadedMaple.setHandler("stream", (data, context) => {
	const generatedUrl = `${context.registration.scope}maple-stream/${crypto.getRandomValues(new Uint8Array(18)).toBase64({alphabet: "base64url"})}`;
	return generatedUrl;
});

console.debug(`Shaded Maple's Service Worker is now running!`);

})();
