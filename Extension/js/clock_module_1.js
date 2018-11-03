//Классические часы
(function(){
	var watch_clock = null;
	var watch_date = null;
	var machine = {
		watchBlock: null,
		drawClock: drawClock,
		updateClock: updateClock,
		loadSettings: loadSettings,
		getData: function(){
			return {
				size: 0,
				size_date: 5,
				width_clock: 3,
				width_date: 4,
				show_hours_zero: true,
				align: 0,
				full_hour_format: true,
				position: {
					top: null,
					left: 0,
					right: null,
					bottom: 0,
					center: {
						x: false,
						y: false
					}
				}
			};
		}		
	};
	CLOCK.startClockFunction(machine, 1);

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
				text: "Размер даты",
				elem: UI.createSelection({
					options: ["Очень маленькие", "Маленькие", "Средние", "Большие", "Очень большие", "Огромные"],
					value: data.size_date,
					click: function(value){
						data.size_date = value;
						changeCallback(data);
					}
				})
			}),
			UI.createInfoWrap({
				text: "Жирность шрифта часов",
				elem: UI.createSelection({
					options: ["Очень тонкий", "Тонкий", "Нормальный", "Жирный", "Очень жирный"],
					value: data.width_clock,
					click: function(value){
						data.width_clock = value;
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
			}),
			UI.createCheckBox({
				click: function(value){
					data.show_hours_zero = value;
					changeCallback(data);
				},
				value: data.show_hours_zero,
				settings:{
					style: ["border-top: none;"]
				},
				content: "Отображать незначащий ноль в часах"
			}),
			UI.createInfoWrap({
				text: "Выравнивание",
				elem: UI.createSelection({
					options: ["Лево", "Центр", "Право"],
					value: data.align,
					click: function(value){
						data.align = value;
						changeCallback(data);
					}
				})
			})
		]);
	}

	function drawClock(data, callback){
		watch_clock = UI.createElem({
			tag: "h1",
			content: "error load watch",
			attr: [{tag: "id", value: "watch_element_clock"}],
			style: [
				"margin: 0;",
				"color: #fff;",
				"line-height: 80%;",
				"padding: 0;",
				"font-size: 302px;",
				"font-weight: "+["100", "300", "500", "700", "900"][data.width_clock]+";"
			]
		});
		watch_date = UI.createElem({
			tag: "h2",
			content: "перезагрузите страницу, либо восстановите данные",
			attr: [{tag: "id", value: "watch_element_date"}],
			style: [
				"margin: 0;",
				"color: #fff;",
				"font-size: "+((data.size_date+2)*8)+"px;",
				"font-weight: "+["100", "300", "500", "700", "900"][data.width_date]+";"
			]
		});
		watch_format_index = UI.createElem({
			tag: "h2",
			content: "перезагрузите страницу, либо восстановите данные",
			attr: [{tag: "id", value: "watch_element_date"}],
			style: [
				"margin: 0;",
				"color: #fff;",
				"font-size: "+((data.size_date+2)*8)+"px;",
				"font-weight: "+["100", "300", "500", "700", "900"][data.width_date]+";"
			]
		});
		machine.watchBlock = UI.createElem({
			class: "watch hide",
			attr: [{tag: "id", value: "watch"}],
			style: [
				"text-align: "+["left", "center", "right"][data.align]+";"
			],
			content: [watch_clock, watch_date]
		});
		watch_clock = watch_clock.element;
		watch_date = watch_date.element;
		callback();
	}

	function updateClock(time, date){
		watch_clock.innerHTML = ((time.param.show_hours_zero)? CLOCK.time.toDouble(time.hours) : time.hours)+":"+CLOCK.time.toDouble(time.minutes);
		watch_date.innerHTML = ((time.amPm)? time.partDay+" | " : "")+CLOCK.time.getDay(date.getDay())+" | "+CLOCK.time.toDouble(date.getDate())+
			" "+CLOCK.time.getMonth(date.getMonth())+" "+date.getFullYear();
	}
}());