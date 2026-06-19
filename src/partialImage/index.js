// 2026 © Lightingale Community
// Licensed under GNU LGPL v3.0 license.
"use strict";

import ShadedMaple from "../shade/index.mjs";

// AIIFE
(async () => {

self.ShadedMaple = ShadedMaple;

ShadedMaple.debug = true;
await ShadedMaple.start("./hook/req/sw.js");
//ShadedMaple.streamUrl();

})();
