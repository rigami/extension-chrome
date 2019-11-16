import Component from "../GUI/Component.js";
import UI from "../GUI/coreUI.js";
import Button from "../GUI/Button.js";

import {
	Settings as SettingsIcon,
	Refresh as RefreshIcon
} from "../Icons/Icons.js";

import Background from "../components/Background.js";

class Home extends Component{
	constructor(){
		super({
			namespace: "home"
		});

		this.class()
			.add(this._namespace)
			.append(
				Background.create({
					parentClassName: this._namespace
				})
			)
			.append(ActionBar(this._namespace))

	}

	static getNamespace(className){
		return "home"+(className? "_"+className : "");
	}

	static create(){
		return new Home(...arguments);
	}
}

export default Home;

function ActionBar(namespace){
	return UI.create()
		.class(`${namespace}-actionsbar`)
		.append(
			ButtonAction.create({
				icon: SettingsIcon,
				onclick: () => {

				}
			})
		)
		.append(Divider)
		.append(
			ButtonAction.create({
				icon: RefreshIcon,
				onclick: () => {
					
				}
			})
		)
}


function Divider({width = "middle"} = {}){
	return UI.create("hr")
		.class("divider")
}

class ButtonAction extends Button{
	constructor(props){
		super({
			...props,
			iconProps: {
				size: 22
			}
		});

		this.class().add("home-action-button")
	}

	static create(){
		return new ButtonAction(...arguments);
	}
}