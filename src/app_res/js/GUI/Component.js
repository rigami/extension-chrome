import UI from "./coreUI.js";

class Component extends UI{
	constructor({namespace, component, parentClassName}){
		super(component);

		this._namespace = (parentClassName? parentClassName+"-" : "")+namespace;		
	}

	getNamespace(className){
		return this._namespace+(className? "_"+className : "");
	}

	static create(){
		return new Component(...arguments);
	}
}

export default Component;