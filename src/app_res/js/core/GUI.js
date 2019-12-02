import UI from "./UI.js";

class GUI extends UI{
	constructor(props = {}){

		const {
			enabled = true,
			hintText = "",
			UIProps
		} = props;

		super(UIProps);

		this._hintText = hintText;
		this._enabled = enabled;
	}

	get enabled(){
		return this._enabled;
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
			if(!callback) 
				console.error("UI: Not find callback function for event. "
					+"Method 'event' should be called as 'event(actionName, callbackAction)'");
			else this._root._dom["on"+action] = (e)=>{callback(e, this)};
		}
		let _root = this._root;

		return new class UIEvent extends UI{
			constructor(){
				super();
				this._root = _root;
			}
			add(action, callback){
				if(!_root._customEvents[action]) _root._customEvents[action] = new CustomEvent(action, arguments[3] || {});
				_root._dom.addEventListener(action, (e)=>{callback(e, _root)}, arguments[2] || false);

				return this;
			}
			remove(action, callback){
				if(action){
					if(callback) _root._dom.removeEventListener(action, callback, arguments[2] || false);
					else _root._dom["on"+action] = null;
				}else console.error("UI: Not find action name. Method 'remove' should be called as 'remove(actionName[, callbackAction])'");

				return this;
			}
			call(action, result){
				if(action){
					if(_root._customEvents[action]) _root._dom.dispatchEvent(_root._customEvents[action]);
					else{
						if(result) result(()=>_root._dom[action]());					
						else _root._dom[action]();
					}	
				}else console.error("UI: Not find action name. Method 'call' should be called as 'call(actionName[, callbackActionResult])'");							

				return this;
			}
		};
	}

	static getNamespace(className){
		return `gui-${className}`;
	}
}

export default GUI;