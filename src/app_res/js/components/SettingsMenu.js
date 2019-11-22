import Component from "../GUI/Component.js";
import UI from "../GUI/coreUI.js";
import Button from "../GUI/Button.js";
import SettingsRow from "../components/SettingsRow.js";
import { getSafeValue as locale} from "../utils/Locale.js";
import {
	PhotoLibrary as PhotoLibraryIcon,
	Toll as TollIcon,
	Widgets as WidgetsIcon,
	Info as InfoIcon,
	Category as CategoryIcon,
	ArrowBack as ArrowBackIcon
} from "../Icons/Icons.js";
import Ripple from "../GUI/RippleCircle.js";

import { useStyles, useTheme } from "../themes/style.js";

const linksConfig = {
	settings: [
		{
			icon: () => RowIcon({icon: PhotoLibraryIcon, color: useTheme().palette.primary.main}),
			label: locale("backgrounds_label"),
			description: locale("backgrounds_description")
		},
		{
			icon: () => RowIcon({icon: TollIcon, color: "#8BC34A"}),
			label: locale("bookmarks_label"),
			description: locale("bookmarks_description")
		},
		{
			icon: () => RowIcon({icon: WidgetsIcon, color: "#ff5722"}),
			label: locale("widgets_label"),
			description: locale("widgets_description")
		},
		{
			icon: () => RowIcon({icon: CategoryIcon, color: "#3f51b5"}),
			label: locale("other_label"),
			description: locale("other_description")
		}		
	],
	others: [
		{
			icon: () => RowIcon({icon: InfoIcon, color: "#9C27B0"}),
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

function Header({title, onBack}){
	const styles = useStyles(theme => ({
		container: {
			display: 'flex',
		    alignItems: 'center',
		    padding: `${theme.spacing(3.25)} ${theme.spacing(4.5)}`
		},
		title: {
			fontSize: theme.typography.size.title1,
			fontWeight: "bold"
		},
		button: {
			padding: theme.spacing(2.5),
    		marginRight: theme.spacing(4.5)
		}
	}));

	let _ripple = Ripple.create(null, {maxSize: .7});

	return UI.create()
		.style(styles.container)
		.append(
			UI.create()
				.style(styles.button)
				.class()
					.add(_ripple._namespaceRoot)
				.append(_ripple)
				.append(ArrowBackIcon.create({size: 24, style: "display: block;"}))
				.event("click", onBack)
					.add("mousedown", (e) => _ripple.start(e))
		)
		.append(
			UI.create("span").style(styles.title).content(title)
		)
}

function SettingsContainer({onClose}){
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
	let header = Header({
		title: locale("settings"),
		onBack: onClose
	});
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
		.append(header)
		.append(links)
}

function SettingsMenu({onClose}){
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

	let settingsContainer = new SettingsContainer({onClose});

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
				.event("click", onClose)
		)
		.append(settingsContainer)
}

export default SettingsMenu;