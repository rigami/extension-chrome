import GUI from "../../core/GUI.js";
import UI from "../../core/UI.js";

class Input extends GUI{
	constructor({title, onchange}){
		super();

		this._titleDom = null;
		this._titleHelperContainer = null;
		this._inputDom = UI.create("input")
			.class(Input.getNamespace("input"))			

		if(title){
			this._titleDom = UI.create("span")
				.class(Input.getNamespace("title"));

			let titleHelper = UI.create()
				.class(Input.getNamespace("title-helper"))
				.style().add("width", `${0}px`);

			this._titleHelperContainer = UI.create()
				.class(Input.getNamespace("title-helper-container"))
				.append(titleHelper)

			this._inputDom.event()
				.add("focus", () => {
					this._titleHelperContainer.style().add("width", `${this._titleDom.html.offsetWidth*.75 + 10}px`)
					titleHelper.style().add("width", `100%`);
					this.class().add("focus").add("active");
				})
				.add("blur", () => {
					this.class().remove("focus");
					if(this._inputDom.html.value === ""){
						this.class().remove("active");
						titleHelper.style().add("width", `${0}px`);
					}
				})
				.add("input", (e) => {
					if(onchange) onchange(this._inputDom.html.value, e, this);
				})
		};

		this.class()
			.add(Input.getNamespace())
			.append(this._titleDom)
			.append(this._inputDom)
			.append(this._titleHelperContainer)		

		this.changeTitle(title);
	}

	changeTitle = (newTitle) => {
		this._titleDom.content(newTitle);	
	}

	static getNamespace(className){
		return GUI.getNamespace("input")+(className? "-"+className : "");
	}

	static create(){
		return new Input(...arguments);
	}
}

export default Input;