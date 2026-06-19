// 2026 © Lightingale Community
// Licensed under GNU LGPL v3.0 license.

/** The modular service worker handler. */
export default class ShadedMapleServiceWorker {
	fetch(ev: FetchEvent): Promise<void>;
	message(ev: MessageEvent): Promise<void>;
	attachAll(scope: ServiceWorkerGlobalScope): Promise<void>;
}
