import UI from "./UI.js";
import GUI from "./GUI.js";

class Circle extends UI{
	constructor({x, y, width, height, rootX, rootY, params = {}}){
		super("div");

		this._namespace = Ripple.getNamespace("circle");

		this.class(this._namespace);

		this.startX = x - rootX;
		this.startY = y - rootY;

		let maxRadiusX = Math.max(width*(params.maxSize || 1) - this.startX, this.startX*(params.maxSize || 1));
		let maxRadiusY = Math.max(height*(params.maxSize || 1) - this.startY, this.startY*(params.maxSize || 1));

		this.radius =  Math.sqrt(maxRadiusX*maxRadiusX + maxRadiusY*maxRadiusY);

		this.style()
				.add("top", `${this.startY}px`)
				.add("left", `${this.startX}px`)
				.add("width", `${this.radius*2}px`)
				.add("height", `${this.radius*2}px`)
				.add("transform", `translate(${-this.radius}px, ${-this.radius}px) scale(${0})`)
			.class()
				.add(this._namespace+params.fast? "_fast" : "_hold")


		setTimeout(() => {
			this.style()
					.add("transform", `translate(${-this.radius}px, ${-this.radius}px) scale(${1})`)
		}, 50);
	}

	end(){
		this.class()
				.remove(this._namespace+"_fast")
				.remove(this._namespace+"_hold")
			.style()
				.add("transform", `translate(${-this.radius}px, ${-this.radius}px) scale(${1})`)
				.add("opacity", "0")

		setTimeout(() => {
			//this.destroy();
		}, 1000);
	}

	static create(){
		return new Circle(...arguments);
	}
}

class Ripple extends UI{
	constructor(parent, params = {}){
		super("span");

		this._namespace = Ripple.getNamespace("root");
		this._namespaceRoot = Ripple.getNamespace("parent");
		this._namespaceCircle = Ripple.getNamespace("circle");
		this.circleProcess = null;
		this.parent = parent;
		this._params = params;
		
		if(!params.isExtends) this.class().add(this._namespace);

		if(parent){
			parent.event()
					.add("mousedown", (e) => this.start(e))
				.class()
					.add(this._namespaceRoot)
				.append(this)
		}
	}

	start(e){
		this.circleProcess = Circle.create({
			x: e.clientX || this.html.getBoundingClientRect().x+e.rippleX,
			y: e.clientY || this.html.getBoundingClientRect().y+e.rippleY,
			width: this.html.clientWidth,
			height: this.html.clientHeight,
			rootY: this.html.getBoundingClientRect().y,
			rootX: this.html.getBoundingClientRect().x,
			params: {
				...this._params
			}
		}).insert(this);

		let ths = this;

		window.addEventListener("mouseup", listenerCallback, false);

		function listenerCallback(){
			window.removeEventListener("mouseup", listenerCallback, false);
			ths.end();
		}
	}

	end(){
		if(this.circleProcess){
			this.circleProcess.end();
			this.circleProcess = null;
		}
	}

	static getNamespace(className){
		return GUI.getNamespace("ripple")+(className? "-"+className : "");
	}

	static _circle = Circle;

	static create(){
		return new Ripple(...arguments);
	}
}

export default Ripple;