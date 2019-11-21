import Component from "../GUI/Component.js";
import UI from "../GUI/coreUI.js";
import Button from "../GUI/Button.js";
import { Store, observer } from "../utils/Store.js";

import {
	Settings as SettingsIcon,
	Refresh as RefreshIcon
} from "../Icons/Icons.js";

import { useStyles } from "../themes/style.js";

import Background from "../components/Background.js";
import SettingsMenu from "../components/SettingsMenu.js";

let [isOpenSettings, setIsOpenSettings, addIsOpenSettingsValueListener] = new Store(null, true);

function Home(){
	const styles = useStyles({
		height: "100%"
	});

	return UI.create()
		.style(styles)
		.append(Background)
		.append(observer({
			element: () => new SettingsMenu(setIsOpenSettings),
			mutation: (settings, isOpen, oldValue) => isOpen? setTimeout(settings.open, oldValue === null? 50 : 0) : settings.close(),
			listener: addIsOpenSettingsValueListener
		}))
		.append(ActionBar)
}

export default Home;

function ActionBar(namespace){
	const styles = useStyles(theme => ({
		position: "absolute",
	    right: theme.spacing(6),
	    bottom: theme.spacing(5),
	    width: theme.spacing(9),
	    display: "flex",
	    flexDirection: "column",
	    alignItems: "center",
	    backgroundColor: theme.palette.bg.main,
	    boxShadow: theme.boxShadow.normal,
	    borderRadius: theme.spacing(4.5)
	}));

	return UI.create()
		.style(styles)
		.append(
			ButtonAction.create({
				icon: SettingsIcon,
				onclick: () => setIsOpenSettings(value => !value)
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
	const styles = useStyles(theme => ({
		width: width === "middle"? "calc(100% - 10px)" : "100%",
		height: "1px",
		backgroundColor: theme.palette.second.light,
		border: "none",
	    margin: `${theme.spacing(.5)} ${theme.spacing(1)}`
	}));

	return UI.create("hr")
		.style(styles)
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