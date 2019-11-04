import GUI from "./coreGUI.js";
import Ripple from "./Ripple.js";

class Button extends GUI{
	constructor({label, icon, onclick, isRipple = true}){
		super("button");
		this._namespace = Button.getNamespace();

		this.class().add(this._namespace);

		if(label) this.append().text(label);
		if(onclick) this.event().add("click", onclick);
		
		if(isRipple) Ripple.create(this);
	}

	static getNamespace(className){
		return GUI.getNamespace("button")+(className? "_"+className : "");
	}

	static create(){
		return new Button(...arguments);
	}
}

export default Button;