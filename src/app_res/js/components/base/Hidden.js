import UI from "../../core/UI.js";
import { useStyles, useTheme } from "../../themes/style.js";

function Hidden({onUnhide, onHide, children, style = {}}){
	const styles = useStyles({
		root: {
			overflow: "hidden",
			transition: ".3s ease",
			position: 'relative',
			height: '100%'
		},
		container: {
			position: 'absolute',
			top: 0,
			right: 0,
			bottom: 0
		},
		hideHorizontal: {
			width: 0
		},
		hideVertical: {
			height: 0
		},
	});

	if(children.forEach) throw new Error("Prop 'children' should be the only element")

	this.hide = ({vertical = false, horizontal = true} = {}) => {
		let size = (children.html || children).clientWidth;
		this.render
			.style()
				.add(vertical? styles.hideVertical : {})
				.add(horizontal? styles.hideHorizontal : {});
		if(onHide) onHide();
	}
	this.unhide = () => {
		this.render
			.style()
				.add({...styles.root, ...style.root});
		if(onUnhide) onUnhide();
	}

	let wrp = UI.create()
				.style(styles.container)
				.append(children)

	this.render = UI.create("div")
		.style({...styles.root, ...style.root})
		.append(wrp)
}

export default (props) => new Hidden(props);