(function(){

	var cache = {}

	var machine = {
		/*
			Отправка запроса в сеть
				path - адрес
				args - подписи
				callback - функция возвращающая результат
				type - тип запроса, по умолчанию POST
				progress - функция возвращающая процент загрузки
				abort - функция прерывания загрузки
		*/
		sendRequest: function(path, args, callback, settings, progress, abort){

			if(args.circs){
				args.circs = args.circs.map(function(elem){
					return elem.searchField+"="+"'"+elem.compare+"'";
				});
				args.circs = args.circs.join(" and ");
			}

			var boundary = String(Math.random()).slice(2);
			var boundaryMiddle = '--' + boundary + '\r\n';
			var boundaryLast = '--' + boundary + '--\r\n'

			var body = ['\r\n'];
			for (var key in args) body.push('Content-Disposition: form-data; name="' + key + '"\r\n\r\n' + args[key] + '\r\n');

			body = body.join(boundaryMiddle) + boundaryLast;

			var xhr = new XMLHttpRequest();
			if(!settings) settings = {};
			if(settings.blob) xhr.responseType = 'arraybuffer';
			xhr.open((settings.type)? settings.type : 'POST',  path, true);

			xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);

			xhr.onprogress = function(event){
				if(progress) progress(event.loaded/event.total*100);
			}

			xhr.onreadystatechange = function() {
				if (this.readyState != 4) return;				
				if(callback){
					if(settings.blob) callback(new Blob([new Uint8Array(this.response)]));
					else callback(this.responseText);
				}
			}

			if(abort) abort(xhr.abort);

			xhr.send(body);
		},
		/*
			Получить файловую систему
		*/
		getFS(path, callback, resultFunction){
			window.webkitRequestFileSystem(PERSISTENT, null, function(fs) {
				if(path == "/"){
					callback(fs.root);
					if(resultFunction) resultFunction(true);
				}else{
					fs.root.getDirectory(path.substring(1), {create: false}, function(dirEntry){
						callback(dirEntry);
						if(resultFunction) resultFunction(true);
					}, function(){
						console.error("NOT FIND PATH: "+path);
						if(resultFunction) resultFunction(false);
					});
				}
			}, function(){
				console.error("NOT FIND PATH: "+path);
				if(resultFunction) resultFunction(false);
			});
		},
		/*
			Создать файловую систему
				fileSystem - файловая система для записи
				name - название директрории
				resultFunction - функция вызываемая при удачном создании или ошибки директории
					isSuccess - была ли успешено создана директория
					fileSystem - директория при удачной записи
		*/
		createFS(filesystem, name, resultFunction){
			filesystem.getDirectory(name, {create: true}, function(fs){
				console.info("SUCCES CREATE DIRECTORY: "+fs.fullPath);
				resultFunction(true, fs);
			}, function(){
				console.error("ERROR CREATE DIRECTORY: "+filesystem.fullPath+"/"+name);
				resultFunction(false);
			});
		},
		/* 
			Записать данные
				path - путь записи файла
				data - сохроняемые данные
					file - записывемый файл
					name - название файла
				resultFunction - функция вызываемая при удачном сохраннении или ошибки записи файла
					isSuccess - был ли успешен записан файл
					comment - путь файла при удачной записи и ошибка при нейдачной
				fileSystem - файловая система для записи
		*/
		set: function(path, data, resultFunction, fileSystem){
			if(!fileSystem){
				machine.getFS(path, function(fsys){
					machine.set(path, data, resultFunction, fsys)
				});
				return;
			}
			fileSystem.getFile(data.name, {create: true}, function(fileEntry){
				fileEntry.createWriter(function(fileWriter){
					fileWriter.onwriteend = function(e){
						console.info("SUCCES CREATE FILE: "+data.name+" IN PATH: "+path)
			    		if(resultFunction) resultFunction(true, fileEntry.fullPath);
			      	};
			      	fileWriter.onerror = function(e){
			      		if(resultFunction) resultFunction(false, e.toString());
			      	};
			      	fileWriter.write(data.file);
		    	}, function(){
		    		if(resultFunction) resultFunction(false, "Ошибка записи");
		    	});
	  		}, function(){
	  			if(resultFunction) resultFunction(false, "Ошибка записи");
	  		});
		},
		/*	
			Получить данные
				path - путь нахождения файла
				resultFunction - функция вызываемая при нахождении файла, либо при его отсутсвии
					isSuccess - был ли файл найден
					file - искомый файл
		*/
		get: function(resultFunction, path){
			if(!path) return "filesystem:chrome-extension://"+chrome.runtime.id+"/persistent/";
			machine.getFS(path.substring(0, path.lastIndexOf("/")), function(fs){
				fs.getFile(path.substring(path.lastIndexOf("/")+1), {}, function(fileEntry) {
	    			resultFunction(true, fileEntry);
	    		}, function(){
	    			console.error("NOT FIND FILE IN PATH: "+path)
	    			resultFunction(false);
	    		});
			})
		},
		/*
			Удалить файл
				path - путь нахождения файла
				resultFunction - функция вызываемая при удачном удалении файла, либо при ошибке
					isSuccess - был ли файл удален
		*/
		removeFile: function(path, resultFunction){	
			machine.getFS(path.substring(0, path.lastIndexOf("/")), function(fs){
				fs.getFile(path.substring(path.lastIndexOf("/")+1), {}, function(fileEntry) {
	    			fileEntry.remove(
	    				function(){
	    					if(resultFunction) resultFunction(true);
	    					console.info("SUCCES REMOVE FILE: "+path.substring(path.lastIndexOf("/")+1));
	    				},
						function(){
							if(resultFunction) resultFunction(false);
							console.error("ERROR REMOVE FILE: "+path.substring(path.lastIndexOf("/")+1));
						}
	    			);
	    		},function(){
	    			if(resultFunction) resultFunction(false);
					console.error("NOT FIND FILE: "+path.substring(path.lastIndexOf("/")+1));
	    		});
			});
		},
		/*
			Просомтреть дерево
		*/
		tree: function(path, resultFunction){
			machine.getFS((path)? path : "/", function(fs){
				console.log("---start tree---");
				if(resultFunction) resultFunction(true);
				treeIttre(fs, null, 0, function(){console.log("---end tree---");}, "");
			},function(){
				if(resultFunction) resultFunction(false);
			});

			function treeIttre(fs, objectArr, nowKey, endFunc, level){
				if(!objectArr){
					var dirReader = fs.createReader();
					dirReader.readEntries (function(results) {
						if(results.length == 0){endFunc();}
						else treeIttre(fs, results, nowKey, endFunc, level);
					});
				}else{
					if(nowKey == objectArr.length){endFunc(); return;}
					if(objectArr[nowKey].isDirectory){
						console.log(level+objectArr[nowKey].name);
						fs.getDirectory(objectArr[nowKey].fullPath, {create: false}, function(dirEntry) {
							treeIttre(dirEntry, null, 0, function(){
								treeIttre(fs, objectArr, nowKey+1, endFunc, level);
							}, level+"  | ");
						});
					}else{
						console.log(level+objectArr[nowKey].name);
						treeIttre(fs, objectArr, nowKey+1, endFunc, level);
					}
				}
			}
		},

		getDirectoryFiles: function(path, resultFunction){
			machine.getFS((path)? path : "/", function(fs){
				var dirReader = fs.createReader();
				dirReader.readEntries (function(results) {
					resultFunction(results);
				});
			},function(){
				if(resultFunction) resultFunction(null);
			});
		},



		//--------------------------------------ГОТОВЫЕ МОДУЛИ------------------------------------------------------//
		/*
			Загрузка и сохраниение данных
				path - путь нахождения файла
				callback - функция возвращающая результат
					file - возвращаемый файл
					save - функция перезаписи файла
				resultFunction - функция вызываемая при удачном сохраннении или ошибки записи файла
					isSuccess - был ли успешен записан файл
		*/
		changeFile(path, callback, resultFunction){
			machine.get(function(isSuccess, file){
				if(isSuccess) getAsText(file, function(object){callback(object, save);});
				else resultFunction(false);		
			},path);
			function save(saveFile){
				cache[path] = saveFile;				
				machine.removeFile(path, function(isSuccessRemoveFile){
					if(isSuccessRemoveFile){
						machine.set(path.substring(0, path.lastIndexOf("/")),{
							name: path.substring(path.lastIndexOf("/")+1),
							file: new Blob([JSON.stringify(saveFile)], {type: "application/json"})
						}, function(isSuccess){
							console.info("EDITED FILE IS: "+isSuccess);
							if(resultFunction) resultFunction(isSuccess);
						});
					}					
				});
			}

			function getAsText(file, callback){
				file.file(function(file){			
					var reader = new FileReader();
					reader.onloadend = function(e){
						let object = undefined;
						try{
							object = JSON.parse(this.result);	
						}catch(e){
							if(resultFunction) resultFunction(false, this.result);
							console.error("error load data")
						}
						if(object) callback(object);				
					};
				    reader.readAsText(file);
			    });
			}
		},
		getCache: function(){
			return cache;
		},
		saveCache: function(){
			for(var path in cache){
				machine.removeFile(path, function(isSuccessRemoveFile){
					if(isSuccessRemoveFile){
						machine.set(path.substring(0, path.lastIndexOf("/")),{
							name: path.substring(path.lastIndexOf("/")+1),
							file: new Blob([JSON.stringify(cache[path])], {type: "application/json"})
						}, function(isSuccess){
							console.info("EDITED FILE IS: "+isSuccess);
							delete cache[path];
						});
					}					
				});
			}			
		},
		clearPath: function(path, fileSystem, succesCallback){
			if(!fileSystem){
				machine.getFS(path, function(fsys){
					machine.clearPath(path, fsys, succesCallback)
				});
				return;
			}
			clearIttre(fileSystem, null, 0, function(){
				console.log("Succes removed!");
				if(succesCallback) succesCallback();
			});

			function clearIttre(fs, objectArr, nowKey, endFunc, deleteDirect){
				if(!objectArr){
					var dirReader = fs.createReader();
					dirReader.readEntries (function(results) {
						if(results.length == 0){endFunc();}
						else clearIttre(fs, results, nowKey++, endFunc);
					});
				}else{
					if(nowKey == objectArr.length){endFunc(); return;}
					if(objectArr[nowKey].isDirectory){
						fs.getDirectory(objectArr[nowKey].fullPath, {create: false}, function(dirEntry) {
							clearIttre(dirEntry, null, 0, function(){
								dirEntry.remove(
								function(){console.log('Directory removed.');},
								function(){console.log("Error remove directory")});
								clearIttre(fs, objectArr, nowKey+1, endFunc);
							});
						});
					}else{
						objectArr[nowKey].remove(
								function(){console.log('File removed.');},
								function(){console.log("Error remove file")});
						clearIttre(fs, objectArr, nowKey+1, endFunc);
					}
				}
			}
		}
	};

	Window.DB = machine;
}());