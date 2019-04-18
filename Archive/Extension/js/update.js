console.info("START UPDATE APPLICATION");
var bgPage = chrome.extension.getBackgroundPage();

updateStack = [
	function(callback){
	//TO VER.2
		if(JSON.parse(localStorage.getItem("version")) >= 2){
			callback();
			return;
		}
		localStorage.setItem("training_stage", 1);
		localStorage.setItem("version", 2);
		Window.DB.getFS("/", function(rootFS){
			Window.DB.createFS(rootFS, "icons", function(isSuccess){
				Window.DB.changeFile("/settings/settings.json", function(a, s){
					a.hide_right_menu = true;
					a.use_site_panel = true;
					a.site_panel_substrate = true;
					a.site_panel_position = 3;
					s(a);	
				}, function(){
					Window.DB.set("/settings", {
						file: new Blob([JSON.stringify({
							favorites: [],
							all: []
						})], {type: "application/json"}),
						name: "sitesList.json"
					}, function(isSuccess){
						callback();
					})
				});
			});
		});
	},
	function(callback){
	//TO VER.3
		Window.DB.changeFile("/settings/settings.json", function(file){
			if(file.notes && file.notes.length != 0) document.getElementById("save-note").classList.remove("hide");
			if(JSON.parse(localStorage.getItem("version")) >= 3){
				callback();
				return;
			}
			localStorage.setItem("training_stage", 8);
			localStorage.setItem("version", 3);
			Window.DB.getFS("/", function(rootFS){
				Window.DB.createFS(rootFS, "backups", function(isSuccess){
					callback();
				});
			});
		});
	},
	function(callback){
		//TO VER.4
		Window.DB.changeFile("/settings/settings.json", function(file){
			if(JSON.parse(localStorage.getItem("version")) >= 4){
				callback();
				return;
			}
			localStorage.setItem("training_stage", 8);
			localStorage.setItem("version", 4);
			Window.DB.changeFile("/settings/settings.json", function(a, s){
				a.open_site_panel_start = false;
				a.custom_tab_name = "clockTab";
				a.dark_theme = false;
				a.low_brightness_bg = false;
				s(a);	
			}, callback);
		});
	},
	function(callback){
	//TO VER.5
		Window.DB.changeFile("/settings/settings.json", function(file){
			if(JSON.parse(localStorage.getItem("version")) >= 5){
				callback();
				return;
			}
			localStorage.setItem("training_stage", 8);
			localStorage.setItem("version", 5);
			Window.DB.changeFile("/settings/settings.json", function(a, s){
				s(a);	
			}, callback);
		});
	},
	function(callback){
	//TO VER.6
		Window.DB.changeFile("/settings/settings.json", function(file){
			if(JSON.parse(localStorage.getItem("version")) >= 6){
				callback();
				return;
			}
			localStorage.setItem("training_stage", 8);
			localStorage.setItem("version", 6);
			Window.DB.changeFile("/settings/settings.json", function(a, s){
				a.new_theme = false;
				s(a);	
			}, callback);
		});
	}
];

(function update(ver){
	if(ver < updateStack.length) updateStack[ver](function(){update(ver+1)});
	else{
		console.info("SUCCESS UPDATE APPLICATION");
	}
})(0);



document.getElementById("start_work").onclick = function(){
	document.body.classList.add("hide");
	setTimeout(function(){
		window.open("main.html", "_self");
	}, 300);	
}

document.getElementById("download_notes").onclick = function(){
	Window.DB.changeFile("/settings/settings.json", function(file){
		if(file.notes && file.notes.length != 0) downloadNotes(file.notes);
	});
}

function downloadNotes(files){
	queueProcessing(files.length, 0, function(next, i){
		Window.DB.changeFile("/note/note_"+files[i].create_date+".json", function(file){
			var dwn = document.createElement("a");
			dwn.setAttribute("href", URL.createObjectURL(new Blob([file.content], {
				type: "text/plain",
		    	endings: 'native'
			})));
			dwn.setAttribute("download", ((file.subject)? file.subject :"Заметка")+".txt");
			dwn.click();
			next();
		});
	}, function(){

	});
	function queueProcessing(size, now, operation, finishCallback){
		if(size == now){
			if(finishCallback) finishCallback();
			return;
		}
		operation(function(){
			queueProcessing(size, now+1, operation, finishCallback)
		}, now);
	}
}