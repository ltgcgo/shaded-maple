// 2023-2024 © Lightingale Community
// Licensed under GNU LGPL 3.0

"use strict";

try {
	self
} catch (err) {
	this.self = this;
};
try {
	globalThis
} catch (err) {
	self.globalThis = self;
};

let MiniSignal = class extends EventTarget {
	static sleep(ms) {
		return new Promise((proceed) => {
			if (self.AbortSignal) {
				AbortSignal.timeout(ms).addEventListener("abort", proceed);
			} else {
				setTimeout(proceed, ms);
			};
		});
	};
	#promise;
	#promiseFulfill;
	#done = false;
	get finished() {
		return this.#done;
	};
	finish() {
		this.#done = true;
		if (this.#promiseFulfill) {
			this.#promiseFulfill();
		};
	};
	wait() {
		if (this.#done) {
			return;
		} else {
			return this.#promise;
		};
	};
	constructor() {
		super();
		this.#promise = new Promise((proceed) => {
			this.#promiseFulfill = () => {
				this.#done = true;
				proceed();
			};
		});
	};
};

export default MiniSignal;
