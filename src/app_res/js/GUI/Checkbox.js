import GUI from "./coreGUI.js";
import UI from "./coreUI.js";
import Ripple from "./Ripple.js";

class Checkbox extends GUI{
	constructor({callback, isRipple = true}){
		super("button");

		this._checked = false;
		this._namespace = Checkbox.getNamespace();

		this.class()
				.add(this._namespace)
			.append(
				UI.create()
					.class(Checkbox.getNamespace("handler-container"))
					.append(
						UI.create()
							.class(Checkbox.getNamespace("handler"))
					)
			);	

		if(isRipple){
			this._ripple = Ripple.create().insert(this);

			this.event().add("mousedown", (e) => this._ripple.start(e));
			this.event().add("mouseup", () => this._ripple.end());

			this.class().add(this._ripple._namespaceRoot);
		}

		this.event().add("click", () => {
			this._checked = !this._checked;
			if(this._checked) this.class().add("gui-checked");
			else this.class().remove("gui-checked");
			
			if(callback) callback(...arguments);
		})
	}

	get checked(){
		return this._checked;
	}

	isChecked(callback){
		if(callback) callback(this._checked);
		else console.error("GUI: Invalid arguments for 'isChecked' method. Method should be called as 'isChecked(callback)'");

		return this;
	}

	static getNamespace(className){
		return GUI.getNamespace("checkbox")+(className? "-"+className : "");
	}

	static create(){
		return new Checkbox(...arguments);
	}
}

export default Checkbox;