import UI from "../GUI/coreUI.js";
import Ripple from "../GUI/Ripple.js";

class SettingsRow extends UI{
	constructor({component = "li", isRipple = true, title, subtitle, action}){
		super(component);

		this._namespace = SettingsRow.getNamespace();
		if(isRipple) Ripple.create(this);

		this.onClickListener = null;

		this.class()
			.add(this._namespace)
			.append(
				UI.create()
					.class(SettingsRow.getNamespace("text"))
					.append(
						typeof title == "object"? title : UI.create("h2").append(title)
					)
					.append(
						typeof subtitle == "object"? subtitle : UI.create("p").append(subtitle)
					)
			)
			.append(
				action && UI.create()
					.class(SettingsRow.getNamespace("action"))
					.append(typeof action === "function"? action((onClickListener)=>{
						this.onClickListener = onClickListener;
					}) : action)
			)
			.event()
				.add("click", () => {if(this.onClickListener) this.onClickListener()})
	}

	static getNamespace(className){
		return "settings-row"+(className? "_"+className : "");
	}

	static create(){
		return new SettingsRow(...arguments);
	}
}

export default SettingsRow;