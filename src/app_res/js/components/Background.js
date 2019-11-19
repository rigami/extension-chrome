import Component from "../GUI/Component.js";
import UI from "../GUI/coreUI.js";
import { useStyles } from "../themes/style.js";

function Background(){
	const styles = useStyles({
		height: "100%",
		backgroundImage: `url(${"app_res/img/bg-test.png"})`
	});	

	return UI.create()
		.style(styles)
}

export default Background;