(() => {
	window.UIMethods = new UIMethods();
	function UIMethods() {
		this.class = function(cls){
			if(cls) this.element.className = cls;
			return this;
		}
		this.addClass = function(cls){
			if(cls) this.element.classList.add(cls);
			return this;
		}
		this.removeClass = function(cls){
			if(cls) this.element.classList.remove(cls);
			return this;
		}
		//Style
		this.addStyle = function(styleKey, styleValue){
			this.element.style[styleKey] = styleValue;
			return this;
		}
		this.removeStyle = function(styleKey){
			this.element.style[styleKey] = "";
			return this;
		}
		//Attribute
		this.addAttribute = function(attrKey, attrValue){
			this.element.setAttribute(attrKey, attrValue)
			return this;
		}
		this.removeAttribute = function(attr){
			this.element.removeAttribute(attr);
			return this;
		}
		//Events
		this.addEvent = function(eventKey, eventValue){
			this.element[eventKey] = eventValue;
			return this;
		}
		this.addEventR = function(eventKey, eventValue){
			this.element[eventKey] = function(e){
				eventValue(e, this);
			}.bind(this);
			return this;
		}
		this.removeEvent = function(eventKey){
			delete this.element[eventKey];
			return this;
		}
		//Content
		this.clearContent = function(){
			this.element.innerHTML = "";
			return this;
		}
		this.text = function(text){
			this.element.textContent += text;
			return this;
		}
		this.innerHTML = function(html){
			this.element.innerHTML += html;
			return this;
		}
		this.append = function(newElement){
			if(newElement) this.element.appendChild(newElement.getHTML());
			return this;
		}
		this.appendBefore = function(newElement, referenceElement){
			if(newElement) this.element.insertBefore(newElement.getHTML(), referenceElement? referenceElement.getHTML() : this.element.firstChild);
			return this;
		}
		this.remove = function(removeElement){
			removeElement.destroy();
			return this;
		}
		this.destroy = function(){
			this.element.remove();
			return this;
		}
		this.getHTML = function(){
			return this.element;
		}
		this.click = function(){
			this.element.click();
			return this;
		}
		this.focus = function(){
			this.element.focus();
			return this;
		}
	}
})()

function UI(type, param){
	this.__proto__ = window.UIMethods;
	this.element = null;
	if(type != "svgSprite")
		this.element = document.createElement(type);
	else{
		this.element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		this.element.className = "texxt";
		let svgUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
		svgUse.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", param.svgSprite);
		this.element.append(svgUse);
	}
	if(param){
		if(param.class) this.element.className = param.class;

		if(param.attr){
			if(param.attr.forEach)
				for(i=0; i<param.attr.length; i++)
					this.element.setAttribute(param.attr[i].key, param.attr[i].value);
			else
				this.element.setAttribute(param.attr.key, param.attr.value);
		}
		
		if(param.style){
			if(param.style.forEach)
				for(i=0; i<param.style.length; i++)
					this.element.style[param.style[i].key] = param.style[i].value;
			else
				this.element.style[param.style.key] = param.style.value;
		}

		if(param.content){
			if(!param.contentHTML) this.element.textContent = param.content;
			else this.element.innerHTML = param.content;
		}
	}
}

