import GUI from "./coreGUI.js";
import Ripple from "./Ripple.js";
import UI from "./coreUI.js";

class Button extends GUI{
	constructor({label, icon, onclick, isRipple = true}){
		super({UIProps: "button"});

		this.class()
			.add(Button.getNamespace())
			.add(!label && icon? Button.getNamespace("only-icon") : "");

		if(icon) this.append(icon.create({ class: Button.getNamespace(label? "icon" : "icon-only") }))
		if(label) this.append(icon? UI.create("span").class(Button.getNamespace("icon-helper-text")).content(label) : label);
		if(onclick) this.event().add("click", onclick);
		
		if(isRipple) Ripple.create(this);
	}

	static getNamespace(className){
		return GUI.getNamespace("button")+(className? "-"+className : "");
	}

	static create(){
		return new Button(...arguments);
	}
}

export default Button;