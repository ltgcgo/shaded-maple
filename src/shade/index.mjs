// 2026 © Lightingale Community
// Licensed under GNU LGPL v3.0 license.
"use strict";

import ShadedMapleConstants from "./const.mjs";
import {
	ShadedMapleMessage,
	ShadedMapleTaskBase,
	ShadedMapleTask
} from "./tasks.mjs";

const maxAllowedTaskId = 4294967295;
const maxLoopTries = 1024;

if (typeof self?.require !== "undefined") {
	throw(new Error("Environments supporting CommonJS are not supported."));
} else {
	delete self.process;
};

const ShadedMaple = class ShadedMaple extends ShadedMapleConstants {
	static debug = false;
	static type = this.TYPE_UNDETERMINED;
	/** @type {ServiceWorkerRegistration} */
	static #swRegEntry;
	/** @type {ServiceWorker} */
	static #swHandle;
	/** @type {MessagePort} */
	static #swPort;
	/** @type {Number} */
	static #swTaskNextId = 0;
	/** @type {Map<Number, ShadedMapleTask>} */
	static #swTaskPool = new Map();
	/** @param {String} type
	* @param {Function} resolver
	*/
	static #swTaskCreate(type, detail, resolver) {
		const upThis = this;
		if (upThis.type === upThis.TYPE_UNDETERMINED) {
			throw(new Error(`Service Worker is not ready for scheduling.`));
		};
		let loopGuard = 0;
		let newTaskId;
		do {
			newTaskId = upThis.#swTaskNextId ++;
			if (upThis.#swTaskNextId > maxAllowedTaskId) {
				upThis.#swTaskNextId = 0;
			};
			loopGuard ++;
		} while (loopGuard < maxLoopTries && upThis.#swTaskPool.has(newTaskId));
		if (loopGuard === maxLoopTries) {
			throw(new Error(`Cannot schedule tasks due to a crowded pool.`));
		};
		const newTaskMsg = new ShadedMapleMessage(type, newTaskId, detail);
		const newTask = new ShadedMapleTask(newTaskMsg);
		newTask.resolver = resolver;
		upThis.#swTaskPool.set(newTaskId, newTask);
		if (upThis.debug) {
			console.debug(`Task ${newTaskId} created at ${newTask.atCreation}.`);
		};
		upThis.#swPort.postMessage(newTaskMsg);
	};
	static async #swInit() {
		const upThis = this;
		const ports = new MessageChannel();
		let initComplete;
		const deferrer = new Promise((resolve) => {
			initComplete = resolve;
		});
		upThis.#swPort = ports.port1;
		upThis.#swPort.addEventListener("message", async ({data}) => {
			/** @type Number */
			const type = data[0];
			let unhandled = false;
			switch (type) {
				case 0: {
					// Initialisation complete.
					upThis.type = data[1].type;
					initComplete();
					break;
				};
				case 1: {
					// Task run begins.
					/** @type {ShadedMapleMessage} */
					const content = data[1];
					if (upThis.#swTaskPool.has(content.id)) {
						const task = upThis.#swTaskPool.get(content.id);
						task.atStart = Date.now();
						if (upThis.debug) {
							console.debug(`Task #${task.id} began execution after ${task.atStart - task.atCreation} ms.`);
						};
					} else {
						console.warn(`Task #${content.id} does not exist.`);
					};
					break;
				};
				case 2: {
					// Task run fails.
					/** @type {ShadedMapleMessage} */
					const content = data[1];
					if (upThis.#swTaskPool.has(content.id)) {
						const task = upThis.#swTaskPool.get(content.id);
						if (upThis.debug) {
							console.debug(`Task #${task.id} failed after ${Date.now() - (task.atStart || task.atCreation)} ms.`);
						};
						upThis.#swTaskPool.delete(content.id);
					} else {
						console.warn(`Task #${content.id} does not exist.`);
					};
					break;
				};
				case 3: {
					// Task run ends.
					/** @type {ShadedMapleMessage} */
					const content = data[1];
					if (upThis.#swTaskPool.has(content.id)) {
						const task = upThis.#swTaskPool.get(content.id);
						task.atFinish = Date.now();
						if (upThis.debug) {
							console.debug(`Task #${task.id} took ${task.atFinish - task.atStart} ms to finish.`);
						};
						task.result = content.result;
						try {
							await task.resolver.call(upThis, content.result, task);
						} catch (err) {
							console.error(`Task #${task.id} failed its resolution.\n`, err);
						};
						task.atResolution = Date.now();
						if (upThis.debug) {
							console.debug(`Task #${task.id} took ${task.atResolution - task.atFinish} ms to resolve.`);
						};
						upThis.#swTaskPool.delete(content.id);
					} else {
						console.warn(`Task #${content.id} does not exist.`);
					};
					break;
				};
				default: {
					unhandled = true;
				};
			};
			if (unhandled) {
				console.debug(`Message type ${type} is not handled.\n`, data[1]);
			};
		});
		upThis.#swPort.start();
		upThis.#swHandle.postMessage(null, [ports.port2]);
		await deferrer;
		console.debug(`Shaded Maple type ${upThis.type} has started successfully.`);
	};
	/** @param {String} swUrl */
	static async start(swUrl) {
		if (!self.navigator?.serviceWorker) {
			throw(new TypeError(`Service Workers cannot be registered in an unsupported environment.`));
		};
		if (typeof swUrl !== "string") {
			throw(new TypeError(`Service Worker URL must be a string.`));
		};
		const upThis = this;
		upThis.#swRegEntry = await navigator.serviceWorker.register(swUrl);
		upThis.#swHandle = upThis.#swRegEntry.installing ?? upThis.#swRegEntry.waiting ?? upThis.#swRegEntry.active;
		if (!upThis.#swHandle) {
			throw(new Error(`Service Worker registration failed on activation.`));
		};
		console.debug(`Shaded Maple is starting...`);
		if (upThis.#swHandle.state === "activated") {
			return await upThis.#swInit();
		} else {
			const resolveSignal = new Promise((resolve, reject) => {
				upThis.#swHandle.onstatechange = function () {
					switch (this.state) {
						case "activated": {
							upThis.#swInit().then(resolve).catch(reject);
							upThis.#swHandle.onstatechange = null;
							break;
						};
						case "redundant": {
							upThis.#swHandle.onstatechange = null;
							//upThis.#swRegEntry.update();
							reject(new Error(`Service Worker refused to activate.`));
							break;
						};
					};
				};
			});
			return await resolveSignal;
		};
	};
	static streamUrl(source) {
		const upThis = this;
		return new Promise((resolve) => {
			upThis.#swTaskCreate("stream", source, (data, task) => {
				resolve(data);
			});
		});
	};
}

export {
	ShadedMapleMessage,
	ShadedMaple
};
