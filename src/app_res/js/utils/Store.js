import UI from "../GUI/coreUI.js";

export class Store{
	constructor(defaultValue){
		this._value = defaultValue;
		this._listeners = [];

		return [this.value, this.setValue, this.addListener];
	}

	get value(){
		return this._value;
	}

	setValue = (mutationCallbackOrValue) => {
		let oldValue = this._value;
		this._value = typeof mutationCallbackOrValue === 'function'? mutationCallbackOrValue(this._value) : mutationCallbackOrValue;
		this._listeners.forEach(listener => listener(this._value, oldValue));		
	}

	addListener = (newListener, autoCall) => {
		this._listeners.push(newListener);

		if(autoCall) newListener(this._value);
	}
}

export function observer({ element, mutation, listener }){
	let obsvElem = typeof element == "function"? UI.create() :  element;

	listener((value, oldValue) => {
		if(typeof element == "function"){
			element = element();
			obsvElem.append(element);
		}
		mutation(element, value, oldValue)
	}, typeof element !== "function");

	return obsvElem;
}