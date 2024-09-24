
//#region main.ts
function warn(msg) {
	{
		console.log("works");
	}
}
let activeEffectScope;
class EffectScope {
	_active = true;
	effects = [];
	cleanups = [];
	_isPaused = false;
	parent;
	scopes;
	index;
	constructor(detached = false) {
		this.detached = detached;
		{
			console.log("works");
		}
		this.parent = activeEffectScope;
		if (!detached && activeEffectScope) {
			this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(this) - 1;
		}
	}
	get active() {
		return this._active;
	}
	pause() {
		{
			console.log("works");
		}
		if (this._active) {
			this._isPaused = true;
			let i, l;
			if (this.scopes) {
				for (i = 0, l = this.scopes.length; i < l; i++) {
					this.scopes[i].pause();
				}
			}
			for (i = 0, l = this.effects.length; i < l; i++) {
				this.effects[i].pause();
			}
		}
	}
	resume() {
		{
			console.log("works");
		}
		if (this._active) {
			if (this._isPaused) {
				this._isPaused = false;
				let i, l;
				if (this.scopes) {
					for (i = 0, l = this.scopes.length; i < l; i++) {
						this.scopes[i].resume();
					}
				}
				for (i = 0, l = this.effects.length; i < l; i++) {
					this.effects[i].resume();
				}
			}
		}
	}
	run(fn) {
		if (this._active) {
			const currentEffectScope = activeEffectScope;
			try {
				activeEffectScope = this;
				return fn();
			} finally {
				activeEffectScope = currentEffectScope;
			}
		} else {
			warn(`cannot run an inactive effect scope.`);
		}
	}
	on() {
		activeEffectScope = this;
	}
	off() {
		activeEffectScope = this.parent;
	}
	stop(fromParent) {
		if (this._active) {
			let i, l;
			for (i = 0, l = this.effects.length; i < l; i++) {
				this.effects[i].stop();
			}
			for (i = 0, l = this.cleanups.length; i < l; i++) {
				this.cleanups[i]();
			}
			if (this.scopes) {
				for (i = 0, l = this.scopes.length; i < l; i++) {
					this.scopes[i].stop(true);
				}
			}
			if (!this.detached && this.parent && !fromParent) {
				const last = this.parent.scopes.pop();
				if (last && last !== this) {
					this.parent.scopes[this.index] = last;
					last.index = this.index;
				}
			}
			this.parent = undefined;
			this._active = false;
		}
	}
}
function effectScope(detached) {
	return new EffectScope(detached);
}
function getCurrentScope() {
	return activeEffectScope;
}
function onScopeDispose(fn, failSilently = false) {
	if (activeEffectScope) {
		activeEffectScope.cleanups.push(fn);
	} else if (__DEV__ && !failSilently) {
		warn(`onScopeDispose() is called when there is no active effect scope` + ` to be associated with.`);
	}
}

//#endregion
export { EffectScope, activeEffectScope, effectScope, getCurrentScope, onScopeDispose };