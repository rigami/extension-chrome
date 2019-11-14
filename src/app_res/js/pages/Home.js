import Component from "../GUI/Component.js";

class Home extends Component{
	constructor(){
		super({
			namespace: "home"
		});

		this.class().add(this._namespace)
	}

	static getNamespace(className){
		return "home"+(className? "_"+className : "");
	}

	static create(){
		return new Home(...arguments);
	}
}

export default Home;