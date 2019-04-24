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
			constructor(){
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
		let _dom = this._dom;
		return new class UIStyle extends UI{
			constructor(){
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

	attribute(key, value){
		if(key) this._dom.setAttribute(key, value || "");
		let _dom = this._dom;
		return new class UIAttribute extends UI{
			constructor(){
				super();
				this._dom = _dom;
			}
			add(key, value){
				if(key) this._dom.setAttribute(key, value || "");
				return this;
			}
			remove(key){
				if(key) this._dom.removeAttribute(key);
				return this;
			}
		};
	}

	event(action, callback){
		if(action){
			if(callback) this._dom[action] = callback;
			else this._dom[action]();
		}
		let _dom = this._dom;
		return new class UIEvent extends UI{
			constructor(){
				super();
				this._dom = _dom;
			}
			add(action, callback){
				this._dom[action] = callback;
				return this;
			}
			remove(action){
				this._dom[action] = null;
				return this;
			}
			call(action, result){
				if(result){
					result(()=>this._dom[action]());
				}else{
					this._dom[action]()
				}								
				return this;
			}
		};
	}

	//TODO
	listener(action, callback){
		let _dom = this._dom;
		return new class UIEvent extends UI{
			constructor(){
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

	append(content){
		if(content){
			if(typeof content == "object") this._dom.appendChild(content.html || content);
			else this._dom.innerHTML += content;
		}		
		let _dom = this._dom;
		return new class UIAppend extends UI{
			constructor(){
				super();
				this._dom = _dom;
			}
			before(content){
				if(typeof content == "object") this._dom.insertBefore(content.html || content, this._dom.html.firstChild())
				else this._dom.innerHTML = content + this._dom.innerHTML;
				return this;
			}
			text(str){
				this._dom.textContent += str;
				return this;
			}
		};
	}

	content(UIorText){
		let _dom = this._dom;
		return new class UIContent extends UI{
			constructor(){
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