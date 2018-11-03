var bgPage = chrome.extension.getBackgroundPage();

chrome.tabs.getSelected(null, function(tab){
	if(!~tab.url.indexOf("http")) window.close();	
	bgPage.Window.DB.changeFile("/settings/sitesList.json", function(file){	
		console.log(tab);
		AddSite({url: tab.url, name: tab.title}, file.all.map(obj=>obj.name_group), function(){
			setTimeout(function(){
				window.close();
			}, 300);
		});
	});	
});

function AddSite(obj, list, callback){	
	var parser = new bgPage.MConstr;
	var saveData = {
		group: 0,
		preview: {
			baseColor: null,
			select: undefined,
			images: [],
			previewList: UI.createElem({
				class: "preview_list",
				content: UI.createElem({
					tag: "h2",
					class: "mark_create_help",
					content: "Подождите, идет поиск иконок..."
				})
			})
		},
		saveButton: UI.createButton({
			settings: {
				style: ["margin-left: 10px"],
				isEnabled: false,
				content: "Добавить"
			},
			click: function(){
				bgPage.Window.DB.changeFile("/settings/sitesList.json", function(file, save){
					var name_icon = "web_ic_"+"t_"+Date.now()+".jpeg";
					if(list.length == 1){
						file.all.push({
							name_group: "Новая группа",
							description_group: "",
							sites: []
						});
						saveData.group = 0;
					}
					file.all[saveData.group].sites.push({
						image: (saveData.preview.images[saveData.preview.select].image == null)? null
								: "/icons/"+name_icon,
						name: (saveData.name.element.value),
						url: saveData.url.element.value,
						substring: (saveData.colorfull_sub.value)? ((saveData.preview.images[saveData.preview.select].baseColor != null)? saveData.preview.images[saveData.preview.select].baseColor 
																	 												   : saveData.preview.baseColor)
																 : null
					});
					if(saveData.preview.images[saveData.preview.select].image != null)
						saveData.preview.images[saveData.preview.select].image.toBlob(function(blob_icon){
							bgPage.Window.DB.set("/icons", {
								file: blob_icon,
								name: name_icon
							}, function(isSuccess){
								if(!isSuccess){
									notification({
										image: "../image/ic_error_white_24dp_1x.png",
										text: "Ошибка записи файла"
									});
									return;
								}
								//alert("FILE SAVE");														
								console.log(file)
								save(file);
							});
						}, "image/jpeg", 1);
					else save(file);
				},callback);
			}
		}),
		list: UI.createElem({class: "list_result"}),
		name: UI.createInput({
			settings: {
				special: {
					oninput: function(){
						if(saveData.preview.images.length == 0) return;
						if(saveData.name.element.value == "") saveData.saveButton.distabled(true);
						else if(saveData.preview.select != undefined) saveData.saveButton.distabled(false);
						if(saveData.name.element.value.length > 25)
							var newName = saveData.name.element.value.substring(0, 25)+"...";
						else
							var newName = saveData.name.element.value;
						saveData.preview.images.forEach(function(prw){
							prw.setName(newName)
						});
					}
				}			
			}
		}),
		url: UI.createInput(),
		colorfull_sub: UI.createSwitcher({
			click: function(value){
				if(saveData.preview.images.length == 0) return;
				saveData.preview.images.forEach(function(prw){
					if(value)
						prw.setBaseColor((prw.baseColor != null)? prw.baseColor : saveData.preview.baseColor);
					else
						prw.setBaseColor(null);
				});				
			},
			value: false,
			content: "Подложка основным цветом"
		})
	};
	parser.setProp(saveData);
	parser.createMarksList(obj);
	list.push("Создать новую группу");

	var form = UI.createElem({
		class: "site_panel_add_content",
		content: [
			UI.createElem({
				class: "collum",
				content: [
					UI.createElem({
						class: "preview_blur"
					}),
					saveData.preview.previewList
				]
			}),
			UI.createElem({
				class: "collum",
				content: [
					UI.createElem({
						style: ["padding-left: 0px;", "padding-top: 0;"],
						tag: "h1",
						content: "Добавление закладки"
					}),
					UI.createElem({tag: "h2", content: "Название"}),
					saveData.name,
					UI.createInfoWrap({
						text: "Добавить в группу",
						elem: UI.createSelection({
							options: list,
							value: undefined,//saveData.group,
							click: function(value, elem){
								if(value == list.length-1) newGroup(list, elem, saveData);									
								else saveData.group = value;					
							},
							click_alw: function(value, elem){
								if(list.length == 1) newGroup(list, elem, saveData);
							}
						})
					}),
					saveData.colorfull_sub,
					UI.createElem({
						style: ["bottom: 10px;", "position: absolute;", "right: 10px;"],
						content: saveData.saveButton
					})
				]
			})
		]
	});
	saveData.url.element.focus();
	document.body.appendChild(form.element);
}

function newGroup(list, elem, saveData){
	getTextPopup("Введите названиие группы", function(res){
		bgPage.Window.DB.changeFile("/settings/sitesList.json", function(file, save){
			file.all.push({
				name_group: res,
				description_group: "",
				sites: []
			});
			saveData.group = list.length-1;
			save(file);
		}, function(){
			console.log(elem)
			list.pop();
			list.push(res);
			list.push("Создать новую группу");	
			elem.setOptions(list);	
			elem.setValue(saveData.group);	
			//callback();								
		});
	},function(){
		elem.setValue(saveData.group);
	});
}

function getTextPopup(quest, callback, errCallback){
	var res = prompt(quest);
	if(res != null) callback(res);
	else errCallback();
}
