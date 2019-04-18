//Циферблат
(function(){
	var watch_clock_hours;
	var watch_clock_minuts;
	var watch_clock_seconds;
	var watch_date;
	var now_part_day = true;
	var machine = {
		watchBlock: null,
		drawClock: drawClock,
		updateClock: updateClock,
		loadSettings: loadSettings,
		preLoadClock: preLoadClock,
		getData: function(){
			return {
				size: 2,
				width_clock: 1,
				width_date: 0,
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
	CLOCK.startClockFunction(machine, 2);	


	function loadSettings(data, wraper, changeCallback){
		wraper.appendChild([		
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
				text: "Жирность стрелок циферблата",
				elem: UI.createSelection({
					options: ["Тонкий", "Нормальный", "Жирный"],
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
					options: ["Тонкий", "Нормальный", "Жирный"],
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
		let serifDat = {
			height: "110px;",
			common: "width: "+[2, 4, 8][data.width_clock]+"px;"+
					"margin-left: -"+[1, 2, 4][data.width_clock]+"px;"+
					"height: 30px;"
		};
		watch_clock_hours = UI.createElem({
			tag: "div",
			class: "hoursArrow",
			attr: [{tag: "id", value: "watch_element_clock_hours"}],
			content: UI.createElem({
				style: [
					"height: 80px;",
					"width: "+([8, 8, 16][data.width_clock])+"px;",
					"margin-left: "+([-4, -4, -8][data.width_clock])+"px;"
				]
			})
		});
		watch_clock_minuts = UI.createElem({
			tag: "div",
			class: "minutsArrow",
			attr: [{tag: "id", value: "watch_element_clock_minuts"}],
			content: UI.createElem({
				style: [
					"height: 120px;",
					"width: "+([6, 6, 12][data.width_clock])+"px;",
					"margin-left: "+([-3, -3, -6][data.width_clock])+"px;"
				]
			})
		});
		watch_clock_seconds = UI.createElem({
			tag: "div",
			class: "secondsArrow",
			attr: [{tag: "id", value: "watch_element_clock_seconds"}],
			content: UI.createElem({
				style: [
					"height: 120px;",
					"width: "+([4, 6, 8][data.width_clock])+"px;",
					"margin-left: "+([-2, -3, -4][data.width_clock])+"px;"
				]
			})
		});
		watch_date = UI.createElem({
			tag: "h2",
			content: "перезагрузите страницу, либо восстановите данные",
			attr: [{tag: "id", value: "watch_element_date"}],
			style: [
				"margin: 0;",
				"color: #000;",
				"position: absolute;",
				"margin-top: 48px;",
				"font-size: 24px;",
				"font-weight: "+["100", "500", "900"][data.width_date]+";"
			]
		});
		now_part_day = new Date().getHours();
		now_part_day = now_part_day > 6 && now_part_day < 18;
		machine.watchBlock = UI.createElem({
			class: "watch hide "+(now_part_day? "AM-part" : "PM-part"),
			attr: [{tag: "id", value: "watch"}],
			style: ["width: 300px;", "height: 300px;"],
			content: [
				UI.createElem({class: "serif", content: [
					UI.createElem({style: ["bottom: "+serifDat.height, serifDat.common]}),
					UI.createElem({style: ["top: "+serifDat.height, serifDat.common]})
				]}),
				UI.createElem({class: "serif", content: [
					UI.createElem({style: ["bottom: "+serifDat.height, serifDat.common]}),
					UI.createElem({style: ["top: "+serifDat.height, serifDat.common]})
				]}),
				UI.createElem({class: "serif", content: [
					UI.createElem({style: ["bottom: "+serifDat.height, serifDat.common]}),
					UI.createElem({style: ["top: "+serifDat.height, serifDat.common]})
				]}),
				UI.createElem({class: "serif", content: [
					UI.createElem({style: ["bottom: "+serifDat.height, serifDat.common]}),
					UI.createElem({style: ["top: "+serifDat.height, serifDat.common]})
				]}),
				UI.createElem({class: "serif", content: [
					UI.createElem({style: ["bottom: "+serifDat.height, serifDat.common]}),
					UI.createElem({style: ["top: "+serifDat.height, serifDat.common]})
				]}),
				UI.createElem({class: "serif", content: [
					UI.createElem({style: ["bottom: "+serifDat.height, serifDat.common]}),
					UI.createElem({style: ["top: "+serifDat.height, serifDat.common]})
				]}),
				watch_clock_hours,
				watch_clock_minuts,
				UI.createElem({
					class: "circle",
					style: ["width: 18px;", "height: 18px;"]
				}),
				watch_clock_seconds,
				UI.createElem({
					class: "circle seconds",
					style: ["width: 10px;", "height: 10px;"]
				}),
				watch_date	
			]	
		});
		watch_clock_hours = watch_clock_hours.element;
		watch_clock_minuts = watch_clock_minuts.element;
		watch_clock_seconds = watch_clock_seconds.element;
		watch_date = watch_date.element;
		console.log(machine.watchBlock)
		callback();
	}

	function updateClock(time, date){
		watch_clock_hours.style.transform = "rotate("+(180+(recovery(time.hours, 12)/12)*360)+"deg)";
		watch_clock_minuts.style.transform = "rotate("+(180+(recovery(time.minutes, 60)/60)*360)+"deg)";
		watch_clock_seconds.style.transform = "rotate("+(180+(recovery(time.seconds, 60, true)/60)*360)+"deg)";
		watch_date.innerHTML = CLOCK.time.getDay(date.getDay(), true)+" "+CLOCK.time.toDouble(date.getDate())+
			" "+CLOCK.time.getMonth(date.getMonth(), true);
		
		if((time.hours > 6 && time.hours < 18) == !now_part_day){
			machine.watchBlock.removeClass(now_part_day? "AM-part" : "PM-part")
			machine.watchBlock.addClass(time.partDay+"-part");
			now_part_day = time.hours > 6 && time.hours < 18;
		}

		setTimeout(function(){
			machine.watchBlock.addClass("noAnim");
			setTimeout(function(){
				if(+time.hours == 0)
					watch_clock_hours.style.transform = "rotate("+(180+(recovery(time.hours, 12)/12)*360)+"deg)";
				if(+time.minutes == 0)
					watch_clock_minuts.style.transform = "rotate("+(180+(recovery(time.minutes, 60)/60)*360)+"deg)";
				if(+time.seconds == 0)
					watch_clock_seconds.style.transform = "rotate("+180+"deg)";
				setTimeout(function(){
					machine.watchBlock.removeClass("noAnim");
				}, 100);
			}, 100);
		}, 300);

		function recovery(val, max, show){
			return (+val == 0)? max : +val;
		}
	}

	function preLoadClock(){
		document.head.appendChild(UI.createElem({
			tag: "style",
			attr: [{tag: "id", value: "watch_style"}],
			content:
				"#watch{\
					border-radius: 50%;\
				    width: 410px;\
				   	height: 410px;\
				    background-color: rgba(255, 255, 255, 0.17);\
				    display: flex;\
				    align-items: center;\
				    justify-content: center;\
				    position: relative;\
				    box-shadow: 0 0 14px rgba(0, 0, 0, 0.19);\
				    background-color: #f6f5f3;\
				    transition: background-color 0.3s ease, opacity 0.3s ease\
				}\
				.hoursArrow, .minutsArrow, .secondsArrow, .serif{\
				    width: 0;\
				    height: 0;\
				    z-index: 1;\
				    position: relative;\
				    transition: transform 0.3s cubic-bezier(0.43, 0.08, 0.52, 1.72); \
				}\
				.noAnim .hoursArrow, .noAnim .minutsArrow, .noAnim .secondsArrow{\
				    transition: transform 0s;\
				}\
				.hoursArrow div, .minutsArrow div, .secondsArrow div{height: 70px; background-color: #000;}\
				.minutsArrow div, .secondsArrow div{height: 130px;}\
				.secondsArrow div{background-color: #de3e3e;}\
				.serif div{\
				    width: 4px;\
				    bottom: 160px;\
				    height: 30px;\
				    background-color: #c1c1c1;\
				    margin-left: -2px;\
				    position: absolute;\
				}\
				.serif div:last-child{bottom: initial; top: 160px;}\
				.serif:nth-child(2){transform: rotate(30deg);}\
				.serif:nth-child(3){transform: rotate(60deg);}\
				.serif:nth-child(4){transform: rotate(90deg);}\
				.serif:nth-child(5){transform: rotate(120deg);}\
				.serif:nth-child(6){transform: rotate(150deg);}\
				.circle, .circle.seconds{\
				   position: absolute;\
				   width: 16px;\
				   height: 16px;\
				    z-index: 1;\
				   background-color: #000;\
				   border-radius: 50%;\
				}\
				.circle.seconds{width: 10px; height: 10px; background-color: #de3e3e;}\
				#watch.PM-part{background-color: #212121;}\
				.PM-part .hoursArrow div, .PM-part .minutsArrow div, .PM-part .circle:not(.seconds){background-color: #fff;}\
				.PM-part .serif div{background-color: #696969;}\
				.PM-part h2{color: #fff !important;}\
				#watch.pm div {box-shadow: 0 0 6px rgba(0, 0, 0, 0.32);}\
			}).element);"
		}).element);
	}	
}());