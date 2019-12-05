import UI from "./UI.js";
import Ripple from "./Ripple.js";

class RippleCircle extends Ripple{
	constructor(parent, params = {}){
		super(null, {...params, isExtends: true});

		this._namespace = Ripple.getNamespace("root-no-overflow");
		this.parent = parent;
		this._params = params;
		
		this.class().add(this._namespace);

		if(parent){
			parent.event()
					.add("mousedown", (e) => this.start(e))
				.class()
					.add(this._namespaceRoot)
				.append(this);

			return parent;
		}
	}

	start(e){
		this.circleProcess = Ripple._circle.create({
			x: this.html.getBoundingClientRect().x+this.html.clientWidth/2,
			y: this.html.getBoundingClientRect().y+this.html.clientHeight/2,
			width: this.html.clientWidth,
			height: this.html.clientHeight,
			rootY: this.html.getBoundingClientRect().y,
			rootX: this.html.getBoundingClientRect().x,
			params: {
				fast: true,
				maxSize: 1.25,
				...this._params,
				isExtends: true
			}
		}).insert(this);

		let ths = this;

		window.addEventListener("mouseup", listenerCallback, false);

		function listenerCallback(){
			window.removeEventListener("mouseup", listenerCallback, false);
			ths.end();
		}
	}

	static create(){
		return new RippleCircle(...arguments);
	}
}

export default RippleCircle;