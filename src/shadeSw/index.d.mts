// 2026 © Lightingale Community
// Licensed under GNU LGPL v3.0 license.

/**
* @license LGPL-3.0-only
* @module cc.ltgc.shadedMaple.serviceWorker
*/

import type {
	ShadedMapleMessage
} from "../shade/index.d.mts";

export class ShadedMapleReceiverContext {
	worker: ServiceWorker;
	registration: ServiceWorkerRegistration;
	host: ShadedMapleServiceWorker;
}

/** The modular service worker handler.
*
* Please finish module setup before binding listeners.
*/
export class ShadedMapleServiceWorker {
	fetch(ev: FetchEvent): void;
	message(ev: MessageEvent): Promise<void>;
	messageerror(ev: ExtendableMessageEvent): Promise<void>;
	/** Attach all available handlers to the target Service Worker scope. */
	attachAll(scope: ServiceWorkerGlobalScope): void;
	/** Set a handler for a type of message. */
	setHandler(type: string, handler: (message: ShadedMapleMessage<any>, context: ShadedMapleReceiverContext) => void): void;
	/** Set a responder for a path prefix. */
	setResponder(pathPrefix: string, handler: (request: Request, context: ShadedMapleReceiverContext) => Response | Promise<Response>): void;
}
