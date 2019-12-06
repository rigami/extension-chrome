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

import BackgroundPage from "./BackgroundsSettings.js";
import BookmarksPage from "./BookmarksSettings.js";
import WidgetsPage from "./WidgetsSettings.js";
import OtherPage from "./OtherSettings.js";
import AboutPage from "./AboutSettings.js";

const linksConfig = {
	settings: [
		{
			type: "backgrounds",
			icon: PhotoLibraryIcon,
			color: "#2675F0",
			label: locale("backgrounds_label"),
			description: locale("backgrounds_description"),
			page: BackgroundPage
		},
		{
			type: "bookmarks",
			icon: TollIcon,
			color: "#8BC34A",
			label: locale("bookmarks_label"),
			description: locale("bookmarks_description"),
			page: BookmarksPage
		},
		{
			type: "widgets",
			icon: WidgetsIcon,
			color: "#ff5722",
			label: locale("widgets_label"),
			description: locale("widgets_description"),
			page: WidgetsPage
		},
		{
			type: "other",
			icon: CategoryIcon,
			color: "#3f51b5",
			label: locale("other_label"),
			description: locale("other_description"),
			page: OtherPage
		}		
	],
	others: [
		{
			type: "about",
			icon: InfoIcon,
			color: "#9C27B0",
			label: locale("about_label"),
			description: locale("about_description"),
			page: AboutPage
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
			fontWeight: "bold",
			whiteSpace: "nowrap"
		},
		button: {
			padding: theme.spacing(2.5),
    		marginRight: theme.spacing(4.5)
		}
	}));

	let _ripple = Ripple.create(null, {maxSize: .7});

	let titleDom = UI.create("span").class(classes.title).content(title);

	this.setTitle = (newTitle) => titleDom.content(newTitle);

	this.render =  UI.create()
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
		.append(titleDom)
}

function Page(){
	const classes = useClasses(theme => ({		
		root: {
			width: "450px",
			height: "100%",
			position: "absolute",
		    right: 0,
		    top: 0,
		    height: "calc(100vh - 70px)",
		    overflow: "auto",
		    pointerEvents: "none"
		},
		pageContainer: {
			pointerEvents: "all"
		},
		page: {
			transition: ".3s ease",
			backgroundColor: theme.palette.bg.main
		},
		hide: {
			opacity: 0,			
			transform: "translateX(50px)"
		},
		oldPage: {
			position: "absolute",
		    left: 0,
		    top: 0,
		    opacity: 0,
		}
	}));

	let activePage = null;

	let pageContainer = UI.create().class(classes.pageContainer);
	let heightController = Hidden({
		children: pageContainer
	});

	this.setPage = (category) => {
		if(!category){
			activePage.class().add(classes.oldPage).add(classes.hide);
			setTimeout(() => {
				activePage.destroy();
				activePage = null;
			}, 300);

			return;
		}

		let page = category.page().class().add(classes.hide).add(classes.page);
		heightController.setHeight(pageContainer.html.clientHeight);

		if(activePage) activePage.class().add(classes.oldPage);
		pageContainer.append(page);

		setTimeout(() => {
			heightController.unhide();
			page.class().remove(classes.hide);

			setTimeout(() => {
				if(activePage) activePage.destroy();
				activePage = page;
			}, 300);
		}, 0);
	};


	this.render = UI.create()
		.class(classes.root)
		.append(heightController)
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
		},
		page: {
			position: "relative"
		},
		smallDivider: {
			width: "40px"
		}
	}));

	let [activePage, setActivePage, activePageListener] = new Store(null);

	let header = new Header({
		title: locale("settings_label"),
		onBack: () => setActivePage(page => {
			if(!page) onClose();

			return null;
		})
	});

	let links = [];

	let categoriesByName = {};

	let pageContainer = new Page();

	Object.keys(linksConfig).forEach((section, i) => {
		if(i) links.push(Divider());		

		linksConfig[section].forEach(link => {
			categoriesByName[link.type] = link;

			return links.push(
				MainMenuRow({ 
					icon: link.icon,
					title: link.label,
					subtitle: link.description,
					color: link.color,
					onClick: () => setActivePage(link.type)
				})
			)
		});
	});

	activePageListener((page, oldPage) => {
		if(page === oldPage) return;

		links.forEach(l => {
			if(!l.isSmall){
				if(page) l.class().add(classes.smallDivider);
				else l.class().remove(classes.smallDivider);
				return;
			}

			if(page) l.small(); else l.full();
		});

		header.setTitle(locale(`${page || "settings"}_label`));
		pageContainer.setPage(categoriesByName[page]);

		if(page) this.render.style().add({width: "534px"});
		else this.render.style().add({width: "450px"});
	})

	this.open = () => {
		this.render.class().remove(classes.hide).add(classes.stable);
	};
	this.close = () => {
		this.render.class().add(classes.hide);
		setActivePage(null);
	};

	this.render = UI.create()
		.class(classes.stable+" "+classes.hide)
		.style({width: "450px"})
		.append(header)
		.append(
			UI.create()
				.class(classes.page)
				.append(links)
				.append(pageContainer)
		)
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