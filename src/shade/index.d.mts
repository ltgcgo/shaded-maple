// 2026 © Lightingale Community
// Licensed under GNU LGPL v3.0 license.

/**
* @license LGPL-3.0-only
* @module cc.ltgc.shadedMaple
*/

export class ShadedMapleMovableError {
	name: string;
	message?: string;
	stack?: string;
	constructor(err: Error);
}

export class ShadedMapleMessage<T, U> {
	type: string;
	id: number;
	data?: T;
	error?: ShadedMapleMovableError;
	result?: U;
}

/** The main Shaded Maple API. */
export class ShadedMaple {
	static readonly TYPE_UNDETERMINED: number;
	static readonly TYPE_SLIM: number;
	static readonly TYPE_FULL: number;
	/** Extended debug messages will be emitted when true. */
	static debug: boolean;
	/** The current type of the service worker. */
	static readonly type: number;
	/** Start the actual Shaded Maple services.
	* @param swUrl The path of the service worker, either the `req` or the `cdn` variant.
	*/
	static start(swUrl: string): Promise<void>;
	/** Obtain an ephemeral URL for a `ReadableStream` to serve. */
	static streamUrl(source: ReadableStream, headers?: Headers): Promise<string>;
	static streamUrl(blob: File | Blob): Promise<string>;
}
