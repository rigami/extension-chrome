import UI from "../../core/UI.js";
import { useStyles } from "../../themes/style.js";

function Background(){
	const styles = useStyles({
		root: {
			height: "100%",
			backgroundImage: `url(${"app_res/img/bg-test.png"})`
		}
	});	

	return UI.create()
		.style(styles.root)
}

export default Background;