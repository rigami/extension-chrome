class Store{
	constructor(defaultValue){
		this._value = defaultValue;
		this._listeners = [];

		return [this.value, this.setValue, this.addListener];
	}

	get value(){
		return this._value;
	}

	setValue = (mutationCallback) => {
		this._value = mutationCallback(this._value);
		this._listeners.forEach(listener => listener(this._value));		
	}

	addListener = (newListener, autoCall) => {
		this._listeners.push(newListener);

		if(autoCall) newListener(this._value);
	}
}

export default Store;