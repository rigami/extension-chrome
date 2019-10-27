import GUI from "./coreGUI.js";

class Dropdown extends GUI{
	constructor(){
		super();
	}

	static create(){
		return new Dropdown(...arguments);
	}
}

export default Dropdown;