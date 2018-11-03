var bgPage = chrome.extension.getBackgroundPage();
var CLOCK = {
	startClockFunction: function(data){
		CLOCK = data.getData();		
	}
};

(function(){
	if(JSON.parse(localStorage.getItem("first_contact"))){
		document.getElementById("start_work").style = null;
		document.body.classList.add("finish_load");
		document.getElementById("messege").innerHTML = "Все готово!";
		return;
	}else{			
		console.log(!localStorage.getItem("clear_path_ext"))
		if(!localStorage.getItem("clear_path_ext")){
			Window.DB.clearPath("/", undefined, function(){
				console.info("CLEAR TRASH");
				localStorage.clear();
				localStorage.setItem("clear_path_ext", true);
				window.open("welcome.html", "_self");
			});
			return;
		}
	}
	localStorage.removeItem("clear_path_ext");
	console.info("FIRST START APPLICATION");
	console.info("create fileSystem and files for application");
	Window.DB.getFS("/", function(rootFS){
		Window.DB.createFS(rootFS, "settings", function(isSuccess, settingsFS){
			Window.DB.createFS(rootFS, "note", function(isSuccess){
				Window.DB.createFS(rootFS, "icons", function(isSuccess){
					Window.DB.createFS(rootFS, "backups", function(isSuccess){
						Window.DB.createFS(rootFS, "backgrounds", function(isSuccess, backgroundsFS){
							Window.DB.createFS(backgroundsFS, "preview", function(isSuccess){
								Window.DB.createFS(backgroundsFS, "full", function(isSuccess){									
									createData(settingsFS, backgroundsFS);
								});
							});
						});
					});
				});
			});
		});
	});
})();

function createData(settingsFS, backgroundsFS){
	Window.DB.set("/", {
		file: new Blob([JSON.stringify({
			/*
				Создание файла настроек
			*/
			background_switching_days: [true,true,true,true,true,true,true],
			type_of_watch: 1,
			hide_right_menu: true, 
			use_site_panel: true,
			open_site_panel_start: false,
			custom_tab_name: "clockTab",
			dark_theme: false,
			new_theme: false,
			low_brightness_bg: false,
			site_panel_substrate: true,
			site_panel_position: 3,
			background_dimming_level: 2,
			one_setting_for_selected_days: true,
			switching_background_in_mo: {
				background_selection: 0,
				random_selection: {
					period: 2,
					type: [true, true, true, false]
				},
				specifically_selection: {
					name: "",
					type: ""
				}
			},
			switching_background_in_tu: {
				background_selection: 0,
				random_selection: {
					period: 2,
					type: [true, true, true, false]
				},
				specifically_selection: {
					name: "",
					type: ""
				}
			},
			switching_background_in_we: {
				background_selection: 0,
				random_selection: {
					period: 2,
					type: [true, true, true, false]
				},
				specifically_selection: {
					name: "",
					type: ""
				}
			},
			switching_background_in_th: {
				background_selection: 0,
				random_selection: {
					period: 2,
					type: [true, true, true, false]
				},
				specifically_selection: {
					name: "",
					type: ""
				}
			},
			switching_background_in_fr: {
				background_selection: 0,
				random_selection: {
					period: 2,
					type: [true, true, true, false]
				},
				specifically_selection: {
					name: "",
					type: ""
				}
			},
			switching_background_in_sa: {
				background_selection: 0,
				random_selection: {
					period: 2,
					type: [true, true, true, false]
				},
				specifically_selection: {
					name: "",
					type: ""
				}
			},
			switching_background_in_su: {
				background_selection: 0,
				random_selection: {
					period: 2,
					type: [true, true, true, false]
				},
				specifically_selection: {
					name: "",
					type: ""
				}
			},
			switching_background_in_special: {
				background_selection: 1,
				random_selection: {
					period: 2,
					type: [true, true, true, false]
				},
				specifically_selection: {
					name: "IMAGE_CATALOG_FILE_(0)_0000.jpg",
					type: "image"
				}
			}
		})], {type: "application/json"}),
		name: "settings.json"
	}, function(isSuccess){
		Window.DB.set("/", {
			file: new Blob([JSON.stringify({
				video: [],
				image: [],
				color: [],
				live: [],
				background_set_now: [],
				download: []
			})], {type: "application/json"}),
			name: "backgroundsList.json"
		}, function(isSuccess){
			Window.DB.set("/", {
				file: new Blob([JSON.stringify({
					favorites: [],
					all: []
				})], {type: "application/json"}),
				name: "sitesList.json"
			}, function(isSuccess){
				bgPage.Window.DB.set("/", {
					file: new Blob([JSON.stringify(CLOCK)], {type: "application/json"}),
					name: "watch_1.json"
				}, function(){					
					console.info("SUCCESS CREATE FILES FOR APPLICATION");	
					loadBG();
				}, settingsFS);
			}, settingsFS)
		}, settingsFS)
	}, settingsFS)
}

function loadBG(){
	var offline = false;
	document.getElementById("load_info").innerHTML = "Инициализация";

	Window.DB.sendRequest("http://danilkinkinstudio.h1n.ru/backgrounds/full/0000.jpg", {}, function(full){
		if(full.size == 0) offline = true;
		Window.DB.sendRequest("http://danilkinkinstudio.h1n.ru/backgrounds/preview/0000.jpg", {}, function(preview){
			document.getElementById("load_info").innerHTML = "Финальная подготовка";
			if(offline){
				Window.DB.changeFile("/settings/settings.json", function(file, saveFile){
					file.switching_background_in_special.background_selection = 0;
					file.switching_background_in_special.specifically_selection = {
						name: "",
						type: ""
					}					
					saveFile(file);
				}, finStage);
			}else
				saveBackgroundFileInSystem({
					file: new File([full], "0000.jpg", {type: "image/"}),
					preview: new File([preview], "0000.jpg"),
					urlFile: "http://danilkinkinstudio.h1n.ru/backgrounds/0000.jpg",
					isPixelArt: false,
					isLocal: false
				}, finStage);

			function finStage(){
				setTimeout(function(){
					document.getElementById("start_work").style = null;
					setTimeout(function(){
						localStorage.setItem("first_contact", JSON.stringify(true));
						localStorage.setItem("version", 6);		
						localStorage.setItem("training_stage", 0);
						document.body.classList.add("finish_load");
						document.getElementById("messege").innerHTML = "Все готово!"+(offline? " Но фон не был загружен так как нет подключения к сети." : "");
						console.log("well done!");
					}, 50);
				}, 1000);
			}		
		},{type: "GET", blob: true}, function(percent){
			document.getElementById("load_info").innerHTML = (Math.round(percent*0.2+80))+"%";
		});			
	},{type: "GET", blob: true}, function(percent){
		document.getElementById("load_info").innerHTML = Math.round(percent*0.8)+"%";
	});	
}

function notification(object){
	console.log(object);
}

document.getElementById("start_work").onclick = function(){
	document.body.classList.add("hide");
	setTimeout(function(){
		window.open("main.html", "_self");
	}, 300);	
}