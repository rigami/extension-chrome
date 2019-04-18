window.GUI = new GUI();

function GUI(){
	this.__proto__ = window.UIMethods;

	this.active 	= true;
	this.helpTitle 	= null;

	var helperShowTimeOut 	= null;
	var helper 				= new UI("div").class("gui-helper hide-hepler");
	var mouseOffset 		= null;
	var offset 				= null;
	var helperElm 			= null;
	var blockHelper 		= false;

	addEventListener("mouseout", (e) => {
		if(e.pageY <= 0 || e.pageX <= 0 || document.body.clientWidth <= e.pageX || document.body.clientHeight <= e.pageY) endMoveHelper();
	});
	addEventListener("mouseup", endMoveHelper, false);

	this.updateHelpTitle = function(text){
		text = text || this.helpTitle;
		if(helper) helper.clearContent().text(text);

		return this;
	}	
	this.disabled = function(){
		this.active = false;
		this.element.classList.add("disabled");

		return this;
	}
	this.enabled = function(){
		this.active = true;
		this.element.classList.remove("disabled");

		return this;
	}

	this.addEvent = function(eventKey, eventValue){
		this.element[eventKey] = function(e){
			if(this.active) eventValue(e, this);
		}.bind(this);
		return this;
	}
	this.showHelp = function(text){		
		text = text || this.helpTitle;
		if(!text) return;
		helper.clearContent().text(text);
		document.body.appendChild(helper.getHTML());	

		mouseOffset = null;

		if(!helperElm){
			if(helperShowTimeOut) clearTimeout(helperShowTimeOut);
			helperShowTimeOut = null;			
			helperShowTimeOut = setTimeout(function(){	
				mouseOffset = null;
				helper.removeClass("hide-hepler");
				offset = {
					x: helperElm.getBoundingClientRect().left+helperElm.clientWidth/2-helper.getHTML().clientWidth/2,
					y: helperElm.getBoundingClientRect().top+helperElm.clientHeight+10
				};

				let top = 0;
				let left = 0;

				top = helperElm.getBoundingClientRect().bottom+10;
				if(top+helper.getHTML().clientHeight >= document.body.clientHeight){
					top = helperElm.getBoundingClientRect().top-helper.getHTML().clientHeight-10
				}

				left = helperElm.getBoundingClientRect().left+helperElm.clientWidth/2-helper.getHTML().clientWidth/2;
				if(left <= 10){
					left = 10; 
				}
				if(left+helper.getHTML().clientWidth >= document.body.clientWidth-10){
					left = document.body.clientWidth-helper.getHTML().clientWidth-10
				}

				helper.addStyle("top", top+"px");
				helper.addStyle("left", left+"px");
				//console.log("Show helper");
	
				addEventListener("mousemove", moveHelper, false);			
			}.bind(this), 400);
		}

		blockHelper = false;
		helperElm = this.element;			

		this.addEvent("onmouseleave", function(){
			blockHelper = true;
			setTimeout(() => {
				if(helperElm == this.element) endMoveHelper();				
			}, 300);			
		}.bind(this));				
	}	

	function moveHelper(e){
		if(blockHelper) return;
		if(!mouseOffset) mouseOffset = {x: e.clientX, y: e.clientY};

		let top = 0;
		let left = 0;

		top = helperElm.getBoundingClientRect().bottom+10;
		if(top+helper.getHTML().clientHeight >= document.body.clientHeight){
			top = helperElm.getBoundingClientRect().top-helper.getHTML().clientHeight-10
		}

		left = e.clientX-mouseOffset.x/*+offset.x*/+helperElm.getBoundingClientRect().left+helperElm.clientWidth/2-helper.getHTML().clientWidth/2;
		if(left <= 10){
			left = 10; 
		}
		if(left+helper.getHTML().clientWidth >= document.body.clientWidth-10){
			left = document.body.clientWidth-helper.getHTML().clientWidth-10
		}

		helper.addStyle("top", top+"px");
		helper.addStyle("left", left+"px");
		//console.log("Move")	
	}

	function endMoveHelper(e){
		if(!helperElm) return;
		if(helperShowTimeOut) clearTimeout(helperShowTimeOut);
		helperShowTimeOut = null;
		mouseOffset = null;
		helper.addClass("hide-hepler");
		//console.log("Hide helper")
		removeEventListener("mousemove", moveHelper, false);
		helperElm = null;
	}
}

function Button(params, ico, label, title){
	this.__proto__ = window.GUI;

	var dom_label = label? new UI("span").text(label) : null;

	var dom_loader = null;
	this.active = false;

	this.setLabel = function(newLabel){
		if(!label){
			label = newLabel;
			dom_label = new UI("span").text(label);
			this.append(dom_label);
		}else{
			label = newLabel;
			dom_label.clearContent().text(label);
		}

		return this;
	}.bind(this);

	this.loadedStart = function(){
		this.active = false;
		this.element.classList.add("disabled");

		dom_loader = new UI("svgSprite", {svgSprite: "app_res/img/icons.svg#shape-circle"}).addClass("gui-loader").addAttribute("pathLength", 10)
		this.append(dom_loader)

		return this;
	}.bind(this);

	this.loadedEnd = function(){
		this.enabled();
	}.bind(this);

	this.enabled = function(){
		this.active = true;
		this.element.classList.remove("disabled");
		if(dom_loader){
			dom_loader.destroy();
			dom_loader = null;
		}

		return this;
	}.bind(this);

	this.onclick = function(f){
		this.enabled();
		this.addEvent("onclick", f);

		return this;
	}.bind(this);

	this.element = new UI("button", params)
					.addClass("button")
					.addClass("disabled")
					.append(ico? new UI("svgSprite", {svgSprite: ico}) : null)
					.append(dom_label)
					.addEvent("onmouseenter", function(){
						this.showHelp();
					}.bind(this))			
					.getHTML();

	this.helpTitle = title;
}

function Input(params, placeholder, defaultValue){
	this.__proto__ = window.GUI;

	let focused = false;

	this.value = function(){
		return this.inputElem.value;
	}.bind(this);

	this.clear = function(){
		this.inputElem.value = "";

		return this;
	}

	this.oninput = function(callback){
		this.addEvent("oninput", function(){
			callback(this.inputElem.value, this.inputElem)
		}.bind(this));

		return this;
	}.bind(this);

	this.onchange = function(callback){		
		this.addEvent("onchange", function(){
			this.removeClass("error");
			if(this.inputElem.value == "" && !focused){
				this.removeClass("select");
			}else{
				this.addClass("select");
			}
		
			callback(this.inputElem.value, this.inputElem)
		}.bind(this));

		return this;
	}.bind(this);

	this.onenter = function(callback){
		this.addEvent("onkeyup", function(e){
			this.removeClass("error");
			if(this.inputElem.value == "" && !focused){
				this.removeClass("select");
			}else{
				this.addClass("select");
			}
		
			if(e.keyCode == 13) callback();
		}.bind(this));

		return this;
	}.bind(this);

	this.onctrlenter = function(callback){
		this.addEvent("onkeyup", function(e){
			if(e.keyCode == 13 && e.ctrlKey) callback();
		}.bind(this));

		return this;
	}.bind(this);

	this.addEvent = function(eventKey, eventValue){
		this.inputElem[eventKey] = eventValue;
		return this;
	}
	this.removeEvent = function(eventKey){
		delete this.inputElem[eventKey];
		return this;
	}

	this.errorGlow = function(){
		this.addClass("error");
	}.bind(this);

	this.getInput = function(){
		return this.inputElem;
	}.bind(this);
	

	if(params && params.textarea){
		this.element = this.inputElem = new UI("textarea", params)
						.addClass("textarea")
						.addAttribute("placeholder", placeholder? placeholder : "")
						.getHTML();
		if(defaultValue) this.element.value = defaultValue;
	}
	else{
		this.inputElem = new UI("input")
								.addAttribute("id", placeholder+"_input_GUI")
		this.element = new UI("div", params)
						.addClass("input")
						.append(this.inputElem)
						.append(
							new UI("label")
								.text(placeholder)
								.addAttribute("for", placeholder+"_input_GUI")
						)
						.getHTML();
		this.inputElem = this.inputElem.getHTML();	
		if(defaultValue) this.inputElem.value = defaultValue;		
	}

	this.addEvent("onfocus", function(e){
		this.addClass("select");
		this.addClass("select-focus");
		focused = true;
	}.bind(this));

	this.addEvent("onblur", function(e){
		if(this.inputElem.value == "") this.removeClass("select");
		this.removeClass("select-focus");
		focused = false;
	}.bind(this));

	this.addEvent("oninput", function(){
		this.removeClass("error");
		if(this.inputElem.value == "" && !focused){
			this.removeClass("select");
		}else{
			this.addClass("select");
		}
	}.bind(this));

	this.addEvent("onchange", function(){
		this.removeClass("error");
		if(this.inputElem.value == "" && !focused){
			this.removeClass("select");
		}else{
			this.addClass("select");
		}
	}.bind(this));

	if(defaultValue) this.element.classList.add("select");
}

function DropDown(params, options, select){
	this.__proto__ = window.GUI;

	this.isOpen = false;

	options = options? options : [];

	select = select != undefined? select : 0;

	var onSelectCallback = function(){

	}

	this.setOptions = function(newOptions){
		options = newOptions;
		if(this.isOpen){
			closeDrop();
			openDrop();
		}
	}

	this.setValue = function(newValue){
		select = newValue;
		dom_select_label.clearContent().text(options[select]);
	}

	this.onselect = function(callback){
		onSelectCallback = callback;
		return this;
	}

	var dom_select_label = new UI("span").text(options.length != 0? options[select] : "");

	var dom_list = new UI("div").class("drop-down_list")

	this.element = new UI("div", params)
					.addClass("drop-down")
					.addAttribute("tabindex", -1)
					.append(dom_select_label)
					.append(new UI("svgSprite", {svgSprite: "app_res/img/icons.svg#arrow-small-down"}))
					.append(dom_list)
					.addEvent("onclick", function(){
						if(this.isOpen) closeDrop.bind(this)();
						else openDrop.bind(this)();
					}.bind(this))
					.addEvent("onblur", closeDrop.bind(this))
					.getHTML();

	function openDrop(){
		if(this.isOpen) return;
		this.isOpen = true;
		this.addClass("drop-down-open");
		dom_list.clearContent();
		for(let i = 0; i<options.length; i++){
			dom_list.append(
				new UI("li")
					.text(options[i])
					.class(select == i? "select" : "")
					.addEvent("onclick", function(){
						select = i;
						onSelectCallback(options[select], select)
						dom_select_label.clearContent().text(options[select]);
					})
			)
		}
	}

	function closeDrop(){
		if(!this.isOpen) return;
		this.isOpen = false;
		this.removeClass("drop-down-open");
	}
}