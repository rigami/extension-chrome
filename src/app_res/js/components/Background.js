import Component from "../GUI/Component.js";

class Background extends Component{
	constructor(props){
		super({
			...props,
			namespace: "background"
		});

		this.class()
				.add(this._namespace)
			.style()
				.add("background-image", `url(${"app_res/img/bg-test.png"})`)

	}

	static getNamespace(className){
		return "background"+(className? "_"+className : "");
	}

	static create(){
		return new Background(...arguments);
	}
}

export default Background;