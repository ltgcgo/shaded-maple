// 2026 © Lightingale Community
// Licensed under GNU LGPL v3.0 license.
"use strict";

/** @template T */
const ShadedMapleMessage = class ShadedMapleMessage {
	/** @type {String} */
	type;
	/** @type {T} */
	data;
};

const ShadedMapleTaskBase = class ShadedMapleTaskBase {
	/** @type {Number} */
	id = NaN;
	/** @type {String} */
	type;
	/** @type {any} */
	detail;
	/** @type {any} */
	result;
	/** @param {String} type
	* @param {Number} id
	*/
	constructor(type, id, detail) {
		this.type = type;
		this.id = id;
		this.detail = detail;
	};
};
const ShadedMapleTask = class ShadedMapleTask extends ShadedMapleTaskBase {
	/** @type {Number} */
	atCreation = 0;
	/** @type {Number} */
	atStart = 0;
	/** @type {Number} */
	atFinish = 0;
	/** @type {Number} */
	atResolution = 0;
	/** @type {(result: any, task: ShadedMapleTask) => {}: Promise<any>} */
	resolver;
	/** @param {ShadedMapleTaskBase} task
	*/
	constructor(task) {
		super(task.type, task.id, task.detail);
		this.atCreation = Date.now();
	};
};

export {
	ShadedMapleMessage,
	ShadedMapleTaskBase,
	ShadedMapleTask
};
