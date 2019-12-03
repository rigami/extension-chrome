import UI from "../../core/UI.js";
import { useClasses, useTheme } from "../../themes/style.js";

function Hidden({onUnhide, onHide, children, style = {}}){
	const classes = useClasses({
		root: {
			overflow: "hidden",
			transition: ".3s ease",
			position: 'relative',
			height: '100%'
		},
		container: {
			top: 0,
			left: 0,
			bottom: 0
		},
		containerActive: {
			position: 'absolute',
		},
		hideHorizontal: {
			width: "0 !important"
		},
		hideVertical: {
			height: "0 !important"
		},
	});

	//if(children.forEach) throw new Error("Prop 'children' should be the only element")

	this.hide = ({vertical = false, horizontal = true} = {}) => {
		let width = wrp.html.clientWidth;
		let height = wrp.html.clientHeight;

		this.render
			.style()
				.add("width", width+"px")
				.add("height", height+"px");

		wrp.style().add({
			width: width+"px",
			height: height+"px"
		})
			wrp.class().add(classes.containerActive)

		setTimeout(() => {

			this.render
				.class()
					.add(horizontal? classes.hideHorizontal : "")
					.add(vertical? classes.hideVertical : "")	
		}, 10000);
				
		if(onHide) onHide();
	}
	this.unhide = () => {
		this.render
			.class()
				.add(classes.root)
				.remove(classes.hidden)
			.styles()
				.remove(style.root)
		if(onUnhide) onUnhide();
	}

	let wrp = UI.create()
				.class(classes.container)
				.append(children)

	this.render = UI.create("div")
		.class(classes.root)
		.style(style.root)
		.append(wrp)
}

export default (props) => new Hidden(props);