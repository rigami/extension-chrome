import GUI from "../../core/GUI.js";
import Ripple from "../../core/Ripple.js";
import UI from "../../core/UI.js";

class Button extends GUI{
	constructor({label, icon, onclick, isRipple = true, namespace, iconProps = {}}){
		super({UIProps: "button"});

		this.class()
			.add((namespace || Button).getNamespace())
			.add(!label && icon? (namespace || Button).getNamespace("only-icon") : "");

		if(icon) this.append(icon({ class: (namespace || Button).getNamespace(label? "icon" : "icon-only"), ...iconProps }))
		if(label) this.append(icon? UI.create("span").class((namespace || Button).getNamespace("icon-helper-text")).content(label) : label);
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