import UI from "../../core/UI.js";
import Ripple from "../../core/Ripple.js";
import RippleCircle from "../../core/RippleCircle.js";
import Hidden from "../base/Hidden.js";
import { useClasses, useStyles, useTheme } from "../../themes/style.js";

function MainMenuRow({ component = "li", icon, title, subtitle, color, onClick = ()=>{} }){
	const classes = useClasses(theme => ({
		root: {
			padding: theme.spacing(4),
			width: "100%",
			display: "flex",
			boxSizing: "border-box",
			transition: ".3s ease"
		},
		rootSmall: {
			padding: `${theme.spacing(2)} ${theme.spacing(4)}`,
		},
		text: {
			margin: 0,
		    wordBreak: "break-word",
		    fontWeight: 400,
		    fontSize: theme.typography.size.title3,
		    color: theme.palette.text.title.dark
		},
		subtitle: {
			fontSize: theme.typography.size.subtitle,
			color: theme.palette.text.subtitle.dark,
			marginTop: theme.spacing(.5)
		},
		iconRoot: {
			padding: theme.spacing(1),
		    paddingRight: theme.spacing(4.5)
		},
		icon: {
			backgroundColor: color,
			borderRadius: "50%",
	    	padding: theme.spacing(3),
		},
		textRoot: {
			transition: "height 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, opacity .3s ease !important",
			overflow: "visible !important"
		},
		textRootHidden: {
			opacity: 0
		}
	}));

	let _isSmall = false;

	let textBlock = Hidden({
		onUnhide: () => {
			iconButton.class().remove(classes.iconActive);
			this.render.class().remove(classes.rootDisabled);

			_isSmall = false;
		},
		onHide: () => {
			iconButton.class().add(classes.iconActive);

			_isSmall = true;
		},
		classes: {
			root: classes.textRoot,
			hidden: classes.textRootHidden
		},
		children: [
			(typeof title !== "string"? UI.create(title) : UI.create("h2").append(title)).class(classes.text),
			(typeof subtitle !== "string"? UI.create(subtitle) : UI.create("p").append(subtitle)).class(classes.text+" "+classes.subtitle)
		]
	});

	this.isSmall = () => _isSmall;

	this.small = () => {
		textBlock.hide();
		this.render.class()
			.add(classes.rootSmall)
			.add(classes.rootDisabled);
	}

	this.full = () => {
		textBlock.unhide();
		this.render.class().remove(classes.rootSmall);		
	}

	let _rippleIcon = RippleCircle.create(null, { maxSize: 1 });

	let iconButton =  UI.create()
			.class(classes.icon)
				.add(_rippleIcon._namespaceRoot)	
			.append(icon({size: 20, fill: "#fff", style: "display: block;"}))
			.append(_rippleIcon)
			.event()
				.add("click", () => _isSmall && onClick())
				.add("mousedown", (e) => _isSmall && _rippleIcon.start(e))

	let _rippleRoot = Ripple.create();

	this.render = UI.create()
		.class(classes.root)
			.add(_rippleRoot._namespaceRoot)	
		.append(_rippleRoot)						
		.append(
			UI.create()
				.class(classes.iconRoot)
				.append(iconButton)
		)
		.append(textBlock)
		.event()
			.add("click", () => !_isSmall && onClick())
			.add("mousedown", (e) => !_isSmall && _rippleRoot.start(e))
}

export default props => new MainMenuRow(props);