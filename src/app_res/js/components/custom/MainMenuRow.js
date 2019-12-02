import UI from "../../core/UI.js";
import Ripple from "../../core/Ripple.js";
import Hidden from "../base/Hidden.js";
import { useStyles, useTheme } from "../../themes/style.js";

function MainMenuRow({ component = "li", isRipple = true, icon, title, subtitle, color }){
	const styles = useStyles(theme => ({
		root: {
			padding: theme.spacing(4),
			width: "100%",
			display: "flex",
			boxSizing: "border-box"
		},
		textRoot: {
			flexGrow: 1
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
	    	padding: theme.spacing(3)
		}
	}));

	let onClickListener;

	let textBlock = Hidden({
		children: UI.create()
			.style(styles.textRoot)
			.append(
				(typeof title !== "string"? UI.create(title) : UI.create("h2").append(title)).style(styles.text)
			)
			.append(
				(typeof subtitle !== "string"? UI.create(subtitle) : UI.create("p").append(subtitle)).style({...styles.text, ...styles.subtitle})
			)
	});

	this.small = () => textBlock.hide({ horizontal: true });

	this.full = () => textBlock.unhide();

	this.render = UI.create()
		.style(styles.root)
		.append(
			UI.create()
				.style(styles.iconRoot)
				.append(
					UI.create()
						.style(styles.icon)
						.append(icon({size: 20, fill: "#fff", style: "display: block;"}))
				)
		)
		.append(textBlock)
		.event()
			.add("click", () => {if(onClickListener) onClickListener()})

	if(isRipple) Ripple.create(this.render);
}

export default props => new MainMenuRow(props);