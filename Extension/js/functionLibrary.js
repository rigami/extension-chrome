function saveBackgroundFileInSystem(file, callback){
	//console.log(file);
	//(file.file.type.substring(0, file.file.type.indexOf("/")) != "video")
	file.type = (file.type)? file.type.substring(0, file.type.indexOf("/")) : file.file.type.substring(0, file.file.type.indexOf("/"));
	file.name = (file.name)? file.name.replace(/\r|\n/g, '_') : file.file.name.replace(/\r|\n/g, '_');
	file.prefix = file.type.toUpperCase()+"_"+((file.isLocal)? "LOCAL_FILE_" : "CATALOG_FILE_");

	Window.DB.changeFile("/settings/backgroundsList.json", function(list, saveFile){
		//console.log(file)
		file.name = file.prefix+"("+list[file.type].length+")_"+file.name;
		if(file.type == "color")
			list["color"].push({
				name: file.name,
				color: file.color
			});
		else
			list[file.type].push({
				name: file.name,
				isPixelArt: file.isPixelArt
			});
		if(!file.isLocal){
			list.download.push(file.urlFile);
			list[file.type][list[file.type].length-1].urlFile = file.urlFile;
		}
		file.number = list[file.type].length;
		saveFile(list);
	}, function(isSuccess){
		if(!isSuccess){
			notification({
				image: "../image/ic_error_white_24dp_1x.png",
				text: "Ошибка записи файла"
			});
			return;
		}
		if(file.type == "color"){
			callback(file.number);
			return;
		}
		Window.DB.set("/backgrounds/full", {
			file: file.file,
			name: file.name
		}, function(isSuccess){
			if(!isSuccess){
				notification({
					image: "../image/ic_error_white_24dp_1x.png",
					text: "Ошибка записи файла"
				});
				return;
			}
			Window.DB.set("/backgrounds/preview", {
				file: file.preview,
				name: file.name
			}, function(isSuccess){
				if(!isSuccess){
					notification({
						image: "../image/ic_error_white_24dp_1x.png",
						text: "Ошибка записи файла"
					});
					return;
				}
				//alert("FILE SAVE");
				callback(file.number);
			});
		});
	});
}
if(localStorage.getItem("first_contact")){
	Window.DB.sendRequest("http://danilkinkin.com/projects/clockTab/news.php", {},
	function(result){
		if(result && !!JSON.parse(result) && JSON.parse(result).advId != localStorage.getItem("blocked_advertising_id")) localStorage.setItem("advertising_post", result);
	});
}