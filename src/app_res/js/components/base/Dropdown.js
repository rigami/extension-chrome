import GUI from "../../core/GUI.js";
import UI from "../../core/UI.js";
import Ripple from "../../core/Ripple.js";
import {
	ArrowDown as ArrowDownIcon,
	Check as CheckIcon
} from "../../core/Icons.js";

class List extends UI{
	constructor({list, preventClose, onselect, isMultiple = false}){
		super();

		let selectedValues = {};

		function SimpleLi(el, index){
			return UI.create("li")
				.class(List.getNamespace("li"))
				.content(el.label)
				.event("click", () => {
					if(selectedValues && list[selectedValues.index]) list[selectedValues.index].class().remove('selected');
					list[index].class().add('selected');
					selectedValues = {value: el.value, index};
					onselect(el.value, el);
				}).add("mousedown", preventClose)
		}

		function CheckboxLi(el){
			return UI.create("li")
				.class(List.getNamespace("li"))
					.add(List.getNamespace("li-no-panning"))
				.append(CheckIcon.create({
					class: List.getNamespace("check-icon")
				}))
				.append(
					UI.create("span").content(el.label)
				)
				.event("click", (e, ths) => {
					if(selectedValues[el.value]){
						delete selectedValues[el.value];
						ths.class().remove('selected');
					}else{
						selectedValues[el.value] = el.value;
						ths.class().add('selected');
					}
					onselect(selectedValues, el.value);
				}).add("mousedown", preventClose)
		}

		list = list.map((el, i) => Ripple.create(isMultiple? CheckboxLi(el) : SimpleLi(el, i)).parent);

		this._list = UI.create("ul")
			.class(List.getNamespace())
			.append(list)

		this._srollHelper = UI.create()
			.class(List.getNamespace("scroll-helper"))
			.append(this._list)

		this.class()
				.add(List.getNamespace("container"))
			.append(this._srollHelper)
	}

	open = () => {
		this.class()
				.add("open")
			.style()
				.add("height", this._srollHelper.html.clientHeight+"px");
	}

	close = () => {
		this.class()
				.remove("open")
			.style()
				.remove("height");
	}

	static getNamespace(className){
		return Dropdown.getNamespace("list")+(className? "-"+className : "");
	}
}

class OpenButton extends UI{
	constructor({onclick, onmousedown, defaultLabel}){
		super();

		Ripple.create(this);

		this._label = UI.create("span")
			.class(OpenButton.getNamespace())
			.content(defaultLabel)

		this.class()
				.add(OpenButton.getNamespace("container"))
			.append(this._label)
			.append(ArrowDownIcon({
				class: OpenButton.getNamespace("-arrow-icon")
			}))
			.event("click", onclick)
			.event("mousedown", onmousedown)
	}

	changeLabel = (newLabel) => {
		this._label.content(newLabel);
	}

	static getNamespace(className){
		return Dropdown.getNamespace("select-value")+(className? "-"+className : "");
	}
}

class Dropdown extends GUI{
	constructor({onchange, isMultiple = false, list = [], defaultValue = null, labelFormat = null}){
		super("div");

		this._namespace = Dropdown.getNamespace();
		this._isOpen = false;
		this._selectValue = isMultiple && !defaultValue? {} : defaultValue;
		this._preventClose = () => {
			window.removeEventListener("mousedown", listenerCallback, false);
		}
		this._setCloseListener = () => {
			window.addEventListener("mousedown", listenerCallback, false);
			window.addEventListener("mouseup", restoreListenerCallback, false);
		}

		let ths = this;

		this._listDOM = new List({
			list,
			preventClose: this._preventClose,
			isMultiple,
			onselect: (valueOrValues, elementOrChangeValue) => {
				this._selectValue = valueOrValues;
				openButton.changeLabel((labelFormat || Dropdown.getLabel)(list, valueOrValues));
				if(!isMultiple){
					this.close();
					if(onchange) onchange(valueOrValues, elementOrChangeValue);
				}else{
					if(onchange) onchange(list.filter(el => valueOrValues[el.value]).map(el => el.value), elementOrChangeValue);
				}
			}
		});
		let openButton = new OpenButton({
			defaultLabel: (labelFormat || Dropdown.getLabel)(list, this._selectValue),
			onclick: () => {
				if(!this._isOpen) this.open();
				else this.close();
			},
			onmousedown: this._preventClose
		});

		this.class()
				.add(this._namespace)
			.append(openButton)
			.append(this._listDOM);

		function listenerCallback(){
			window.removeEventListener("mousedown", listenerCallback, false);
			ths.close();
		}

		function restoreListenerCallback(){
			window.removeEventListener("mouseup", restoreListenerCallback, false);
			if(ths._isOpen) ths._setCloseListener();
		}
	}

	open = () => {
		this.class().add("open");
		this._listDOM.open();
		this._isOpen = true;
		this._setCloseListener();
	}

	close = () => {
		this.class().remove("open");
		this._listDOM.close();
		this._isOpen = false;
		this._preventClose();
	}

	static getLabel(list, searchValueOrValues) {
		let findValue = '';
		if(typeof searchValueOrValues === 'object'){
			findValue = list.filter((li) => searchValueOrValues && searchValueOrValues[li.value]).map(el => el.label);
			findValue = findValue.join(", ");
		}else{
			findValue = list.find((li) => li.value == searchValueOrValues);
			findValue = findValue? findValue.label : findValue;
		}
		

		return findValue || 'No select value';
	}	

	static getNamespace(className){
		return GUI.getNamespace("dropdown")+(className? "-"+className : "");
	}

	static create(){
		return new Dropdown(...arguments);
	}
}

export default Dropdown;