(function(){
	var machine = {
		constructorSettingsClock: constructorSettingsClock,
		drawClock: drawClock,
		updateWatch: updateWatch,
		size: 0
	};
	Window.WATCH = machine;

	function constructorSettingsClock(wraper, moveWatchFunction){
		console.log("CONNECT CLOCK MODULE 4");
		bgPage.Window.DB.changeFile("/settings/watch_4.json", function(file){
			loadConstructor(file, wraper, moveWatchFunction);
		}, function(isSuccess){
			if(!isSuccess) createClockData(function(){
				console.info("CREATE DATA CLOCK");
				constructorSettingsClock(wraper, moveWatchFunction);
			});
		});
	}

	function loadConstructor(data, wraper, moveWatchFunction){
		wraper.appendChild([
			UI.createCheckBox({
				click: function(value){
					bgPage.Window.DB.changeFile("/settings/watch_4.json", function(file, saveFile){
						file.full_hour_format = value;
						data = file;
						saveFile(file);
					}, function(isSuccess){
						drawClock(data);
						//notification();
					});
				},
				value: data.full_hour_format,
				settings:{
					style: ["border-top: none;"]
				},
				content: "24 часовой формат"
			}),
			UI.createInfoWrap({
				text: "Размер часов",
				elem: UI.createSelection({
					options: ["Очень маленькие", "Маленькие", "Средние", "Большие", "Очень большие", "Огромные"],
					value: data.size_clock,
					click: function(value){
						bgPage.Window.DB.changeFile("/settings/watch_4.json", function(file, saveFile){
							file.size_clock = value;
							data = file;
							saveFile(file);
						}, function(isSuccess){
							drawClock(data);
							//notification();
						});
					}
				})
			}),
			UI.createInfoWrap({
				text: "Размер даты",
				elem: UI.createSelection({
					options: ["Очень маленькие", "Маленькие", "Средние", "Большие", "Очень большие", "Огромные"],
					value: data.size_date,
					click: function(value){
						bgPage.Window.DB.changeFile("/settings/watch_4.json", function(file, saveFile){
							file.size_date = value;
							data = file;
							saveFile(file);
						}, function(isSuccess){
							drawClock(data);
							//notification();
						});
					}
				})
			}),
			UI.createInfoWrap({
				text: "Жирность шрифта часов",
				elem: UI.createSelection({
					options: ["Очень тонкий", "Тонкий", "Нормальный", "Жирный", "Очень жирный"],
					value: data.width_clock,
					click: function(value){
						bgPage.Window.DB.changeFile("/settings/watch_4.json", function(file, saveFile){
							file.width_clock = value;
							data = file;
							saveFile(file);
						}, function(isSuccess){
							drawClock(data);
							//notification();
						});
					}
				})
			}),
			UI.createInfoWrap({
				text: "Жирность шрифта даты",
				elem: UI.createSelection({
					options: ["Очень тонкий", "Тонкий", "Нормальный", "Жирный", "Очень жирный"],
					value: data.width_date,
					click: function(value){
						bgPage.Window.DB.changeFile("/settings/watch_4.json", function(file, saveFile){
							file.width_date = value;
							data = file;
							saveFile(file);
						}, function(isSuccess){
							drawClock(data);
							//notification();
						});
					}
				})
			}),
			UI.createInfoWrap({
				text: "Выравнивание",
				elem: UI.createSelection({
					options: ["Лево", "Центр", "Право"],
					value: data.align,
					click: function(value){
						bgPage.Window.DB.changeFile("/settings/watch_4.json", function(file, saveFile){
							file.align = value;
							data = file;
							saveFile(file);
						}, function(isSuccess){
							drawClock(data);
							//notification();
						});
					}
				})
			}),
			UI.createInfoWrap({
				text: "",
				elem: UI.createButton({
					settings: {
						content: "Переместить часы"
					},
					click: function(value){
						moveWatchFunction(function(result){
							//console.log(result);
							bgPage.Window.DB.changeFile("/settings/watch_4.json", function(file, saveFile){
								file.position = result;
								data = file;
								saveFile(file);
							}, function(isSuccess){
								drawClock(data);
								//notification();
							});
						}, data.position);
					}
				})
			})
		]);
	}

	function createClockData(callback){
		bgPage.Window.DB.set("/settings/", {
			file: new Blob([JSON.stringify({
				size_clock: 0,
				size_date: 0,
				width_clock: 0,
				width_date: 1,
				align: 0,
				full_hour_format: true,
				position: {
					top: 0,
					left: 0,
					right: null,
					bottom: null,
					center: {
						x: false,
						y: false
					}
				}
			})], {type: "application/json"}),
			name: "watch_4.json"
		}, callback)
	}
	/*
		Отрисока часов
	*/
	var time_format;

	function drawClock(data, callback){
		if(!data){
			bgPage.Window.DB.changeFile("/settings/watch_4.json", function(file){
				drawClock(file, callback);
			});
			return;
		}
		if(document.getElementById("watch")){
			UI.createElem(document.getElementById("watch")).addClass("hide", function(){
				document.getElementById("watch").remove();
				drawClock(data, callback);
			});
			return;
		}	
		time_format = data.full_hour_format;
		var watch = UI.createElem({
			class: "watch hide",
			attr: [{tag: "id", value: "watch"}],
			style: [
				"padding: 8px;",
				"text-align: "+["left", "center", "right"][data.align]+";",
				"color: rgb(255, 255, 255) !important;",
			    "font-size: "+(data.size_clock*74+80)+"px !important;",
			    "font-weight: "+["100", "300", "500", "700", "900"][data.width_clock]+" !important;"
			]
		});
		var h_top, h_center, h_bottom;		
		(function(){
			h_top = h_create(), h_center = h_create(), h_bottom = h_create();	
			function h_create(){
				return UI.createElem({
					tag: "h1",
					style: [
						"margin: 0;",
						"color: #fff;",
						"line-height: 80%;",
						"padding: 0;",
						"font-size: inherit;",
						"font-weight: inherit;"
					]
				});
			}
			h_top.setAttribute("id", "watch_element_clock_hours_top");
			h_center.setAttribute("id", "watch_element_clock_hours_center");
			h_bottom.setAttribute("id", "watch_element_clock_hours_bottom");
		}());
		var m_top, m_center, m_bottom;		
		(function(){
			m_top = m_create(), m_center = m_create(), m_bottom = m_create();	
			function m_create(){
				return UI.createElem({
					tag: "h1",
					style: [
						"margin: 0;",
						"color: #fff;",
						"line-height: 80%;",
						"padding: 0;",
						"font-size: inherit;",
						"font-weight: inherit;"
					]
				});	
			}
			m_top.setAttribute("id", "watch_element_clock_minuts_top");
			m_center.setAttribute("id", "watch_element_clock_minuts_center");
			m_bottom.setAttribute("id", "watch_element_clock_minuts_bottom");
		}());			
		watch.appendChild([
			UI.createElem({style: ["display: inline-block;"], content: [h_top, h_center, h_bottom]}),
			UI.createElem({style: ["display: inline-block;"], content: ":"}),
			UI.createElem({style: ["display: inline-block;"], content: [m_top, m_center, m_bottom]}),
			UI.createElem({
				tag: "h2",
				content: "перезагрузите страницу, либо восстановите данные",
				attr: [{tag: "id", value: "watch_element_date"}],
				style: [
					"margin: 0;",
					"color: #fff;",
					"font-size: "+((data.size_date+2)*8)+"px;",
					"font-weight: "+["100", "300", "500", "700", "900"][data.width_date]+";"
				]
			})
		]);
		TIME.convertPosition(data.position, watch.element);
		document.getElementById("watch_wraper").appendChild(watch.element);
		updateWatch();		
		setTimeout(function(){
			watch.removeClass("hide");
		}, 50);
		if(callback) callback(watch);
	}

	function updateWatch(){
		if(!document.getElementById("watch")) return;
		var watch_clock_hours_top = document.getElementById("watch_element_clock_hours_top");
		var watch_clock_hours_center = document.getElementById("watch_element_clock_hours_center");
		var watch_clock_hours_bottom = document.getElementById("watch_element_clock_hours_bottom");
		var watch_clock_minuts_top = document.getElementById("watch_element_clock_minuts_top");
		var watch_clock_minuts_center = document.getElementById("watch_element_clock_minuts_center");
		var watch_clock_minuts_bottom = document.getElementById("watch_element_clock_minuts_bottom");
		var watch_date = document.getElementById("watch_element_date");
		var date = new Date();
		//console.log("time_format: "+time_format)
		var time = TIME.getTime(time_format);

		watch_clock_hours_top.innerHTML =
		watch_clock_hours_center.innerHTML =
		watch_clock_hours_bottom.innerHTML = time.hours;
		watch_clock_minuts_top.innerHTML =
		watch_clock_minuts_center.innerHTML =
		watch_clock_minuts_bottom.innerHTML = time.minutes;
		watch_date.innerHTML = TIME.getDay(date.getDay())+" | "+TIME.toDouble(date.getDate())+
			" "+TIME.getMonth(date.getMonth())+" "+date.getFullYear();
		//document.getElementById("litter").innerHTML = time.litter;
	}
}());