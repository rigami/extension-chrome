(function(){
	var clockInterval = null;
	var sizeClock = 0.5;
	var data = null;
	var name = null;
	var clockModule = null;
	var startClockCallback = null;

	function drawClock(){
		if(!clockModule) return;
		sizeClock = data.size*0.12+0.2;
		if(clockModule.watchBlock) clockModule.watchBlock.remove();
		clockModule.drawClock(data, function(){
			let clockBlock = document.getElementById("clock-block");
			clockBlock.appendChild(clockModule.watchBlock.element);
			updateClock();
			machine.setPosition();
			setTimeout(function(){
				machine.resizeClock();
				clockModule.watchBlock.removeClass("hide");
			}, 400);
		});
	};
	function updateClock(){
		if(!clockModule) return;
		clockModule.updateClock(machine.time.getTime(data.full_hour_format), new Date());
	};

	var machine = {
		startClockFunction: function(clModule){
			console.log("CONNECT CLOCK: "+name);
			clockModule = clModule;
			bgPage.Window.DB.changeFile("/settings/watch_"+name+".json", function(file){
				data = file;				
				clbck();
			}, function(result){
				if(result) return;
				data = clockModule.getData();
				bgPage.Window.DB.set("/settings/", {
					file: new Blob([JSON.stringify(data)], {type: "application/json"}),
					name: "watch_"+name+".json"
				}, clbck);
			});

			function clbck(){
				if(clockModule.preLoadClock) clockModule.preLoadClock();
				clockInterval = setInterval(updateClock, 1000);
				drawClock();
				if(startClockCallback) startClockCallback();
			}
		},
		connectClock: function(nameClock, callback){
			if(clockModule){
				machine.disconnectClock(function(){
					machine.connectClock(nameClock, callback);
				});
				return;
			}
			if(document.getElementById("watch_module")) document.getElementById("watch_module").remove();
			if(document.getElementById("watch_style")) document.getElementById("watch_style").remove();
			clearInterval(clockInterval);
			document.head.appendChild((function(){
				startClockCallback = callback;
				name = nameClock;
				var script = document.createElement("script");
				script.setAttribute("src", "js/clock_module_"+nameClock+".js");
				script.setAttribute("id", "watch_module");
				return script;
			})());			
		},
		disconnectClock: function(callback){
			if(document.getElementById("watch_module")) document.getElementById("watch_module").remove();
			if(document.getElementById("watch_style")) document.getElementById("watch_style").remove();
			clearInterval(clockInterval);
			clockModule = null;
			name = null;
			if(document.getElementById("watch")) UI.createElem(document.getElementById("watch")).addClass("hide", function(){
					document.getElementById("watch").remove();
					if(callback) callback();
				});
			else if(callback) callback();	
		},		
		resizeClock: function(){
			if(!clockModule) return;
			let clH = clockModule.watchBlock.element.clientHeight;
			let clW = clockModule.watchBlock.element.clientWidth;
			let sH = sizeClock*Window.dataOfTab.body.clientHeight/(clH);
			let sW = sizeClock*Window.dataOfTab.body.clientWidth/(clW);
			console.log("clH: "+clH)
			console.log("clW: "+clW)
			console.log("sH: "+sH)
			console.log("sW: "+sW)
			let sclW = (sH < sW)? sH : sW;
			clockModule.watchBlock.element.style.transform = "scale("+sclW+")";
			clockModule.watchBlock.element.style.margin = clH*(sclW*0.5-0.5)+"px "+clW*(sclW*0.5-0.5)+"px";
		},
		setPosition: function(position){
			let node = document.getElementById("clock-block");
			position = (position)? position : data.position;
			node.style.right = null;
			node.style.left = null;
			node.style.top = null;
			node.style.bottom = null;
			node.style.position = "absolute";
			if(!position.center.y){
				node.style.top = position.top+"%";
				node.style.bottom = position.bottom+"%";
			}
			if(!position.center.x){
				node.style.left = position.left+"%";
				node.style.right = position.right+"%";
			}
		},
		loadSettings: function(wrp){
			if(!clockModule) return;
			clockModule.loadSettings(data, wrp, function(newData){
				bgPage.Window.DB.changeFile("/settings/watch_"+name+".json", function(file, saveFile){
					saveFile(newData);
				}, function(){
					data = newData;
					drawClock();
				});				
			});
			wrp.appendChild(UI.createInfoWrap({
				text: "",
				elem: UI.createButton({
					settings: {
						content: "Переместить"
					},
					click: function(value){
						document.getElementById("clock-block").classList.add("moveWatch");
						UI.createElem(document.getElementById("settings_zone")).addClass("hide", function(){
							document.getElementById("bodyWraper").classList.add("interfaceOff");
							moveWatch(function(result){
								bgPage.Window.DB.changeFile("/settings/watch_"+name+".json", function(file, saveFile){										
									data = file;
									if(result == null){
										machine.setPosition();
									}else{
										file.position = result;
										saveFile(file);
									}									
								}, function(){
									document.getElementById("clock-block").classList.remove("moveWatch");
								});								
									
							}, data.position);					
						});
					}
				})
			}));
		},
		time: {
			getMonth: function(numb, isShort){
				if(isShort)
					switch(numb+1){
						case 1:  return "ЯНВ";   break;
						case 2:  return "ФЕВР";  break;
						case 3:  return "МАРТА"; break;
						case 4:  return "АПР";   break;
						case 5:  return "МАЯ";   break;
						case 6:  return "ИЮНЯ";  break;
						case 7:  return "ИЮЛЯ";  break;
						case 8:  return "АВГ";   break;
						case 9:  return "СЕНТ";  break;
						case 10: return "ОКТ";   break;
						case 11: return "НОЯБ";  break;
						case 12: return "ДЕК";   break;
					}
				else
					switch(numb+1){
						case 1:  return "ЯНВАРЯ";   break;
						case 2:  return "ФЕВРАЛЯ";  break;
						case 3:  return "МАРТА";    break;
						case 4:  return "АПРЕЛЯ";   break;
						case 5:  return "МАЯ";      break;
						case 6:  return "ИЮНЯ";     break;
						case 7:  return "ИЮЛЯ";     break;
						case 8:  return "АВГУСТА";  break;
						case 9:  return "СЕНТЯБРЯ"; break;
						case 10: return "ОКТЯБРЯ";  break;
						case 11: return "НОЯБРЯ";   break;
						case 12: return "ДЕКАБРЯ";  break;
					};
			},
			getDay: function(numb, isShort){
				if(isShort)
					switch(numb){
						case 1: return "ПН"; break;
						case 2: return "ВТ"; break;
						case 3: return "СР"; break;
						case 4: return "ЧТ"; break;
						case 5: return "ПТ"; break;
						case 6: return "СБ"; break;
						case 0:
						case 7: return "ВС"; break;
					}
				else
					switch(numb){
						case 1: return "ПОНЕДЕЛЬНИК"; break;
						case 2: return "ВТОРНИК";     break;
						case 3: return "СРЕДА";       break;
						case 4: return "ЧЕТВЕРГ";     break;
						case 5: return "ПЯТНИЦА";     break;
						case 6: return "СУББОТА";     break;
						case 0:
						case 7: return "ВОСКРЕСЕНЬЕ"; break;
					}
			},
			getTime: function(timeFormat){
				//timeFormat: |false - 12 format
				//			  |true  - 24 format		
				var date = new Date();
				date = {
					hours: date.getHours(),
					minutes: date.getMinutes(),
					seconds: date.getSeconds(),
					amPm: !timeFormat,
					param: data
				};
				date.partDay = (date.hours <= 12)? "AM" : "PM";
				if((!timeFormat)&&(date.hours > 12)) date.hours = date.hours-12;
				for(key in date){
					if(key == "amPm" || key == "partDay") continue;
					date[key] = date[key];		
				}
				return date;
			},
			toDouble: function(numb){
				return (numb < 10)? "0"+numb : numb+"";
			}
		}
	};

	window.CLOCK = machine;
}());