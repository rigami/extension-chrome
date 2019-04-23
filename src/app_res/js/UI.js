class UI{
	constructor(tag){
		this._dom = document.createElement(tag || "div");
	}

	get html(){
		return this._dom;
	}

	get destroy(){
		this._dom.remove();
		return null;
	}

	class(cls){
		if(cls) this._dom.className = cls;
		let _dom = this._dom;
		return new class UIClass extends UI{
			constructor(tag){
				super();
				this._dom = _dom;
			}
			add(cls){
				this._dom.classList.add(cls);
				return this;
			}
			remove(cls){
				this._dom.classList.remove(cls);
				return this;
			}
		};
	}

	style(stl){
		if(stl) this._dom.style = stl;
		return new class UIStyle extends UI{
			constructor(tag){
				super();
				this._dom = _dom;
			}
			add(key, value){
				this._dom.style[key] = value;
				return this;
			}
			remove(key){
				this._dom.style[key] = "";
				return this;
			}
		};
	}

	attribute(attr){
		return new class UIAttribute extends UI{
			constructor(tag){
				super();
				this._dom = _dom;
			}
			add(key, value){
				return this;
			}
			remove(key){
				return this;
			}
		};
	}

	event(action, callback){
		return new class UIEvent extends UI{
			constructor(tag){
				super();
				this._dom = _dom;
			}
			add(action, callback){
				return this;
			}
			remove(action){
				return this;
			}
			call(action, callback){
				if(callback){
					callback(()=>this._dom[action]());
				}else{
					this._dom[action]()
				}								
				return this;
			}
		};
	}

	listener(action, callback){
		return new class UIEvent extends UI{
			constructor(tag){
				super();
				this._dom = _dom;
			}
			add(action, callback){
				return this;
			}
			remove(action, callback){
				return this;
			}
		};
	}

	append(UIElement){
		return new class UIEvent extends UI{
			constructor(tag){
				super();
				this._dom = _dom;
			}
			before(UIElement, AnchorElement){
				return this;
			}
		};
	}

	content(UIorText){
		return new class UIContent extends UI{
			constructor(tag){
				super();
				this._dom = _dom;
			}
			text(cls){
				return this;
			}
			clear(cls){
				return this;
			}
		};
	}

	static replace(UIa, UIb){
		return this;
	}

	static create(){
		return new UI(...arguments);
	}
}