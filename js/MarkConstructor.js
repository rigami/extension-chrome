(function(){
	var machine = function(){		
		this.queueRequest = 0;
		this.settings;
		this.timerInput;
	};
	machine.prototype = new Object();

	machine.prototype.setProp = function(settingsG){
		this.settings = settingsG;
	}

	machine.prototype.checkURL = function(url){
		var ths = this;
		ths.queueRequest++;
		nQueue = ths.queueRequest;
		clearTimeout(ths.timerInput);
		ths.timerInput = setTimeout(function(){
			ths.settings.list.addClass("hide");
			checkURL(url, ths, nQueue);
		}, 400);		
	};

	machine.prototype.createMarksList = function(site_obj){
		var ths = this;
		createMarksList(site_obj, ths, 0);
	};

	/*machine.prototype.addMarkToList = function(obj){
		var ths = this;
		createMarksList(site_obj, ths, 0);
	};*/

	machine.prototype.getImagesURL = function(url, ths, queue, callback){
		console.log(ths)
		//var ths = this;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = "document";

		xhr.onload = function(){
			if(xhr.status == 200){
				if(!this.responseXML.head){
					if(queue == ths.queueRequest) callback([], queue);
					return;
				}
				var list =  Array.from(this.responseXML.head.querySelectorAll(
					'[rel="shortcut icon"],'+
					'[rel="shortcut"],'+
					'[rel="apple-touch-icon"],'+
					'[itemprop="image"],'+
					'[rel="icon"],'+
					'[property="og:image"],'+
					'[name="og:image"],'+
					'[rel="image_src"],'+
					'[property="twitter:image"],'+
					'[name="twitter:image"],'+
					'[name="yandex-tableau-widget"],'+
					'[name="msapplication-TileImage"],'+
					'.light-data')).map(function(elem){
						switch(elem.nodeName){
							case "LINK": return elem.href;
							case "META": return elem.content;
							//case "SCRIPT": return JSON.parse(elem.innerHTML).logo;
							default: return (elem.href)? elem.href : undefined;
						}
				});			
				list = list.filter(e=>e);	
				//console.log(list);
				list.push("/favicon.ico");
				list = list.map(link => (~link.indexOf("http")? link : ((link[0] == "/")? url.substring(0, url.indexOf("/", 8)) : url)+link));
				/*list = list.filter(function(e, i){
					return !list.some((el, n)=>((n==i)? false : el == e));
				});*/
				var indList = [];
				list.forEach(function(e){
					if(!indList.some(el=>(el == e))) indList.push(e);
				});
				//console.log(queue+"  "+ths.queueRequest)
				if(queue == ths.queueRequest) callback(indList, queue);
				//console.log(indList);
			}
		}
		xhr.send();
	}

	function checkURL(url, ths, nQueue){
		if(nQueue != ths.queueRequest) return;
		console.log("CHECKING URL: "+url);
		resetThis(ths);
		if(url == ""){
			ths.settings.preview.previewList.addClass("hide", function(){
				ths.settings.preview.previewList.innerContent(UI.createElem({
					tag: "h2",
					class: "mark_create_help",
					content: "Начните вводить адрес сайта"
				}), function(){
					ths.settings.preview.previewList.removeClass("hide");
				});
			});		
			
			return;
		}
		var directLink = (url.indexOf("http") == 0)? url : "http://"+url;
		getResults(url, directLink, ths.queueRequest);

		function getResults(url, directLink, queue){
			console.log("LOAD RESULTS");
			var results = {
				isDirectLinkFind: false,
				idWebSearchFind: false,
				stage: 0,
				addDirectLink: function(obj, queue){
					console.log("Add direct link");
					if(queue != ths.queueRequest){
						xhrWebSearch.abort();
						return;
					}
					results.directLink.innerContent((!obj)? "Прямая ссылка не распознона" : "Прямая ссылка");
					if(!obj) return;
					console.log(ths.settings.list)
					ths.settings.list.insertAfter(UI.createElem({
						tag: "li",
						content: [
							UI.createElem({
								class: "search_result_list_name",
								content: obj.name
							}),
							UI.createElem({
								class: "search_result_list_url",
								content: obj.url
							})
						],
						special: {
							onclick: function(){
								createMarksList(obj, ths, queue);
							}
						}
					}), results.directLink);
					console.log(results)
					results.isDirectLinkFind = true;
				},
				addWebSearch: function(list, queue){
					console.log("Add web search")
					if(queue != ths.queueRequest){
						xhrDirectCheck.abort();
						return;
					}
					results.webSearch.innerContent((list.length == 0)? "В сети ничего не найдено" : "Результаты в сети");
					if(list.length == 0) return;
					list.forEach(function(obj){
						ths.settings.list.appendChild(UI.createElem({
							tag: "li",
							content: [
								UI.createElem({
									class: "search_result_list_name",
									content: obj.name
								}),
								UI.createElem({
									class: "search_result_list_url",
									content: obj.url
								})
							],
							special: {
								onclick: function(){
									createMarksList(obj, ths, queue);
								}
							}
						}))
					});
					console.log(results)
					results.idWebSearchFind = true;
				},
				directLink: UI.createElem({
					tag: "li",
					class: "search_result_list_type",
					content: "Проверка прямой ссылки..."
				}),
				webSearch: UI.createElem({
					tag: "li",
					class: "search_result_list_type",
					content: "Поиск в сети..."
				}),
				endSearch: function(queue){
					if(queue != ths.queueRequest){
						xhrWebSearch.abort();
						xhrDirectCheck.abort();
						results = null;
						return;
					}
					ths.settings.list.removeClass("hide");
					ths.settings.preview.previewList.addClass("hide", function(){
						ths.settings.preview.previewList.innerContent(UI.createElem({
							tag: "h2",
							class: "mark_create_help",
							content: (!results.isDirectLinkFind && !results.idWebSearchFind)? "Ничего не найдено" : "Выберете нужный сайт из списка"
						}), function(){
							ths.settings.preview.previewList.removeClass("hide");
						});
					});
				},
				createList: function(isFind){					
					ths.settings.list.clearContent();
					ths.settings.list.removeClass("hide");
					ths.settings.list.appendChild(results.directLink);
					ths.settings.list.appendChild(results.webSearch);
				}
			}
			//Поиск в интернете
			let xhrWebSearch = new XMLHttpRequest();
			xhrWebSearch.open('GET', "https://duckduckgo.com/lite/?q="+url+"&kl=ru-ru&kp=-2&kz=-1&kc=-1&kaf=1&kac=-1&kd=-1&kh=1&kg=g&k1=-1", true);
			xhrWebSearch.responseType = "document";

			xhrWebSearch.onload = function(){
				if(xhrWebSearch.status != 200) return;
				console.log("STAGE: "+results.stage)
				if(results.stage == 0) results.createList();
				results.stage++;
				if(results.stage == 2) results.endSearch(queue);
				let list =  Array.from(this.responseXML.body.querySelectorAll(".result-link")).splice(0, 5).map(function(a){
					return {
						"url": a.href,
						"name": a.textContent
					};
				});
				results.addWebSearch(list, queue);
				//callback(list, queue);	
			}
			xhrWebSearch.onerror = xhrWebSearch.ontimeout = function(){
				//if(xhr.status < 300) return;
				console.log("Неудается получить доступ к сайту");
				if(results.stage == 0) results.createList();
				results.stage++;
				results.addWebSearch([], queue);
				if(results.stage == 2) results.endSearch(queue);
				errorLoad();
			}
			xhrWebSearch.timeout = 10000;
			xhrWebSearch.send();

			//Прямая проверка
			let xhrDirectCheck = new XMLHttpRequest();

			xhrDirectCheck.onload = function(){
				if(xhrDirectCheck.status != 200) return;
				console.log("STAGE: "+results.stage)
				if(results.stage == 0) results.createList();
				results.stage++;
				if(results.stage == 2) results.endSearch(queue);
				/*let list =  Array.from(this.responseXML.body.querySelectorAll(".result-link")).splice(0, 5).map(function(a){
					return {
						"url": a.href,
						"name": a.textContent
					};
				});*/
				//callback(list, queue);
				results.addDirectLink({
					name: xhrDirectCheck.responseXML.title,
					url:  xhrDirectCheck.responseURL
				}, queue);
			}
			xhrDirectCheck.onerror = xhrDirectCheck.ontimeout = function(){
				//if(xhr.status < 300) return;
				console.log("Неудается получить дотуп к сайту");
				if(results.stage == 0) results.createList();
				results.stage++;
				results.addDirectLink(null, queue);
				if(results.stage == 2) results.endSearch(queue);
				errorLoad();
			}
			xhrDirectCheck.timeout = 10000;			
			try{
				xhrDirectCheck.open('GET', directLink, true);
			}catch(e){
				xhrDirectCheck.onerror();
			}
			xhrDirectCheck.responseType = "document";
			xhrDirectCheck.send();

			function errorLoad(){
				/*ths.settings.preview.previewList.addClass("hide", function(){
					ths.settings.preview.previewList.innerContent(UI.createElem({
						tag: "h2",
						class: "mark_create_help",
						content: "Неудается получить доступ к сайту"
					}), function(){
						ths.settings.preview.previewList.removeClass("hide");
					});
				});*/
			}

			
		}
	}

	function createMarksList(obj, ths, queue){
		console.log(ths)
		ths.settings.url.element.value = obj.url;
		ths.settings.name.element.value = obj.name;
		//return;
		if(obj.name.length > 25)
			obj.name = obj.name.substring(0, 25)+"...";
		else
			obj.name = obj.name;
		ths.settings.list.clearContent();
		ths.__proto__.getImagesURL(obj.url, ths, queue, function(imgList){
			console.log(imgList)
			imgList.push(null);
			ths.settings.preview.previewList.addClass("hide", function(){
				ths.settings.preview.previewList.innerContent(UI.createElem({
					tag: "h2",
					class: "mark_create_help",
					content: "Выбере понравившуюся плитку"
				}), function(){
					ths.settings.preview.previewList.removeClass("hide");
				});
				ths.settings.preview.images = imgList.map((url, i)=>generateMark(url, obj.name, i, ths));
				ths.settings.preview.images.forEach(function(obj){
					ths.settings.preview.previewList.appendChild(obj.element);
				});
				ths.settings.preview.baseColor = {r: 0, g:0, b:0, count: 0};
				editIamges(ths.settings.preview.images, 0, ths);
			});
		});
		console.log(obj);
	}

	function generateMark(url, name, nowGen, ths){
		var image = UI.createElem({class: "icon"});
		var name = UI.createElem({tag: "h1", content: name});
		var spinner = UI.createElem({
			class: "load_spinner"
		});
		var mark = UI.createElem({
			class: "mark_full loading",
			content: spinner,
			special: {
				onmouseup: function(event){
					if(ths.settings.preview.select == nowGen){
						ths.settings.preview.select = undefined;
						ths.settings.saveButton.distabled(true);
						ths.settings.preview.images.forEach(function(obj, i){
							ths.settings.preview.images[i].element.removeClass("distable");
						});
						return;
					}
					ths.settings.preview.select = nowGen;
					ths.settings.saveButton.distabled(false);
					ths.settings.preview.images.forEach(function(obj, i){
						if(i != nowGen) ths.settings.preview.images[i].element.addClass("distable");
						else ths.settings.preview.images[i].element.removeClass("distable");
					});
					//if(event.button == 0) //select
				}
			}
		});

		return {
			element: mark,
			image: url,
			baseColor: null,
			setImage: function(img){
				console.log(img)				
				if(img != null) image.changeStyle([{tag: "backgroundImage", value: "url('"+img.toDataURL("image/png")+"')"}]);
				mark.addClass("hide_content", function(){
					mark.removeClass("loading");
					mark.innerContent(((img != null)? [image, name] : name), function(){
						mark.removeClass("hide_content");
					});
				});				
			},
			setName: function(newName){
				name.innerContent(newName);
			},
			setBaseColor: function(color){
				if(color == null){
					mark.changeStyle("backgroundColor");
					mark.removeClass("light");
				}else{
					mark.changeStyle([{tag: "backgroundColor", value: color}]);
					mark.addClass("light");
				}				
			},
			remove: function(){
				mark.addClass("hide", function(){
					mark.remove();
				});		
			}
		}
	}

	function editIamges(queue, nowEdit, ths){
		/*8px first level 5px second level*/
		console.log("--START EDIT IMAGE "+(nowEdit+1)+"/"+queue.length+"----");
		console.log("url: "+queue[nowEdit].image);
		if(queue[nowEdit].image == null){
			queue[nowEdit].setImage(null);
			if(nowEdit+1 < queue.length) editIamges(queue, nowEdit+1, ths);
			else getBaseColor(ths.settings.preview.baseColor);
			return;
		}
		img = document.createElement("img");
		img.setAttribute("src", queue[nowEdit].image);
		img.setAttribute('crossOrigin', 'anonymous');
		img.onload = function(){
			//Отрисовка
			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");
		    canvas.width = img.width;
		    canvas.height = img.height;
		    ctx.drawImage(img, 0, 0);
		    
		    //Обрезка изображения
		    if(img.width != img.height){
		    	var size = (img.width<img.height)? img.width : img.height;
				var oc   = document.createElement('canvas');
				var octx = oc.getContext('2d');
				var canvasResize = document.createElement("canvas");
				var ctxResize = canvasResize.getContext("2d");
				if(canvas.width/canvas.height < 1.7730496453900708){
					canvasResize.width = size;
					canvasResize.height = size/canvas.width*canvas.height;
				}else{
					canvasResize.width = size/canvas.height*canvas.width;
					canvasResize.height = size;
				}		
				ctxResize.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, canvasResize.width, canvasResize.height);
				oc.width  = size;
				oc.height = size;
				if(canvas.width/canvas.height < 1.7730496453900708){
					octx.drawImage(canvasResize, 0, -(canvasResize.height-size)*0.5, canvasResize.width, canvasResize.height);
				}else{
					octx.drawImage(canvasResize, -(canvasResize.width-size)*0.5, 0, canvasResize.width, canvasResize.height);
				}
				canvas.width = canvas.height = size;
				ctx.drawImage(oc, 0, 0);
			}

			//Изменение размера
			var oc = document.createElement('canvas');
			var octx = oc.getContext('2d');
			if(canvas.width > 48){
				oc.width = oc.height = 48;
				octx.imageSmoothingQuality = "high";
				octx.drawImage(canvas, 0, 0, 48, 48);				
			}else{
				oc.width = oc.height = 48;
				octx.drawImage(canvas, (48-canvas.width)/2, (48-canvas.height)/2);
			}

			//Извлечение основных цветов
			canvas.width = canvas.height = 16;
			ctx.beginPath();
			ctx.rect(0, 0, 16, 16);
			ctx.fillStyle = "white";
			ctx.fill();
			ctx.drawImage(oc, 0, 0, 16, 16);
			console.log(canvas.toDataURL("image/png"))
			var colors = ctx.getImageData(0,0,16,16).data;
			var baseColors = {};
			for(var i = 0; i<1024; i+=4){
				var color = rgbToHex(colors[i], colors[i+1], colors[i+2]);
				if(!baseColors[color]) baseColors[color] = 1;
				else baseColors[color]++;
			}			
			colors = [];
			for(var key in baseColors){
				colors[baseColors[key]] = key;
			}
			baseColors = colors.filter(el => el).reverse();
			//console.log(baseColors)
			if(baseColors.length == 1){
				baseColors = baseColors[0];
			}else{
				baseColors = baseColors.splice(0, 2);
				baseColors = (baseColors[0] == "000000" || baseColors[0] == "ffffff")? baseColors[1] : baseColors[0];
			}
			//console.log(baseColors)
			baseColors = {
				r: parseInt(baseColors.substring(0, 2), 16),
				g: parseInt(baseColors.substring(2, 4), 16),
				b: parseInt(baseColors.substring(4, 6), 16)
			};
			baseColors = (baseColors.r > 200 && baseColors.g > 200 && baseColors.b > 200)? null : baseColors;
			if(baseColors != null){
				ths.settings.preview.baseColor.r+= baseColors.r;
				ths.settings.preview.baseColor.g+= baseColors.g;
				ths.settings.preview.baseColor.b+= baseColors.b;
				ths.settings.preview.baseColor.count++;
			}
			if(baseColors != null) baseColors = "#"+rgbToHex(baseColors.r, baseColors.g, baseColors.b);
			queue[nowEdit].baseColor = baseColors;
			console.log("MAIN COLOR: "+baseColors);

			//Оценка краев
			for(var i = 0; i<48; i++){
				
			}

			//Заливка фона
			canvas.width = canvas.height = 48;
			ctx.beginPath();
			ctx.rect(0, 0, 48, 48);
			ctx.fillStyle = "#ffffff";
			ctx.fill();
			ctx.drawImage(oc, 0, 0);
			
			//сохранение
			console.log("size: "+img.width+"x"+img.height);
			queue[nowEdit].image = canvas;
			queue[nowEdit].setImage(canvas);
			if(nowEdit+1 < queue.length) editIamges(queue, nowEdit+1, ths);
			else getBaseColor(ths.settings.preview.baseColor);
		}
		img.onerror = function(){
			console.log("ERROR LOAD IMAGE #"+nowEdit);
			ths.settings.preview.countPreview--;
			queue[nowEdit].remove();			
			if(nowEdit+1 < queue.length) editIamges(queue, nowEdit+1, ths);
			else getBaseColor(ths.settings.preview.baseColor);
		}	
		function getBaseColor(baseColorS){
			baseColorS.r/=baseColorS.count;
			baseColorS.g/=baseColorS.count;
			baseColorS.b/=baseColorS.count;
			ths.settings.preview.baseColor = "#"+rgbToHex(baseColorS.r,
														  baseColorS.g,
														  baseColorS.b);
		}
		function rgbToHex(r, g, b) {
			return (0x1000000 | (b | (g << 8) | (r << 16))).toString(16).substring(1);
		}
	}
	function resetThis(ths){
		ths.list = [];
		ths.settings.select = undefined;
		ths.settings.preview.images = [];
		ths.settings.preview.baseColor = null;
		ths.settings.colorfull_sub.setValue(false);
		ths.settings.saveButton.distabled(true);
		ths.settings.list.clearContent();
	}

	window.MConstr = machine;
})()