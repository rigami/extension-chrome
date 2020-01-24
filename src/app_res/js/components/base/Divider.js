import UI from "../../core/UI.js";
import { useClasses } from "../../themes/style.js";

/**
 * @param {String} width [middle|full]
 * @param {String} direction [horizontal|vertical]
 */
function Divider({width = "middle", direction = "horizontal"} = {}){
	const classes = useClasses(theme => ({
		root: {
			width: width === "middle"? `calc(100% - ${theme.spacing(3)})` : "100%",
			height: "1px",
			backgroundColor: theme.palette.second.light,
			border: "none",
		    margin: `${theme.spacing(1)} ${theme.spacing(1.5)}`
		}
	}));

	return UI.create("hr")
		.class(classes.root)
}

export default Divider;