import Component from "../GUI/Component.js";
import UI from "../GUI/coreUI.js";
import Button from "../GUI/Button.js";

import { useStyles } from "../themes/style.js";


function SettingsContainer(){
	const styles = useStyles(theme => ({		
		stable: {
			height: "100%",
			width: "500px",
			backgroundColor: theme.palette.bg.main,
			position: 'absolute',
			right: 0,
			top: 0,
			transition: ".3s ease"
		},
		hide: {
			transform: "translateX(100%)"
		}
	}));

	this.open = () => {
		this.render.style().remove(styles.hide).add(styles.stable);
	};
	this.close = () => {
		this.render.style().add(styles.hide);
	};
	this.render = UI.create()
		.style({...styles.stable, ...styles.hide});
}

function SettingsMenu(setIsOpenSettings){

	console.log(setIsOpenSettings)
	const styles = useStyles({
		stable: {
			position: "absolute",
		    top: 0,
		    left: 0,
		    right: 0,
		    bottom: 0,
		    zIndex: 1000,
		    backgroundColor: "rgba(0, 0, 0, 0.15)",
			transition: ".3s ease"
		},
		hide: {
			backgroundColor: "rgba(0, 0, 0, 0)",
			pointerEvents: "none"
		},
		closeButton: {
			position: "absolute",
		    top: 0,
		    left: 0,
		    right: 0,
		    bottom: 0,
		}
	});

	let settingsContainer = new SettingsContainer();

	this.open = () => {
		this.render.style().remove(styles.hide).add(styles.stable);
		settingsContainer.open();
	};
	this.close = () => {
		this.render.style().add(styles.hide);
		settingsContainer.close();		
	};
	this.render = UI.create()
		.style({...styles.stable, ...styles.hide})
		.append(
			UI.create()
				.style(styles.closeButton)
				.event("click", () => setIsOpenSettings(false))
		)
		.append(settingsContainer)
}

export default SettingsMenu;