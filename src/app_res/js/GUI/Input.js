import GUI from "./coreGUI.js";

class Input extends GUI{
	constructor(){
		super();
	}

	static create(){
		return new Input(...arguments);
	}
}

export default Input;