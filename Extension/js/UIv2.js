(function(){
	var machine = {
		/*
			Создание элемента DOE(DanilkinkinStudio Object Element)

			возвращает объект-обертку для DOM элементов

			*arguments(null) return object[tag "div", content "null"]
				пустой элемент

			*arguments(DOM element) return object[DOM element]
			 создаст обертку для данного элемента

			*arguments(object settings) return object[DOM element]
			 создаст обертку для данного элемента
		*/
		createElem: function(settings){

			var element;

			if(settings == undefined){
				//создание пустышки
				settings = {};
				element = document.createElement("div");
			}else
				if(settings.classList){
					//созднаие обертки
					element = settings;
				}else{
					//созднаие по параметрам
					if(typeof settings == "string"){
						let tag = settings;
						settings = {tag: tag};
					}else
					settings.tag   = (settings.tag)? settings.tag : "div";         //тип элемемента 	<TAG String>
					settings.attr  = (settings.attr) ? settings.attr 			   //список аттрибутов  [{<TAG String>, <VALUE String>}]
									                 : ([{tag: "", value: ""}]);   
					settings.style = (settings.style) ? settings.style : [""]	   //стил элемента      [<STYLE String>]
					settings.class = (settings.class)? settings.class : [""]       //класс элемена      [<STYLE String>]
					settings.content = (settings.content)? settings.content : []   //контент элемента   [<DOE element or TEXT String>]

					if(settings.toDOE) element = settings.toDOE;
					else element = document.createElement(settings.tag);
					settings.attr.forEach(function(object){
						if(object.tag != "") element.setAttribute(object.tag, object.value)
					});
					element.style = settings.style.join("");
					if(typeof settings.class == "string") element.className = settings.class;
					else 
						settings.class.forEach(function(className){
							if(className != "") element.classList.add(className);
						});
					if(typeof settings.content == "object"){ 
						if(settings.content.forEach) settings.content.forEach(function(content){
							if(content == null || content == undefined) return;
							if(typeof content == "object") element.appendChild(content.element); else element.innerHTML += content;
						});
						else element.appendChild(settings.content.element);
					}else element.innerHTML = settings.content+"";
				}

			settings.object = {
				element: element,
				setAttribute: function(key, value){
					if(value == undefined) element.removeAttribute(key);
					else element.setAttribute(key, value)
				},
				addClass: function(addClass, functionTimeOut, time){
					if(typeof addClass != "string")
						addClass.forEach(function(className){
							if(className == null || className == undefined) return
							element.classList.add(className);
						});
					else element.classList.add(addClass);
					if(functionTimeOut) setTimeout(function(){
						functionTimeOut(settings.object);
					}, (time)? time : 300);
				},
				removeClass: function(removeClass, functionTimeOut, time){
					if(typeof removeClass != "string")
						removeClass.forEach(function(className){
							element.classList.remove(className);
						});
					else element.classList.remove(removeClass);
					if(functionTimeOut) setTimeout(function(){
						functionTimeOut(settings.object);
					}, (time)? time : 300);
				},
				containsClass: function(searchClass){
					return element.classList.contains(searchClass)
				},
				changeStyle: function(styles, functionTimeOut, time){
					if(typeof styles == "string") element.style[styles] = "";
					else styles.forEach(function(style){element.style[style.tag] = style.value});
					if(functionTimeOut) setTimeout(function(){
						functionTimeOut(settings.object);
					}, (time)? time : 300);
				},
				remove: function(){
					element.remove();
				},
				isRemove: function(){
					return !element.parentNode
				},
				appendChild: function(child, functionTimeOut, time){
					var ths = this;
					if(typeof child == "object"){
						if(child.forEach) child.forEach(function(object){
							if(object == null || object == undefined) return;
							if(object.forEach) ths.appendChild(object); else element.appendChild(object.element);
						});
						else element.appendChild(child.element);					
					}else element.innerHTML = child+"";
					if(functionTimeOut) setTimeout(function(){
						functionTimeOut(settings.object);
					}, (time)? time : 300);
				},
				insertBefore: function(child, preChild){
					if(typeof child == "object") element.insertBefore(child.element, preChild.element);
					else element.innerHTML = child+"";
				},
				insertAfter: function(child, preChild){
					if(typeof child == "object"){
						var next = preChild.element.nextSibling;
						if (next) element.insertBefore(child.element, next);
						else element.appendChild(child.element);
					}else element.innerHTML = child+"";
				},
				clearContent: function(){
					element.innerHTML = "";
				},
				innerContent: function(child, functionTimeOut, time){
					this.clearContent();
					this.appendChild(child, function(){
						if(functionTimeOut) functionTimeOut(settings.object);
					}, time);
				}
			};

			if(settings.special) for(key in settings.special){
				element[key] = settings.special[key];
			}	

			return settings.object;
		},

		//--------------------------------------ГОТОВЫЕ МОДУЛИ------------------------------------------------------//

		/*
			Кнопка

			*arguments(object settings) return object[DOE element]
				settings - настройки кнопки
				click - функция нажатия кнопки
				hover - функция наведения курсора на кнопку(при наведении возвращает true, при отведении false) 

		*/
		createButton: function(settings){
			if(!settings) settings = {};
			if(!settings.settings) settings.settings = {};
			settings.settings.tag     = "button";		
			settings.isEnabled = (settings.settings.isEnabled == undefined)? true : settings.settings.isEnabled;
			//settings.isEnabled = false;
			settings.settings.class  += " DOE_button "+((!settings.isEnabled)? "distable" : "");
			settings.settings.content = (settings.settings.content)? settings.settings.content : "ОК";

			settings.click = (settings.click)? settings.click : function(){errorFunc("Для кнопки не назначена функция клика")};
			settings.hover = (settings.hover)? settings.hover : function(){/*errorFunc("Для кнопки не назначена функция наведения")*/};

			var button = machine.createElem(settings.settings);

			button.element.onclick 	   = function(event){if(settings.isEnabled) settings.click(event, button.element)};
			button.element.onmouseover = function(){if(settings.isEnabled) settings.hover(true)};
			button.element.onmouseout  = function(){if(settings.isEnabled) settings.hover(false)};
			if(settings.special) settings.special(button.element);

			button.distabled = function(state){
				settings.isEnabled = !state;
				if(settings.isEnabled) button.removeClass("distable");
				else button.addClass("distable");
			}

			return button;
		},

		/*
			Чек бокс

			*arguments(object settings) return object[DOE element]
				settings - настройки чек бокса
				click - функция нажатия чек бокса
				hover - функция наведения курсора на чек бокс(при наведении возвращает true, при отведении false) 

		*/
		createCheckBox: function(settings){
			if(!settings) settings = {};
			if(!settings.settings) settings.settings = {};

			settings.click = (settings.click)? settings.click : function(){errorFunc("Для чек бокса не назначена функция клика")};
			settings.hover = (settings.hover)? settings.hover : function(){/*errorFunc("Для кнопки не назначена функция наведения")*/};			
			settings.isEnabled = (settings.settings.isEnabled == undefined)? true : settings.settings.isEnabled;
			delete settings.settings.isEnabled;

			settings.settings.class += " DOE_checkBox "+((!settings.isEnabled)? "distable" : "");
			settings.settings.content = [
				machine.createElem({
					tag: "text",
					class: "DOE_textContent",
					content: (settings.content)? settings.content : "Выбирете пункт"
				}),
				machine.createElem({
					tag: "div",
					class: "DOE_checkBox_field"
				})
			];

			var checkBox = machine.createButton({
				click: function(){
					if(!settings.isEnabled) return;
					if(checkBox.isSelect){
						checkBox.removeClass("select");
					}else{
						checkBox.addClass("select");
					}
					checkBox.value = checkBox.isSelect = !checkBox.isSelect; 	
					settings.click(checkBox.isSelect);				
				},
				hover: function(){if(settings.isEnabled) settings.hover()},
				settings: settings.settings
			});
			
			checkBox.removeClass(["DOE_button"]);
			checkBox.isSelect = settings.isSelect;
			if(checkBox.isSelect) checkBox.addClass("select");

			checkBox.setValue = function(newValue){
				checkBox.value = newValue;
				if(!checkBox.value){
					checkBox.removeClass("select");
				}else{
					checkBox.addClass("select");
				}
				checkBox.isSelect = checkBox.value;
			}
			checkBox.setValue(settings.value);
			checkBox.distabled = function(state){
				settings.isEnabled = !state;
				if(settings.isEnabled) checkBox.removeClass("distable");
				else checkBox.addClass("distable");
			}

			return checkBox;
		},

		/*
			Свичер

			*arguments(object settings) return object[DOE element]
				settings - настройки свичера
				click - функция нажатия свичера
				hover - функция наведения курсора на свичер(при наведении возвращает true, при отведении false) 

		*/
		createSwitcher: function(settings){
			var switcher = machine.createCheckBox(settings);
			switcher.element.lastChild.appendChild(machine.createElem().element);
			switcher.addClass("DOE_swithcer");
			switcher.removeClass("DOE_checkBox");

			return switcher;
		},

		/* 
			Поле ввода

			*arguments(object settings) return object[DOE element]
				settings - настройки поля ввода

		*/
		createInput: function(settings){
			if(!settings) settings = {};
			if(!settings.settings) settings.settings = {};
			settings.settings.tag     = "input";
			settings.settings.class  += " DOE_input ";
			settings.settings.content = (settings.settings.content)? settings.settings.content : "";
			settings.placeholder = (settings.placeholder)? settings.placeholder : "";
			settings.settings.attr = (settings.settings.attr)? settings.settings.attr : [];
			settings.settings.attr.push({tag: "placeholder", value: settings.placeholder});

			var input = machine.createElem(settings.settings);
			input.element.value = settings.settings.content;

			if(settings.special) settings.special(input.element);			

			return input;
		},

		/*
			Зона ввода текста

			*arguments(object settings) return object[DOE element]
				settings - настройки зоны ввода текста

		*/
		createTextarea: function(settings){
			if(!settings) settings = {};
			if(!settings.settings) settings.settings = {};
			settings.settings.tag     = "textarea";
			settings.settings.class  += " DOE_textarea ";
			settings.settings.content = (settings.settings.content)? settings.settings.content : "";
			settings.placeholder = (settings.placeholder)? settings.placeholder : "";
			settings.settings.attr = (settings.settings.attr)? settings.settings.attr : [];
			settings.settings.attr.push({tag: "placeholder", value: settings.placeholder});

			var noteWraper = UI.createElem(settings.settings);

			noteWraper.setPlaceholder = function(newPlaceholder){
				noteWraper.setAttribute("placeholder", newPlaceholder);
			}

			return noteWraper;
		},

		/*
			Выпадающий список

			*arguments(object settings) return object[DOE element]
				settings - настройки списка

		*/
		createSelection: function(settings){			
			if(!settings) settings = {};
			if(!settings.settings) settings.settings = {};
			settings.value = (settings.value)? settings.value : 0;

			var hoverValue = settings.value;
			settings.settings.class += " DOE_selection";
			settings.settings.attr = (settings.settings.attr)? settings.settings.attr.concat({tag: "tabindex", value: 1}) : [{tag: "tabindex", value: 1}];
			var body = machine.createElem(settings.settings);		
			var sParamName = machine.createElem({tag: "h2", content: settings.options[settings.value]});
			var list = machine.createElem({class: "DOE_selection_list"});
			body.appendChild(sParamName);
			body.appendChild(machine.createElem({class: "DOE_selection_arrow"}));
			body.appendChild(list);
			body.value = settings.value;

			function loadItem(){
				list.clearContent();
				for(var i = 0; i<settings.options.length; i++){
					var li = machine.createElem({tag: "li", content: settings.options[i], class: ((i == settings.value)? "select" : "")});
					li = clickItem(li, i);
					list.appendChild(li);
				}
				function clickItem(li, numb){
					li.element.onclick = function(){
						var oldVal = settings.value;
						settings.value = numb;
						sParamName.appendChild(settings.options[settings.value]);
						if(oldVal != numb) settings.click(numb, body);	
						if(settings.click_alw) settings.click_alw(numb, body);											
					}
					if(settings.hover) li.element.onmouseover = function(){
						hoverValue = numb;
						settings.hover(numb);					
					}
					return li;
				}
			}
			body.element.onclick = function(){
				if(settings.state == "distable") return;
				if(body.containsClass("active")){
					setTimeout(function(){if(!body.containsClass("active")) list.clearContent();}, 300);
					body.removeClass("active");
				}else{
					loadItem();
					body.addClass("active");
				}
				body.element.onblur = function(){
					setTimeout(function(){if(!body.containsClass("active")) list.clearContent();}, 300);
					body.removeClass("active");
					if((settings.value != hoverValue)&&(settings.hover)) settings.hover(settings.value, body);
				}
			}
			body.setOptions = function(arr){settings.options = arr;};
			body.setValue = function(newValue){
				settings.value = newValue;
				sParamName.innerContent(settings.options[settings.value]);	
			};
			return body;
		},

		/*
			Информация для элемента

			*arguments(object settings) return object[DOE element]
				settings - настройки обертки

		*/
		createInfoWrap: function(settings){
			var tdArr = [machine.createElem({
				tag: "td",
				class: "first_td "+settings.classText,
				style: settings.styleText,
				content: (settings.text)? settings.text : ""
			})];
			if(settings.elem.forEach){
				settings.elem.forEach(function(elem, i){
					tdArr.push(machine.createElem({
						tag: "td",
						content: settings.elem[i]
					}));
				});				
			}else{
				tdArr.push(machine.createElem({
					tag: "td",
					content: settings.elem
				}));
			}

			return  machine.createElem({
				tag: "table",
				class: "DOE_infoWraper "+settings.class,
				style: settings.style,
				content: tdArr			
			});
		}
	};

	window.UI = machine;

	function errorFunc(textError){
		console.error("ERROR: "+textError);
	}
}())