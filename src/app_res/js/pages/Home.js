import UI from "../core/UI.js";
import Button from "../components/base/Button.js";
import { Store, observer } from "../utils/Store.js";

import {
	Settings as SettingsIcon,
	Refresh as RefreshIcon
} from "../core/Icons.js";

import { useStyles } from "../themes/style.js";

import Background from "../components/custom/Background.js";
import SettingsMenu from "../components/custom/SettingsMenu.js";
import Divider from "../components/base/Divider.js";

let [isOpenSettings, setIsOpenSettings, addIsOpenSettingsValueListener] = new Store(null, true);

function Home(){
	const styles = useStyles({
		root: {
			height: "100%"
		}
	});

	return UI.create()
		.style(styles.root)
		.append(Background)
		.append(observer({
			element: () => new SettingsMenu({onClose: () => setIsOpenSettings(false)}),
			mutation: (settings, isOpen, oldValue) => isOpen? setTimeout(settings.open, oldValue === null? 50 : 0) : settings.close(),
			listener: addIsOpenSettingsValueListener
		}))
		.append(ActionBar)
}

export default Home;

function ActionBar(namespace){
	const styles = useStyles(theme => ({
		root: {
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
		}
	}));

	return UI.create()
		.style(styles.root)
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