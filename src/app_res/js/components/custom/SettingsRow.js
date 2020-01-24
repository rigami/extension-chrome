import UI from "../../core/UI.js";
import Ripple from "../../core/Ripple.js";
import { useClasses, useTheme } from "../../themes/style.js";

function SettingsRow({ component = "li", isRipple = true, icon, title, subtitle, action, onClick }){
	const classes = useClasses(theme => ({
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
			"$classIndex": 1,
			fontSize: theme.typography.size.subtitle,
			color: theme.palette.text.subtitle.dark,
			marginTop: theme.spacing(.5)
		},
		action: {
			flexShrink: 0,
			display: "flex",
			alignItems: "center",
			paddingLeft: theme.spacing(4)
		},
		icon: {
			padding: theme.spacing(1),
		    paddingRight: theme.spacing(4.5)
		}
	}));

	let onClickListener;

	this.render = UI.create()
		.class(classes.root)
		.append(
			icon && UI.create()
				.class(classes.icon)
				.append(icon)
		)
		.append(
			UI.create()
				.class(classes.textRoot)
				.append(
					(typeof title !== "string"? UI.create(title) : UI.create("h2").append(title))
						.class(classes.text)
				)
				.append(
					(typeof subtitle !== "string"? UI.create(subtitle) : UI.create("p").append(subtitle))
						.class(classes.text)
							.add(classes.subtitle)
				)
		)
		.append(
			action && UI.create()
				.class(classes.action)
				.append(typeof action === "function"? action((listener)=>{
					onClickListener = listener;
				}) : action)
		)
		.event()
			.add("click", () => {
				if(onClickListener) onClickListener();
				if(onClick) onClick();
			})

	if(isRipple) Ripple.create(this.render);
}

export default props => new SettingsRow(props);