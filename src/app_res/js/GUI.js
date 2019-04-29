/**
 * Light GUI library
 * Dependency: UI library
 * @author Danilkinkin <hello@danilkinkin.com>
 */

class GUI extends UI{
	constructor(){
		super(...arguments);
		this._hintText = "";
		this._enabled = true;
	}

	get enabled(){
		return this._enabled;
	}

	isEnabled(callback){
		if(callback) callback(this._enabled);
		else console.error("GUI: Invalid arguments for 'isEnabled' method. Method should be called as 'isEnabled(callback)'");

		return this;
	}

	enable(){
		this._enabled = true;
		this.class().remove("gui-disabled");

		return this;
	}

	disable(){
		this._enabled = false;		
		this.class().add("gui-disabled");

		return this;
	}

	event(action, callback){
		if(action){
			if(!callback)console.error("UI: Not find callback function for event. Method 'event' should be called as 'event(actionName, callbackAction)'");
			else this._dom["on"+action] = (e)=>{
				if(this._enabled) callback(e, this);
			};
		}
		let _dom = this._dom;

		return new class UIEvent extends UI{
			constructor(){
				super();
				this._dom = _dom;
			}
			add(action, callback){
				if(!this._customEvents[action]) this._customEvents[action] = new CustomEvent(action, arguments[3] || {});
				this._dom.addEventListener(action, (e)=>{
					if(this._enabled) callback(e, this);
				}, arguments[2] || false);

				return this;
			}
			remove(action, callback){
				if(action){
					if(callback) this._dom.removeEventListener(action, callback, arguments[2] || false);
					else this._dom["on"+action] = null;
				}else console.error("UI: Not find action name. Method 'remove' should be called as 'remove(actionName[, callbackAction])'");

				return this;
			}
			call(action, result){
				if(action){
					if(this._customEvents[action]) this._dom.dispatchEvent(this._customEvents[action]);
					else{
						if(result) result(()=>this._dom[action]());					
						else this._dom[action]();
					}	
				}else console.error("UI: Not find action name. Method 'call' should be called as 'call(actionName[, callbackActionResult])'");							

				return this;
			}
		};
	}
}

class Button extends GUI{
	constructor(label, icon, callback){
		super("button");
		//if(icon) this._dom.append(UI.create("svgSprite", ico));
		if(label) this.append().text(label);
		if(callback) this.event("click", callback);

		this.class().add("gui-button");
	}

	static create(){
		return new Button(...arguments);
	}
}

class Checkbox extends GUI{
	constructor(callback){
		super("button");

		this._checked = false;

		this.class().add("gui-checkbox");

		this.append(UI.create().class("gui-checkbox-handler-container").append(UI.create().class("gui-checkbox-handler")));		
		this.event("click", function(){
			this._checked = !this._checked;
			if(this._checked) this.class().add("gui-checked");
			else this.class().remove("gui-checked");
			
			if(callback) callback(...arguments);
		}.bind(this))
	}

	get checked(){
		return this._checked;
	}

	isChecked(callback){
		if(callback) callback(this._checked);
		else console.error("GUI: Invalid arguments for 'isChecked' method. Method should be called as 'isChecked(callback)'");

		return this;
	}

	static create(){
		return new Checkbox(...arguments);
	}
}

class Slider extends GUI{
	constructor(){
		super();

		this._value = 0;
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

class Input extends GUI{
	constructor(){
		super();
	}

	static create(){
		return new Input(...arguments);
	}
}

class Dropdown extends GUI{
	constructor(){
		super();
	}

	static create(){
		return new Dropdown(...arguments);
	}
}

class MultiCheckbox extends Dropdown{
	constructor(){
		super();
	}

	static create(){
		return new MultiCheckbox(...arguments);
	}
}