/*--------------------------------------------------------------------------------------*/
/*-----------------------------ПЕРВАЯ ИНИЦИАЛИЗАЦИЯ-------------------------------------*/
/*--------------------------------------------------------------------------------------*/
if(!JSON.parse(localStorage.getItem("first_contact"))){
	window.open("welcome.html", "_self");
}else{
	if(localStorage.getItem("version") == "1.0.8") localStorage.setItem("version", 1);
	if(JSON.parse(localStorage.getItem("version")) < 6){
		window.open("update.html", "_self");
	}
}
if(localStorage.getItem("custom_tab_name")) document.title = (localStorage.getItem("custom_tab_name") == "u200E")? "\u200E" : localStorage.getItem("custom_tab_name");
var bgPage = chrome.extension.getBackgroundPage();
if(!bgPage.Window.DB){
	setTimeout(function(){
		document.location.reload();
	}, 1000);
}
Window.dataOfTab = {
	body: document.getElementById("bodyWraper"),
	sitePanel: null,
	sitePanelIsLooked: false,
	markGrabIsActive: true,
	menuIsOpen: false,
	headStyle: document.getElementById("style_count_mark"),
	countMark: Math.floor((document.body.clientWidth-25)/240),
	widthPreviewContent: 0,
	namespace: bgPage.Window.DB.get(),
	updateVarStyles: function(){
		let c = (this.widthPreviewContent) ? Math.floor((this.widthPreviewContent.clientWidth-25)/260) : 2;
		this.headStyle.innerHTML = ":root{--count-mark: "+this.countMark+";\
										  --count-preview: "+((c > 5)? 5 : c)+";";
	}
}
Window.dataOfTab.updateVarStyles();
/*
	Загрузка данных пользователя
*/
bgPage.Window.DB.changeFile("/settings/settings.json", function(file){	
	//console.log(file);
	if(+localStorage.getItem("training_stage") < 8) guide();
	if(file.open_site_panel_start){
		drawSitePanel(true);
	}
	if(file.dark_theme) document.body.classList.add("night-theme");
	if(file.new_theme) document.body.classList.add("theme-new");
	if(file.low_brightness_bg) document.getElementById("backgroundWraper").classList.add("low-brightness");
	if(!file.hide_right_menu) document.getElementById("interfaceWraper").className = "show_button_panel";
	document.getElementById("blind").style.backgroundColor = "rgba(0,0,0,"+[0, 0.17, 0.3, 0.6][file.background_dimming_level]+")";
	if((JSON.parse(localStorage.getItem("switch_background_when_opening_page")))
		||(Date.now() > JSON.parse(localStorage.getItem("next_check_background")))) getBackground(file);
	else getBackgroundNowSet(file);
	setInterval(function(){
		if(Date.now() > JSON.parse(localStorage.getItem("next_check_background")))
			bgPage.Window.DB.changeFile("/settings/settings.json", function(file){
				getBackground(file);
			});	
	}, 30000);
	if(file.type_of_watch != 0) CLOCK.connectClock(file.type_of_watch);
	let site_panel = document.getElementById("site_panel");
	if(file.site_panel_substrate) site_panel.classList.add("substrate");	
	switch(file.site_panel_position){
		case 0: 
			site_panel.parentNode.parentNode.style.justifyContent = "end";
			site_panel.style.flexDirection = "column";
			site_panel.parentNode.classList.add("looked_position");
		break;
		case 1:
			site_panel.parentNode.parentNode.style.alignItems = "end";
			site_panel.parentNode.parentNode.classList.add("looked_position");
		break;
		case 2:
			site_panel.parentNode.parentNode.style.justifyContent = "flex-end";
			site_panel.style.flexDirection = "column";
			site_panel.parentNode.style.paddingLeft = "72px";
			site_panel.parentNode.style.marginRight = "35px";
		break;
		case 3:
			site_panel.parentNode.parentNode.style.alignItems = "flex-end";
			site_panel.parentNode.parentNode.classList.add("looked_position");
		break;
	}
	if(file.use_site_panel){		
		drawFavPanel();
		site_panel.classList.remove("hide");
	}
	document.getElementById("bodyWraper").classList.remove("hide");
	if(localStorage.getItem("start-notification")){
		notification(JSON.parse(localStorage.getItem("start-notification")));
		localStorage.removeItem("start-notification");
	}
}, function(isSuccess){
	document.getElementById("bodyWraper").classList.remove("hide");
	if(!isSuccess) notification({
		image: "../image/ic_error_white_24dp_1x.png",
		text: "Ошибка загрузки данных",
		deadFunc: function(){}
	});
});

addEventListener('visibilitychange', function() {
	if(!document.hidden){
		console.info("update page...");
		if(Window.dataOfTab.sitePanel) Window.dataOfTab.sitePanel.update()
		if(localStorage.getItem("custom_tab_name"))
			document.title = (localStorage.getItem("custom_tab_name") == "u200E")? "\u200E" : localStorage.getItem("custom_tab_name");
		if(document.getElementById("background"))	
			if(document.getElementById("background").play) document.getElementById("background").play();
	}else{
		if(document.getElementById("background"))	
			if(document.getElementById("background").pause) document.getElementById("background").pause();
	}
}, false);
addEventListener('resize', function() {
	//console.log("resize");
	Window.dataOfTab.countMark = Math.floor((document.body.clientWidth-25)/240);
	Window.dataOfTab.updateVarStyles();
	CLOCK.resizeClock();
});
addEventListener("wheel", function(event){
	if(event.deltaY > 0){
		//open
		if((!Window.dataOfTab.sitePanel)&&(!Window.dataOfTab.sitePanelIsLooked)){
			drawSitePanel();
		}
	}else{
		//close
		if((Window.dataOfTab.sitePanel)&&(!Window.dataOfTab.sitePanelIsLooked)&&(Window.dataOfTab.sitePanel.element.scrollTop == 0)){
			Window.dataOfTab.sitePanelIsLooked = true;
			document.getElementById("add_site_button").classList.add("hide");
			setTimeout(function(){
				document.getElementById("add_site_button").style.display = "none";
			}, 150);
			Window.dataOfTab.sitePanel.addClass("hide", function(panel){
				panel.clearContent();
				Window.dataOfTab.sitePanelIsLooked = false;
			});	
			Window.dataOfTab.sitePanel = null;			
		}			
	}
});

function getBackground(settingsFile, callback){	
	if(settingsFile.one_setting_for_selected_days){
		parseDay(settingsFile.switching_background_in_special, callback);
	}else{
		parseDay(settingsFile["switching_background_in_"+["su", "mo", "tu", "we", "th", "fr", "sa"][new Date().getDay()]], callback);
	}

	function parseDay(daySettings, callback){
		//console.log(daySettings)
		bgPage.Window.DB.changeFile("/settings/backgroundsList.json", function(bgList, saveFile){
			var type_BG;
			var numb_BG_in_list;
			var time = new Date();
			if(daySettings.background_selection == 0){
				//СЛУЧАЙНЫЙ			
				var addMin = (function(){
					var min = 0;
					switch(daySettings.random_selection.period){
						case 1: min = 5; break;
						case 2: min = 30; break;
						case 3: min = 60; break;
						case 4: min = 360; break;
						case 5: min = 720; break;
						case 6: 
						case 0: min = 1440; break;
					}
					return new function(){
							if(min < 60){
								this.min = time.getMinutes() - (time.getMinutes() % min) + min;
								this.hour = time.getHours()*60;
								if(this.min >= 60){
									this.min = this.min % 60;
									this.hour = this.hour+60;
								}											
							}else{
								this.hour = (time.getHours()*60 < min)? min : time.getHours()*60 % min + min;
								this.min = min % 60;
							}
						}

				})();
				time.setHours(0, addMin.hour, 0, 0);
				time.setMinutes(addMin.min, 0, 0);
				localStorage.setItem("switch_background_when_opening_page",
					JSON.stringify(daySettings.random_selection.period == 0));
				var types = daySettings.random_selection.type.map(function(elem, i){
					return (elem)? ["video", "image", "color", "live"][i] : elem;
				}).filter(elem => elem);
				//console.log(types)
				//console.log(bgList)
				while(types.length > 0){
					//console.log(daySettings.random_selection.type)					
					type_BG = types[Math.round(Math.random()*(types.length-1))]
					//console.log(type_BG)
					//console.log(bgList[type_BG])
					if(bgList[type_BG].length == 0)
						types = types.filter(elem => elem != type_BG);
					else break;
				}
				//console.log(types)
				//console.log(type_BG)
				if(types.length == 0){
					notification({
						image: "../image/ic_error_white_24dp_1x.png",
						text: "Нет фонов",
						timeout: 6000
					});
					return;
				}
				numb_BG_in_list = Math.round((bgList[type_BG].length-1)*Math.random());
				bgList.background_set_now = [bgList[type_BG][numb_BG_in_list]];
				bgList.background_set_now[0].type = type_BG;
			}else{
				//КОНКРЕТНЫЙ
				time.setHours(0, 1440, 0, 0);
				time.setMinutes(0, 0, 0);
				localStorage.setItem("switch_background_when_opening_page", JSON.stringify(false));
				type_BG = "background_set_now";
				numb_BG_in_list = 0;
				bgList.background_set_now = [];
				bgList.background_set_now[0] = daySettings.specifically_selection;
			}
			localStorage.setItem("next_check_background", JSON.stringify(time.getTime()));
			console.info("NEW BACKGROUND NAME: "+bgList[type_BG][numb_BG_in_list].name)
			//type_BG = bgList[type_BG][numb_BG_in_list].type;
			setBackground(
				type_BG,
				bgList[type_BG][numb_BG_in_list].type,
				((bgList[type_BG][numb_BG_in_list].color)? 
					bgList[type_BG][numb_BG_in_list].color:
					bgList[type_BG][numb_BG_in_list].name),
				bgList[type_BG][numb_BG_in_list].isPixelArt,
				callback,
				(daySettings.background_selection == 0)
			);	
			bgList.background_set_now[0].mode = daySettings.background_selection == 0;
			saveFile(bgList);
		}, function(isSuccess, resultErr){
			//console.log(resultErr);
		});
	}
}

function getBackgroundNowSet(settingsFile, callback){
	bgPage.Window.DB.changeFile("/settings/backgroundsList.json", function(bgList, saveFile){
		setBackground(bgList.background_set_now[0].type,
					  bgList.background_set_now[0].type,
					  ((bgList.background_set_now[0].color)?
					  	bgList.background_set_now[0].color:
					  	bgList.background_set_now[0].name),
					  bgList.background_set_now[0].isPixelArt,
					  callback,
					  bgList.background_set_now[0].mode);	
	});
}

function setBackground(type, typeOfBG, name, isPixelArt, callback, isRandMode){
	console.log("type: "+type+" name: "+name+" isPixelArt: "+isPixelArt);
	if(typeOfBG == "color") document.getElementById("blind").classList.add("hide");
	else document.getElementById("blind").classList.remove("hide");
	console.info("NEXT SWITCH BACKGROUND: "+(new Date(JSON.parse(localStorage.getItem("next_check_background")))));
	//if(header_menu) header_menu.addClass("hide");
	if(document.getElementById("background")){
		document.getElementById("background").classList.add("hide");
		setTimeout(function(){
			document.getElementById("background").remove();
			setBackground(type, typeOfBG, name, isPixelArt, callback, isRandMode);
		}, 300);
		return;	
	}
	switch(typeOfBG){
		case "video": 
			UI.createElem(document.getElementById("backgroundWraper")).appendChild(UI.createElem({
				tag: "video",
				attr: [
					{tag: "autoplay", value: "true"},
					{tag: "loop", value: "true"},
					{tag: "muted", value: "true"},
					{tag: "id", value: "background"},
					{tag: "src", value: Window.dataOfTab.namespace+"/backgrounds/full/"+name}
				],
				class: ((isPixelArt)? "bgPIXEL" : "")+" hide",
				special: {
					onloadedmetadata: function(event){
						setTimeout(function(){
							event.srcElement.classList.remove("hide");
						}, 300);					
					},
					onerror: function(){
						console.error("ERROR LOAD VIDEO");
						if(isRandMode){
							bgPage.Window.DB.changeFile("/settings/settings.json", function(file){getBackground(file);});
							return;
						}
						notification({
							image: "../image/ic_error_white_24dp_1x.png",
							text: "Не удается загрузить фон",
							timeout: 6000
						});
					}
				}
			}));
			typeOfBG = "image";
			break;
		case "image": 
			UI.createElem(document.getElementById("backgroundWraper")).appendChild(UI.createElem({
				tag: "img",
				attr: [
					{tag: "id", value: "background"},
					{tag: "src", value: Window.dataOfTab.namespace+"/backgrounds/full/"+name}
				],
				class: ((isPixelArt)? "bgPIXEL" : "")+" hide",
				special: {
					onload: function(event){
						setTimeout(function(){
							document.getElementById("background").classList.remove("hide");
						}, 300);					
					},
					onerror: function(){
						console.error("ERROR LOAD IMAGE");
						if(isRandMode){
							bgPage.Window.DB.changeFile("/settings/settings.json", function(file){getBackground(file);});
							return;
						}
						notification({
							image: "../image/ic_error_white_24dp_1x.png",
							text: "Не удается загрузить фон",
							timeout: 6000
						});
					}
				}
			}));
			typeOfBG = "image";
			break;
		case "color": 
			UI.createElem(document.getElementById("backgroundWraper")).appendChild(UI.createElem({
				tag: "div",
				class: "color hide",
				attr: [
					{tag: "id", value: "background"},
				],
				style: ["background-color: "+name+";"]
			}));
			setTimeout(function(){
				document.getElementById("background").classList.remove("hide");
			}, 10);
			typeOfBG = "color";
			break;
	}
	localStorage.setItem("bg_preview_now_set", "background-"+typeOfBG+": "+
		((typeOfBG == "color")? "" : "url('"+Window.dataOfTab.namespace+"/backgrounds/preview/")+name+
		((typeOfBG == "color")? "" : "')"));
	if(header_menu)
		header_menu.addClass("hide", function(){
			header_menu.changeStyle("background-image");
			header_menu.changeStyle([{
				tag: localStorage.getItem("bg_preview_now_set").substring(0, localStorage.getItem("bg_preview_now_set").indexOf(":")),
				value: localStorage.getItem("bg_preview_now_set").substring(localStorage.getItem("bg_preview_now_set").indexOf(":")+2)
			}], function(){
				header_menu.removeClass("hide");
			});
		});
	if(callback) callback();
};

var body = UI.createElem(document.getElementById("settings_zone"));
var globalBody = UI.createElem(document.getElementById("bodyWraper"));

var hideCursorTimer;

document.getElementById("menu").onclick = openMenu;
document.getElementById("change_bg").onclick = function(){
	if(document.getElementById("change_bg").inProgress) return;
	document.getElementById("change_bg").inProgress = true;
	document.getElementById("change_bg").classList.add("in_progress");
	setTimeout(function(){
		document.getElementById("change_bg").inProgress = false;
		document.getElementById("change_bg").classList.remove("in_progress");
	}, 1000);
	bgPage.Window.DB.changeFile("/settings/settings.json", function(file){getBackground(file);});
}
document.getElementById("marks_block").appendChild(UI.createButton({
	settings: {
		attr: [
			{tag: "title", value: "Добавить закладку"},
			{tag: "id", value: "add_site_button"}
		],
		style: ["display: none"],
		class: "button_add_site hide",
		content: "Добавить закладку"
	},
	click: function(){
		bgPage.Window.DB.changeFile("/settings/sitesList.json", function(file){
			AddSite(file.all.map(obj=>obj.name_group), function(){
				drawAllSites();
			});
		});
	}
}).element);


/*greeting();
function greeting(){
	console.log("Hey) What are you doing here?");
}
function drawADrawing(){
	console.log("Yeeah) Since you could find this picture, then you can go even further");
	console.log("");
	console.log("");
	console.log("");
	console.log("");
	console.log("");
	console.log("");
}*/

/*--------------------------------------------------------------------------------------*/
/*--------------------------------ТЕСТОВАЯ ЗОНА-----------------------------------------*/
/*--------------------------------------------------------------------------------------*/
/*test();
setTimeout(test, 500);
setTimeout(test, 1000);
function test(){
	notification({
		text: "Подготовка...",
		image: "../image/ic_file_download_white_24dp_1x.gif",
		deadFunc: function(dead, notic){
			setTimeout(function(){
				dead();		
				setTimeout(test, 500);
			}, 1000);			
		}
	});
}
notification({
	text: "Подготовка...",
	image: "../image/ic_file_download_white_24dp_1x.gif",
	deadFunc: function(dead, notic){			
	}
});
notification({
	text: "Подгот asd asd ass fad овка...",
	image: "../image/ic_file_download_white_24dp_1x.gif",
	deadFunc: function(dead, notic){			
	}
});*/