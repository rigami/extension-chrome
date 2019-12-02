import GUI from "../../core/GUI.js";
import UI from "../../core/UI.js";
import Ripple from "../../core/RippleCircle.js";

class Checkbox extends GUI{
	constructor({onclick, uncontrollable = false}){
		super("button");

		this._checked = false;
		this._uncontrollable = uncontrollable;
		this._namespace = Checkbox.getNamespace();

		this._ripple = Ripple.create();

		this.class()
				.add(this._namespace)
			.append(
				UI.create()
					.class(Checkbox.getNamespace("handler-container"))
					.append(
						UI.create()
							.class(Checkbox.getNamespace("handler"))
								.add(this._ripple._namespaceRoot)
							.append(this._ripple)
					)
			)
			.event()
				.add("mousedown", (e) => this._ripple.start(e))

		if(!this._uncontrollable)
			this.event().add("click", () => {
				this._checked = !this._checked;
				if(this._checked) this.class().add("gui-checked");
				else this.class().remove("gui-checked");
				
				if(onclick) onclick(...arguments);
			})
	}

	get checked(){
		return this._checked;
	}

	setValue(isChecked){
		this._checked = isChecked;
		if(this._checked) this.class().add("gui-checked");
		else this.class().remove("gui-checked");
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