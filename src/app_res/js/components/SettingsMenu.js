import Component from "../GUI/Component.js";
import UI from "../GUI/coreUI.js";
import Button from "../GUI/Button.js";
import SettingsRow from "../components/SettingsRow.js";
import { getSafeValue as locale} from "../utils/Locale.js";
import {
	PhotoLibrary as PhotoLibraryIcon,
	Toll as TollIcon
} from "../Icons/Icons.js";

import { useStyles, useTheme } from "../themes/style.js";

const linksConfig = {
	settings: [
		{
			icon: () => RowIcon({icon: PhotoLibraryIcon, color: useTheme().palette.primary.main}),
			label: locale("backgrounds_label"),
			description: locale("backgrounds_description")
		},
		{
			icon: () => RowIcon({icon: TollIcon, color: useTheme().palette.primary.main}),
			label: locale("bookmarks_label"),
			description: locale("bookmarks_description")
		},
		{
			icon: () => RowIcon({icon: PhotoLibraryIcon, color: useTheme().palette.primary.main}),
			label: locale("widgets_label"),
			description: locale("widgets_description")
		},
		{
			icon: () => RowIcon({icon: PhotoLibraryIcon, color: useTheme().palette.primary.main}),
			label: locale("other_label"),
			description: locale("other_description")
		}		
	],
	others: [
		{
			icon: () => RowIcon({icon: PhotoLibraryIcon, color: "#9C27B0"}),
			label: locale("about_label"),
			description: locale("about_description")
		}
	]
};

function RowIcon({icon, color} = {}){
	const styles = useStyles(theme => ({
		wrapper: {
			backgroundColor: color,
			borderRadius: "50%",
	    	padding: "11px"
		}
	}));

	return UI.create()
		.style(styles.wrapper)
		.append(icon.create({size: 20, fill: "#fff", style: "display: block;"}))
}

function Divider({width = "middle"} = {}){
	const styles = useStyles(theme => ({
		width: width === "middle"? "calc(100% - 10px)" : "100%",
		height: "1px",
		backgroundColor: theme.palette.second.light,
		border: "none",
	    margin: `${theme.spacing(1)} 0`,
		marginLeft: theme.spacing(6)
	}));

	return UI.create("hr")
		.style(styles)
}

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

	let links = [];
	let header;
	let page;



	Object.keys(linksConfig)
		.forEach((section, i) => {
			if(i) links.push(Divider())

			linksConfig[section].forEach(link => links.push(SettingsRow.create({
				icon: link.icon,
				title: link.label,
				subtitle: link.description
			})));
		});

	this.open = () => {
		this.render.style().remove(styles.hide).add(styles.stable);
	};
	this.close = () => {
		this.render.style().add(styles.hide);
	};
	this.render = UI.create()
		.style({...styles.stable, ...styles.hide})
		.append(links)
		.append(
			UI.create()
				.append(header)
				.append(page)
		)
}

function SettingsMenu(setIsOpenSettings){
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