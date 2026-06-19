// 2026 © Lightingale Community
// Licensed under GNU LGPL v3.0 license.
"use strict";

import {
	ShadedMaple
} from "../shade/index.mjs";

// AIIFE
(async () => {

if (typeof self.require === "function") {
	throw(new Error("Environments supporting CommonJS are not supported."));
} else {
	try {
		const nodeTest = await import("node:process");
		const quitter = nodeTest.exit ?? nodeTest.default?.exit;
		if (quitter) {
			console.error(`Node.js and its compatibility layers are not supported.`);
			quitter(1);
		};
	} catch (_) {};
};

self.ShadedMaple = ShadedMaple;

ShadedMaple.debug = true;
await ShadedMaple.start("./sw.js");
console.debug(await ShadedMaple.streamUrl());

})();
