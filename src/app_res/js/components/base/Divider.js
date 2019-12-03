import UI from "../../core/UI.js";
import { useStyles } from "../../themes/style.js";

/**
 * @param {String} width [middle|full]
 * @param {String} direction [horizontal|vertical]
 */
function Divider({width = "middle", direction = "horizontal"} = {}){
	const styles = useStyles(theme => ({
		root: {
			width: width === "middle"? "calc(100% - 10px)" : "100%",
			height: "1px",
			backgroundColor: theme.palette.second.light,
			border: "none",
		    margin: `${theme.spacing(1)} 0`,
			marginLeft: theme.spacing(6)
		}
	}));

	return UI.create("hr")
		.style(styles.root)
}

export default Divider;