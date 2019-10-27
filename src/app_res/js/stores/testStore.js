import State from "./lightStore.js";

class store{
	constructor(){
		let [counter, setCounter, listenerCounter] = new State(0);

		this._counter = counter;
		this._setCounter = setCounter;
	}

	get counter(){
		return this._counter;
	}

	set counter(value){
		this._counter = value;
		console.log(this.counterLabel)
		this.counterLabel.content(value);
	}
	
}

export default new store();