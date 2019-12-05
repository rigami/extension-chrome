import UI from "../../core/UI.js";
import { useClasses } from "../../themes/style.js";

function Background(){
	const classes = useClasses({
		root: {
			height: "100%",
			backgroundImage: `url(${"app_res/img/bg-test.png"})`
		}
	});	

	return UI.create()
		.class(classes.root)
}

export default Background;