import GUI from "./coreGUI.js";
import UI from "./coreUI.js";
import Ripple from "./Ripple.js";

class Slider extends GUI{
	constructor({onchange, isRipple = true}){
		super();

		this._value = 0;

		if(isRipple){
			this._ripple = Ripple.create();

			this.event().add("mousedown", (e) => this._ripple.start({
				rippleX: e.offsetX,
				rippleY: 2
			}));

			this.class().add(this._ripple._namespaceRoot);
		}

		var handlerDom = UI.create().class("gui-slider-handler");

		this.class().add("gui-slider")
			.append(
				UI.create()
					.class("gui-slider-handler-container")
					.append(this._ripple)
					.append(handlerDom)
					.event("mousedown", function(e){
						console.log("Click on handler")
						console.log(e.clientX);
						handlerOffsetX = e.clientX;
					}.bind(this))
			);	

		var mouseIsPressed = false;

		var ths = this;

		var offestX = 0;

		var handlerOffsetX = 0;

		this.event("mousedown", function(e, btn){
			//console.log("Click on sliedr")
			mouseIsPressed = true;
			addEventListener("mousemove", moveHandler, false);
			addEventListener("mouseup", endMoveHandler, false);
			offestX = e.clientX - e.offsetX;
			moveHandler(e);
		}.bind(this));
		this.event("mouseup", function(e, btn){
			
		}.bind(this))

		function moveHandler(e){
			let val = 0;
			if(e.clientX - offestX > 9) val = (e.clientX - offestX-9)/(ths.html.clientWidth-18);
			//console.log(handlerOffsetX - offestX)
			if(e.clientX - offestX >= (ths.html.clientWidth-9)) val = 1;
			//console.log(ths._value*(ths.html.clientWidth-18)>=val*(ths.html.clientWidth-18), ths._value*(ths.html.clientWidth-18)<=val*(ths.html.clientWidth))
			ths._value = val;
			handlerDom.style().add("left", val*(ths.html.clientWidth-18)+"px");

			if(onchange) onchange(e, ths);
		}
		function endMoveHandler(e){
			mouseIsPressed = false;
			removeEventListener("mousemove", moveHandler, false);
			removeEventListener("mouseup", endMoveHandler, false);
		}
	}

	get value(){
		return this._value;
	}

	getValue(callback){
		if(callback) callback(this._value);
		else console.error("GUI: Invalid arguments for 'getValue' method. Method should be called as 'getValue(callback)'");

		return this;
	}

	static create(){
		return new Slider(...arguments);
	}
}

export default Slider;