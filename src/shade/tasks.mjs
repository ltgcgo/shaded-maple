// 2026 © Lightingale Community
// Licensed under GNU LGPL v3.0 license.
"use strict";

const ShadedMapleMovableError = class ShadedMapleMovableError {
	/** @type {String} */
	name;
	/** @type {String} */
	message;
	/** @type {String} */
	stack;
	/** @param {Error} err */
	constructor(err) {
		this.name = err.name;
		this.message = err.message;
		this.stack = err.stack;
	};
};

/** @template T, U */
const ShadedMapleMessage = class ShadedMapleMessage {
	/** @type {String} */
	type;
	/** @type {Number} */
	id;
	/** @type {T} */
	data;
	/** @type {ShadedMapleMovableError} */
	error;
	/** @type {U} */
	result;
	/** @param {String} type
	* @param {Number} id
	* @param {T} data
	*/
	constructor(type, id, data) {
		this.type = type;
		this.id = id;
		this.data = data;
	};
};

const ShadedMapleTask = class ShadedMapleTask extends ShadedMapleMessage {
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
	/** @param {ShadedMapleMessage} task
	*/
	constructor(task) {
		super(task.type, task.id);
		this.atCreation = Date.now();
	};
};

export {
	ShadedMapleMovableError,
	ShadedMapleMessage,
	ShadedMapleTask
};
