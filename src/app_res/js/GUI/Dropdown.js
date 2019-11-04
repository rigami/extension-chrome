import GUI from "./coreGUI.js";
import UI from "./coreUI.js";
import Ripple from "./Ripple.js";

function getValue(list, searchValue) {
	let findValue = list.find((li) => li.value == searchValue);

	findValue = findValue? findValue.value : findValue;

	return findValue || 'No select value';
}

class List extends UI{
	constructor(list){
		super();

		this._namespace = List.getNamespace();

		this._list = UI.create().class()
				.add(List.getNamespace("container"))
			.append(
				list.map(el => UI.create("li")
					.class(List.getNamespace("li"))
					.content(el.label)
					.event("click", () => {

					})
				)
			)

		this.class()
				.add(List.getNamespace("container"))
			.append(
				list.map(el => UI.create("li")
					.class(List.getNamespace("li"))
					.content(el.label)
					.event("click", () => {

					})
				)
			)
	}

	open = () => {
		console.log(this)
	}

	static getNamespace(className){
		return GUI.getNamespace("dropdown-list")+(className? "-"+className : "");
	}
}

class OpenButton extends UI{
	constructor({list, isRipple = true, onclick, defaultValue}){
		super();

		if(isRipple) Ripple.create(this);

		this.class()
				.add(OpenButton.getNamespace("container"))
			.append(
				UI.create("span")
					.class(OpenButton.getNamespace())
					.content(getValue(list, defaultValue))
			)
			.event("click", onclick)
	}

	static getNamespace(className){
		return Dropdown.getNamespace("select-value")+(className? "-"+className : "");
	}
}

class Dropdown extends GUI{
	constructor({onchange, isRipple = true, isMultiple = false, list = [], defaultValue = null}){
		super("div");

		this._namespace = Dropdown.getNamespace();
		this._isOpen = false;

		let listDOM = new List(list);
		listDOM.open()
		let openButton = new OpenButton({
			list,
			isRipple,
			defaultValue,
			onclick: () => {
				this._isOpen = !this._isOpen;
			}
		});

		this.class()
				.add(this._namespace)
			.append(openButton)
			.append(
				listDOM
			)
	}

	static getNamespace(className){
		return GUI.getNamespace("dropdown")+(className? "-"+className : "");
	}

	static create(){
		return new Dropdown(...arguments);
	}
}

export default Dropdown;