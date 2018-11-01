//Вертикальные
(function(){
	var watch_clock_hours = null;
	var watch_clock_minuts = null;
	var watch_format_index = null;
	var watch_date = null;
	var machine = {
		watchBlock: null,
		drawClock: drawClock,
		updateClock: updateClock,
		loadSettings: loadSettings,
		preLoadClock: preLoadClock,
		getData: function(){
			return {
				size: 3,
				width_clock_hours: 4,
				width_clock_minuts: 0,
				width_date: 1,
				full_hour_format: true,
				position: {
					top: null,
					left: null,
					right: null,
					bottom: null,
					center: {
						x: true,
						y: true
					}
				}
			};
		}		
	};
	CLOCK.startClockFunction(machine, 3);	

	function loadSettings(data, wraper, changeCallback){
		wraper.appendChild([
			UI.createCheckBox({
				click: function(value){
					data.full_hour_format = value;
					changeCallback(data);
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
					options: ["Очень маленькие", "Маленькие", "Средние", "Большие", "Очень большие"],
					value: data.size,
					click: function(value){
						data.size = value;
						changeCallback(data);
					}
				})
			}),
			UI.createInfoWrap({
				text: "Жирность шрифта часов - часы",
				elem: UI.createSelection({
					options: ["Очень тонкий", "Тонкий", "Нормальный", "Жирный", "Очень жирный"],
					value: data.width_clock_hours,
					click: function(value){
						data.width_clock_hours = value;
						changeCallback(data);
					}
				})
			}),
			UI.createInfoWrap({
				text: "Жирность шрифта часов - минуты",
				elem: UI.createSelection({
					options: ["Очень тонкий", "Тонкий", "Нормальный", "Жирный", "Очень жирный"],
					value: data.width_clock_minuts,
					click: function(value){
						data.width_clock_minuts = value;
						changeCallback(data);
					}
				})
			}),
			UI.createInfoWrap({
				text: "Жирность шрифта даты",
				elem: UI.createSelection({
					options: ["Очень тонкий", "Тонкий", "Нормальный", "Жирный", "Очень жирный"],
					value: data.width_date,
					click: function(value){
						data.width_date = value;
						changeCallback(data);
					}
				})
			})
		]);
	}

	function drawClock(data, callback){		
		watch_clock_hours = UI.createElem({
			tag: "h1",
			content: "error load watch",
			attr: [{tag: "id", value: "watch_element_clock_hours"}],
			style: [
				"margin: 0;",
				"color: #fff;",
				"line-height: 80%;",
				"padding: 0;",
				"font-size: 376px;",
				"font-weight: "+["100", "300", "500", "700", "900"][data.width_clock_hours]+";"
			]
		});
		watch_clock_minuts = UI.createElem({
			tag: "h1",
			content: "error load watch",
			attr: [{tag: "id", value: "watch_element_clock_minuts"}, {tag: "data-time-format", value: ""}],
			style: [
				"margin: 0;",
				"color: #fff;",
				"line-height: 80%;",
				"padding: 0;",
				"font-size: 376px;",
				"font-weight: "+["100", "300", "500", "700", "900"][data.width_clock_minuts]+";",
				"position: relative;"
			]
		});
		watch_date = UI.createElem({
			tag: "h2",
			content: "перезагрузите страницу, либо восстановите данные",
			attr: [{tag: "id", value: "watch_element_date"}],
			style: [
				"margin: 0;",
				"color: #fff;",
				"font-size: 60px;",
				"font-weight: "+["100", "300", "500", "700", "900"][data.width_date]+";"
			]
		});
		machine.watchBlock = UI.createElem({
			class: "watch hide",
			attr: [{tag: "id", value: "watch"}],
			style: [
				"text-align: center;",
				(!data.full_hour_format)? "padding-right: 35px;" : ""
			],
			content: [watch_clock_hours, watch_clock_minuts, watch_date]
		});
		watch_clock_hours = watch_clock_hours.element;
		watch_clock_minuts = watch_clock_minuts.element;
		watch_date = watch_date.element;
		callback();
	}

	function updateClock(time, date){
		watch_clock_hours.innerHTML = CLOCK.time.toDouble(time.hours);
		watch_clock_minuts.innerHTML = CLOCK.time.toDouble(time.minutes);
		watch_clock_minuts.dataset.timeFormat = (time.amPm)? time.partDay : "";
		watch_date.innerHTML = CLOCK.time.getDay(date.getDay(), true)+" "+CLOCK.time.toDouble(date.getDate())+
			" "+CLOCK.time.getMonth(date.getMonth(), true);
	}

	function preLoadClock(){
		document.head.appendChild(UI.createElem({
			tag: "style",
			attr: [{tag: "id", value: "watch_style"}],
			content:
				"#watch_element_clock_minuts:after{\
					content: attr(data-time-format);\
				    margin: 0px;\
				    color: rgb(255, 255, 255);\
				    font-weight: 300;\
				    position: absolute;\
				    right: -22px;\
				    bottom: 10px;\
				    font-size: 33px;\
				    line-height: normal\
				}"
		}).element);
	}	
}());