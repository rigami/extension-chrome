import UI from "../../core/UI.js";
import Button from "../base/Button.js";
import SettingsRow from "./SettingsRow.js";
import { getSafeValue as locale} from "../../utils/Locale.js";
import {
	PhotoLibrary as PhotoLibraryIcon,
	Toll as TollIcon,
	Widgets as WidgetsIcon,
	Info as InfoIcon,
	Category as CategoryIcon,
	ArrowBack as ArrowBackIcon
} from "../../core/Icons.js";
import Ripple from "../../core/RippleCircle.js";
import { Store, observer } from "../../utils/Store.js";

import { useClasses, useTheme } from "../../themes/style.js";

import Divider from "../base/Divider.js";
import Hidden from "../base/Hidden.js";

import MainMenuRow from "./MainMenuRow.js";

const linksConfig = {
	settings: [
		{
			type: "backgrounds",
			icon: PhotoLibraryIcon,
			color: "#2675F0",
			label: locale("backgrounds_label"),
			description: locale("backgrounds_description")
		},
		{
			type: "bookmarks",
			icon: TollIcon,
			color: "#8BC34A",
			label: locale("bookmarks_label"),
			description: locale("bookmarks_description")
		},
		{
			type: "widgets",
			icon: WidgetsIcon,
			color: "#ff5722",
			label: locale("widgets_label"),
			description: locale("widgets_description")
		},
		{
			type: "other",
			icon: CategoryIcon,
			color: "#3f51b5",
			label: locale("other_label"),
			description: locale("other_description")
		}		
	],
	others: [
		{
			type: "about",
			icon: InfoIcon,
			color: "#9C27B0",
			label: locale("about_label"),
			description: locale("about_description")
		}
	]
};



function Header({title, onBack}){
	const classes = useClasses(theme => ({
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
		.class(classes.container)
		.append(
			UI.create()
				.class(classes.button)
				.class()
					.add(_ripple._namespaceRoot)
				.append(_ripple)
				.append(ArrowBackIcon({size: 24, style: "display: block;"}))
				.event("click", onBack)
					.add("mousedown", (e) => _ripple.start(e))
		)
		.append(
			UI.create("span").class(classes.title).content(title)
		)
}

function MainPage({onClose, onOpenDirectory}){
	const classes = useClasses(theme => ({		
		stable: {
			width: "450px",
			height: "100%",
			display: 'inline-block',
			position: "absolute",
			left: 0,
			top: 0,
			backgroundColor: "#ffffff"
		}
	}));

	let links = [];

	Object.keys(linksConfig)
		.forEach((section, i) => {
			if(i) links.push(Divider())

			linksConfig[section].forEach(link => links.push(
				SettingsRow({
					style: {
						text: {
							height: 0,
    						opacity: 0
						}
					},
					icon: link.icon,
					title: link.label,
					subtitle: link.description
				}).render
					.event()
						.add("click", () => onOpenDirectory(link.type))
			));
		});
	this.render = UI.create()
		.class(classes.stable+" "+classes.hide)
		.append(
			Header({
				title: locale("settings"),
				onBack: onClose
			})
		)
		.append(links)
}

function BackgroundsPage({onClose, onOpen}){
	const classes = useClasses(theme => ({		
		stable: {
			width: "500px",
			height: "100%",
			backgroundColor: "#ffffff"
		}
	}));

	let links = [];
	let content = [];

	Object.keys(linksConfig)
		.forEach((section, i) => {
			if(i) links.push(Divider())

			linksConfig[section].forEach(link => links.push(UI.create(link.icon()).style({margin: "18px"})));

			linksConfig[section].forEach(link => content.push(
				SettingsRow({
					title: link.label,
					subtitle: link.description
				})
			));
		});
	this.render = UI.create()
		.class(classes.stable)
		.append(
			Header({
				title: locale("backgrounds_label"),
				onBack: onClose
			})
		)
		.append(
			UI.create()
				.style({display: "flex"})
				.append(
					UI.create().append(links)
				)
				.append(
					UI.create().append(content)
				)
		)
}

function SettingsContainer({onClose}){
	const classes = useClasses(theme => ({		
		stable: {
			height: "100%",
			backgroundColor: theme.palette.bg.main,
			position: 'absolute',
			right: 0,
			top: 0,
			transition: ".3s ease"
		},
		pageWrp: {
			height: "100%",
			width: "100%",
			position: "absolute",
			left: 0,
			top: 0,
			pointerEvents: "none"
		},
		hide: {
			transform: "translateX(100%)"
		}
	}));

	let [activePage, setActivePage, activePageListener] = new Store(null);

	let links = [];

	let isCollapse = false;

	Object.keys(linksConfig).forEach((section, i) => {
		if(i) links.push(Divider());

		linksConfig[section].forEach(link => links.push(
			MainMenuRow({ 
				icon: link.icon,
				title: link.label,
				subtitle: link.description,
				color: link.color,
				onClick: () => {
					isCollapse = !isCollapse;
					links.forEach(l => {
						if(!l.isSmall) return;

						if(!l.isSmall()) l.small(); else l.full();
					})
					setActivePage(() => link.type);
				}
			})
		));
	});

	activePageListener((v) => {
		console.log("Active page:", v)
	})

	this.open = () => {
		this.render.class().remove(classes.hide).add(classes.stable);
	};
	this.close = () => {
		this.render.class().add(classes.hide);
	};



	this.render = UI.create()
		.class(classes.stable+" "+classes.hide)
		.style({width: "450px"})
		.append(links)


	/*UI.create()
		.style({...classes.pageWrp, pointerEvents: "all"})
		.append(
			new MainPage({
				onClose,
				onOpenDirectory: page => setPagesStateValue(pages => ({...pages, [page]: true}))
			})
		)
		.insert(this.render);

	UI.create()
		.style({...classes.pageWrp, width: "500px"})
		.append(
			observer({
				element: () => Hidden({
					style: {
						root: {
							height: "100%",
							width: "100%",
							display: 'inline-block',
							position: "absolute",
							right: 0,
							top: 0,
							pointerEvents: "all"
						}
					},
					onUnhide: () => this.render.style().add("width", "500px"),
					onHide: () => this.render.style().add("width", "450px"),
					children: new BackgroundsPage({
						onClose: () => setPagesStateValue(pages => ({...pages, backgrounds: false}))
					})
				}),
				mutation: (page, pagesValue) => pagesValue.backgrounds? page.unhide() : page.hide(),
				listener: addPagesStateValueListener
			})
		)
		.insert(this.render);*/	
}

function SettingsMenu({onClose}){
	const classes = useClasses({
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
		this.render.class().remove(classes.hide).add(classes.stable);
		settingsContainer.open();
	};
	this.close = () => {
		this.render.class().add(classes.hide);
		settingsContainer.close();		
	};
	this.render = UI.create()
		.class(classes.stable+" "+classes.hide)
		.append(
			UI.create()
				.class(classes.closeButton)
				.event("click", onClose)
		)
		.append(settingsContainer)
}

export default SettingsMenu;