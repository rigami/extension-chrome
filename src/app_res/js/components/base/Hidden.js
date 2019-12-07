import UI from "../../core/UI.js";
import { useClasses, useTheme } from "../../themes/style.js";

function Hidden({onUnhide, onHide, onSetHeight, children, classes = {}, height}){

	let externalClasses = classes;

	classes = useClasses({
		root: {
			height: 0,
		    overflow: "hidden",
		    transition: "height 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
		},
		rootEntered: {
			height: "auto",
    		overflow: "visible"
		},
		wrapper: {
			display: "flex"
		},
		wrapperInner: {
			width: "100%"
		},
	});

	let timer = null;

	this.hide = () => {

		let height = wrp.html.clientHeight;

		if(timer) clearTimeout(timer);

		this.render
			.style()
				.add("height", height+"px")
			.class()
				.remove(classes.rootEntered)

		timer = setTimeout(() => {
			this.render
				.style()
					.add("height", 0+"px")
				.class()
					.add(externalClasses.hidden);

			timer = setTimeout(() => {
				if(onHide) onHide();
			}, 300);
		});			
	}
	this.unhide = () => {

		let height = wrp.html.clientHeight;

		if(timer) clearTimeout(timer);

		this.render
			.style()
				.add("height", height+"px")
			.class()			
				.remove(externalClasses.hidden)

		timer = setTimeout(() => {
			this.render
				.class()
					.add(classes.rootEntered)
				.style()
					.add("height", "auto")

				if(onUnhide) onUnhide();
		}, 300);
	}
	this.setHeight = (newHeight) => {
		let height = wrp.html.clientHeight;

		if(timer) clearTimeout(timer);

		this.render
			.style()
				.add("height", height+"px")
			.class()
				.remove(classes.rootEntered)

		timer = setTimeout(() => {
			this.render
				.style()
					.add("height", newHeight+"px")
				.class()
					.add(externalClasses.blocked);

			timer = setTimeout(() => {
				if(onSetHeight) onSetHeight();
			}, 300);
		});		
	}

	let wrp = UI.create()
				.class(classes.wrapper)
				.append(
					UI.create()
						.class(classes.wrapperInner)
						.append(children)
				);

	this.render = UI.create("div")
		.class(classes.root)
			.add(height === 0? "" : classes.rootEntered)
			.add(externalClasses.root)
			.add(height === 0? externalClasses.hidden : "")
			.add(height? externalClasses.blocked : "")
		.style()
			.add("height", (!height && height !== 0)? "auto" : height+"px")
		.append(wrp)
}

export default (props) => new Hidden(props);