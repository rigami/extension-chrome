var now_menu_expand = null;
var header_menu = null;
var menu_block_is_colsed = true;

function openMenu(){
	if(Window.dataOfTab.sitePanel) return;
	Window.dataOfTab.menuIsOpen = true;
	Window.dataOfTab.sitePanelIsLooked = true;
	header_menu = UI.createElem({class: "head_bg", style: [localStorage.getItem("bg_preview_now_set")+";"]});
	//document.getElementById("interfaceWraper").classList.add("openMenu");
	body.appendChild(UI.createButton({
		click: function(){closeMenu()},
		settings: {
			class: "clear bgCloseButton"
		}
	}));
	var mainCntr = UI.createElem({
		class: "settings_block"
	});
	body.appendChild(mainCntr);
	mainCntr.appendChild(UI.createElem({
		tag: "h1",
		class: "logo",
		content: [
			UI.createElem({content: "ClockTab"}),
			header_menu
		]
	}));

	

	/*--------------------------------------------------------------------------------------*/
	/*-------------------------------НАСТРОЙКА ЧАСОВ----------------------------------------*/
	/*--------------------------------------------------------------------------------------*/

	mainCntr.appendChild(UI.createButton({
		click: function(event, elem){
			expandSmallMenu(elem, function(block, closeBlock, openBlock, addedCloseFunction){
				bgPage.Window.DB.changeFile("/settings/settings.json", function(file){
					constructorClockSettingsMenu(block, closeBlock, openBlock, addedCloseFunction, file);
					openBlock(elem);
				});				
			}); 				
		},
		settings: {
			class: "clear settings_button",
			style: ["background-image: url(../image/ic_watch_later_black_24dp_1x.png)"],
			attr: [{tag: "id", value: "menu-clock"}],
			content: "Часы"
		}
	}));

	function constructorClockSettingsMenu(block, closeBlock, openBlock, addedCloseFunction, data){
		/*
			RIGHT MENU
		*/
		block.appendChild([
			UI.createInfoWrap({
				text: "Стиль часов",
				elem: UI.createSelection({
					options: ["Без часов", "Классические", "Циферблат", "Вертикальные"/*, "Перекедные"*/],
					value: data.type_of_watch,
					click: function(value){
						bgPage.Window.DB.changeFile("/settings/settings.json", function(file, saveFile){
							file.type_of_watch = value;
							data = file;
							CLOCK.disconnectClock(function(){
								if(file.type_of_watch != 0)
								CLOCK.connectClock(data.type_of_watch, function(){
									constructorClockSettings(data.type_of_watch, CLOCK.loadSettings);								
								});
							});
							saveFile(file);						
						});
					}
				})
			})
		]);
		
		/*
			LEFT MENU
		*/
		var rightMenu = UI.createElem({class: "settings_rightMenu hide"});
		var gl_clockBlock = undefined;		

		function constructorClockSettings(type, callback){
			if(gl_clockBlock){	
				gl_clockBlock.addClass("hide", function(){
					gl_clockBlock.remove();
					gl_clockBlock = undefined;
					constructorClockSettings(type, callback);
				});
				return;
			}
			if(type == 0) return;
			gl_clockBlock = UI.createElem({class: "settings_dayManager settings_dayManager_wraper hide"});
			gl_clockBlock.appendChild(UI.createElem({
				tag: "h1",
				class: "ahead",
				content: ["", "Классические часы", "Круглый циферблат", "Вертикальные часы", "Перекедные часы"][type]
			}));
			gl_clockBlock.type = type;
			callback(gl_clockBlock);
			rightMenu.appendChild(gl_clockBlock);
			setTimeout(function(){
				gl_clockBlock.removeClass("hide");
			}, 50);
		}
		constructorClockSettings(data.type_of_watch, CLOCK.loadSettings);

		//rightMenuTest//body.appendChild(rightMenu);
		block.appendChild(rightMenu);
		rightMenu.removeClass("hide");

		addedCloseFunction(function(){
			rightMenu.addClass("hide", function(){
				rightMenu.remove();
			});					
		});
	}

	/*--------------------------------------------------------------------------------------*/
	/*-------------------------------НАСТРОЙКА ПЛИТОК---------------------------------------*/
	/*--------------------------------------------------------------------------------------*/

	mainCntr.appendChild(UI.createButton({
		click: function(event, elem){
			expandSmallMenu(elem, function(block, closeBlock, openBlock, addedCloseFunction){
				bgPage.Window.DB.changeFile("/settings/settings.json", function(file){
					constructorSitePanelSettingsMenu(block, closeBlock, openBlock, addedCloseFunction, file);
					openBlock(elem);
				});				
			}); 				
		},
		settings: {
			class: "clear settings_button",
			style: ["background-image: url(../image/ic_fiber_smart_record_black_24dp_1x.png)"],
			attr: [{tag: "id", value: "menu-quick"}],
			content: "Меню быстрого доступа и закладки"
		}
	}));

	function constructorSitePanelSettingsMenu(block, closeBlock, openBlock, addedCloseFunction, data){
		/*
			RIGHT MENU
		*/
		block.appendChild([			
			UI.createElem({
				tag: "h2",
				class: "header_block",
				content: "Панель быстрого доступа"
			}),
			UI.createSwitcher({
				click: function(value){
					bgPage.Window.DB.changeFile("/settings/settings.json", function(file, saveFile){
						file.use_site_panel = value;
						data = file;
						saveFile(file);
						if(!value) document.getElementById("site_panel").classList.add("hide");
						else{
							drawFavPanel();
							document.getElementById("site_panel").classList.remove("hide");
						}
					}, function(isSuccess){
						//notification();
					});						
				},
				value: data.use_site_panel,
				content: "Использовать панель быстрого доступа"
			}),
			UI.createSwitcher({
				click: function(value){
					bgPage.Window.DB.changeFile("/settings/settings.json", function(file, saveFile){
						file.site_panel_substrate = value;
						data = file;
						saveFile(file);
						if(value) document.getElementById("site_panel").classList.add("substrate");
						else document.getElementById("site_panel").classList.remove("substrate");					
					}, function(isSuccess){
						//notification();
					});						
				},
				value: data.site_panel_substrate,
				content: "Отрисовывать подложку"
			}),
			UI.createInfoWrap({
				text: "Расположение панели",
				elem: UI.createSelection({
					options: ["Слева", "Вверху", "Справа", "Внизу"/*, "По центру"*/],
					value: data.site_panel_position,
					click: function(value){
						bgPage.Window.DB.changeFile("/settings/settings.json", function(file, saveFile){
							file.site_panel_position = value;
							data = file;
							saveFile(file);
							let site_panel = document.getElementById("site_panel");
							UI.createElem(site_panel.parentNode).addClass("hide", function(){
								site_panel.parentNode.parentNode.style.justifyContent = "";
								site_panel.parentNode.parentNode.style.alignItems = "";
								site_panel.style.flexDirection = "";
								site_panel.parentNode.style.paddingLeft = "";
								site_panel.parentNode.style.marginRight = "";
								site_panel.parentNode.parentNode.classList.add("looked_position");
								switch(file.site_panel_position){
									case 0:
										site_panel.parentNode.parentNode.style.justifyContent = "end";
										site_panel.style.flexDirection = "column";
									break;
									case 1: site_panel.parentNode.parentNode.style.alignItems = "end"; break;
									case 2:
										site_panel.parentNode.parentNode.style.justifyContent = "flex-end";
										site_panel.style.flexDirection = "column";
										site_panel.parentNode.style.paddingLeft = "72px";
										site_panel.parentNode.style.marginRight = "35px";
										site_panel.parentNode.parentNode.classList.remove("looked_position");
									break;
									case 3: site_panel.parentNode.parentNode.style.alignItems = "flex-end"; break;
								}
								site_panel.parentNode.classList.remove("hide");
							});																	
						},	function(isSuccess){});
					}
				})
			}),
			UI.createElem({
				tag: "h2",
				class: "header_block",
				content: "Панель закладок"
			}),
			UI.createSwitcher({
				click: function(value){
					bgPage.Window.DB.changeFile("/settings/settings.json", function(file, saveFile){
						file.open_site_panel_start = value;
						data = file;
						saveFile(file);						
					}, function(isSuccess){
						//notification();
					});						
				},
				value: data.open_site_panel_start,
				content: "Открывать закладки при старте"
			})
		]);

		addedCloseFunction(function(){});
	}

	/*--------------------------------------------------------------------------------------*/
	/*--------------------------------НАСТРОЙКА ФОНА----------------------------------------*/
	/*--------------------------------------------------------------------------------------*/

	mainCntr.appendChild(UI.createButton({
		click: function(event, elem){
			expandSmallMenu(elem, function(block, closeBlock, openBlock, addedCloseFunction){
				bgPage.Window.DB.changeFile("/settings/settings.json", function(fileS){
					bgPage.Window.DB.changeFile("/settings/backgroundsList.json", function(fileBG){
						constructorBackGroundsSettingsMenu(block, closeBlock, openBlock, addedCloseFunction, fileS, fileBG);
						openBlock(elem);
					});
				});				
			}); 	
		},
		settings: {
			class: "clear settings_button",
			style: ["background-image: url(../image/ic_panorama_black_24dp_1x.png)"],
			attr: [{tag: "id", value: "menu-bg"}],
			content: "Фон и планировщик"
		}
	}));

	function constructorBackGroundsSettingsMenu(block, closeBlock, openBlock, addedCloseFunction, data, dataBG){
		/*RIGHT MENU*/
		/*
			Выбор дней переключения фонов
		*/
		var daysCheckBoxs = [
			UI.createCheckBox({
				click: function(value){
					driveDayManager(0, value, false, allDaysSwitcher.value);
				},
				value: data.background_switching_days[0],
				content: "Понедельник"
			}),
			UI.createCheckBox({
				click: function(value){
					driveDayManager(1, value, false, allDaysSwitcher.value);
				},
				value: data.background_switching_days[1],
				content: "Вторник"
			}),
			UI.createCheckBox({
				click: function(value){
					driveDayManager(2, value, false, allDaysSwitcher.value);
				},
				value: data.background_switching_days[2],
				content: "Среда"
			}),
			UI.createCheckBox({
				click: function(value){
					driveDayManager(3, value, false, allDaysSwitcher.value);
				},
				value: data.background_switching_days[3],
				content: "Четверг"
			}),
			UI.createCheckBox({
				click: function(value){
					driveDayManager(4, value, false, allDaysSwitcher.value);
				},
				value: data.background_switching_days[4],
				content: "Пятница"
			}),
			UI.createCheckBox({
				click: function(value){
					driveDayManager(5, value, false, allDaysSwitcher.value);
				},
				value: data.background_switching_days[5],
				content: "Суббота"
			}),
			UI.createCheckBox({
				click: function(value){
					driveDayManager(6, value, false, allDaysSwitcher.value);							
				},
				value: data.background_switching_days[6],
				content: "Воскресенье"
			})
		];
		var allDaysSwitcher = UI.createSwitcher({
			click: function(value){
				bgPage.Window.DB.changeFile("/settings/settings.json", function(file, saveFile){
					file.one_setting_for_selected_days = value;
					data = file;
					saveFile(file);
				}, function(isSuccess){
					getBackground(data);
					//notification();
				});
				if(value){
					for(var i=0; i<7; i++) driveDayManager(i, false, true);
					driveDayManager(7, value, true);	
				}else{
					daysCheckBoxs.forEach(function(object, i){
						if(object.value) driveDayManager(i, true, true);
					});
					driveDayManager(7, value, true);
				}
					
			},
			value: data.one_setting_for_selected_days,
			content: "Общие настройки для выбраных дней"
		});
		block.appendChild([
			UI.createInfoWrap({
				text: "Загрузите свои фон, либо выберите из каталога",
				elem: UI.createButton({
					click: function(){
						BGManagerConstructor();
					},
					settings: {
						content: "Библиотека"
					}
				})
			}),
			UI.createElem({
				tag: "h2",
				class: "header_block",
				content: "Дни смены фона"
			}),
			daysCheckBoxs,
			allDaysSwitcher,
			UI.createElem({
				tag: "h2",
				class: "header_block",
				content: "Дополнительно"
			}),
			UI.createInfoWrap({
				text: "Уровень затеменения фона",
				elem: UI.createSelection({
					options: ["Без затемнения", "Слабо", "Нормально", "Сильно"],
					value: data.background_dimming_level,
					click: function(value){
						bgPage.Window.DB.changeFile("/settings/settings.json", function(file, saveFile){
							file.background_dimming_level = value;
							data = file;
							saveFile(file);
						}/*, notification*/);
					},
					hover: function(value){
						document.getElementById("blind").style.backgroundColor =
							"rgba(0,0,0,"+[0, 0.17, 0.3, 0.6][value]+")";
					}
				})
			})
		]);
		/*LEFT MENU*/
		/*
			Настройка дней
		*/
		var rightMenu = UI.createElem({class: "settings_rightMenu hide"});		
		daysCheckBoxs.forEach(function(object, i){
			rightMenu.appendChild(UI.createElem({
				attr: [{tag: "id", value: "settings_rightMenu_manager_"+i}],
				class: (((object.value)&&(!data.one_setting_for_selected_days))? "" : "hide") +
					" settings_dayManager_wraper",
				content: ((object.value)&&(!data.one_setting_for_selected_days))? dayManager(i) : undefined
			}));
		});
		rightMenu.appendChild(UI.createElem({
			attr: [{tag: "id", value: "settings_rightMenu_manager_7"}],
			class: ((data.one_setting_for_selected_days)? "" : "hide") + " settings_dayManager_wraper",
			content: (data.one_setting_for_selected_days)? dayManager(7) : undefined
		}));
		//rightMenuTest//body.appendChild(rightMenu);
		block.appendChild(rightMenu);
		setTimeout(function(){
			rightMenu.removeClass("hide");
		}, 50);

		function driveDayManager(day, act, notChange, saveOnly){
			{
				let checkValue = true;
				for(var i = 0; i < 7; i++)
					if(daysCheckBoxs[i].value){
						checkValue = false;
						break;
					}
				if(checkValue){
					daysCheckBoxs[day].setValue(true);
				}
			}
			if(!notChange){
				bgPage.Window.DB.changeFile("/settings/settings.json", function(file, saveFile){
					file.background_switching_days[day] = act;
					data = file;
					saveFile(file);
				}, function(isSuccess){
					getBackground(data);
					//notification();
				});
			}
			if(saveOnly) return;
			if(act){
				document.getElementById("settings_rightMenu_manager_"+day).appendChild(dayManager(day).element);
				document.getElementById("settings_rightMenu_manager_"+day).classList.remove("hide");
			}else{
				document.getElementById("settings_rightMenu_manager_"+day).classList.add("hide");
				setTimeout(function(){
					document.getElementById("settings_rightMenu_manager_"+day).innerHTML = "";
				}, 300);
			}
		}

		function dayManager(day){
			var daySettingsName = "switching_background_in_"+["mo", "tu", "we", "th", "fr", "sa", "su", "special"][day];
			var gl_dayBlock = UI.createElem({class: "settings_dayManager"});
			gl_dayBlock.appendChild(UI.createElem({
				tag: "h1",
				class: "ahead",
				content: [
					"Понедельник",
					"Вторник",
					"Среда",
					"Четверг",
					"Пятница",
					"Суббота",
					"Воскресенье",
					"Смена в выбранные дни"
				][day]
			}));
			gl_dayBlock.appendChild(UI.createInfoWrap({
				text: "Как выбирать фон",
				elem: (function(){
					let switcher = UI.createSelection({
						options: ["Случайно", "Конкретно"],
						value: data[daySettingsName].background_selection,
						click: function(value){						
							switch(value){
								case 0: 
									randomConstructor();
									bgPage.Window.DB.changeFile("/settings/settings.json", function(file, saveFile){
										file[daySettingsName].background_selection = value;
										data = file;
										saveFile(file);
									}, function(isSuccess){
										getBackground(data);
										//notification();
									});
									break;
								case 1:
									specificallyConstructor(switcher);								
									break;
							}
						}
					});
					return switcher;
				})()
			}));
			let settingsConstructor;
			function randomConstructor(){
				var wraperRandom = UI.createElem({
					class: (!settingsConstructor)? "hide" : ""
				});
				wraperRandom.appendChild(UI.createInfoWrap({
					text: "Когда менять фон",
					elem: UI.createSelection({
						options: [
							"При открытии",
							"Каждые 5 минут",
							"Каждые 30 минут",
							"Кажый час",
							"Каждые 6 часов",
							"Каждые 12 часов",
							"Раз в день"
						],
						value: data[daySettingsName].random_selection.period,
						click: function(value){
							bgPage.Window.DB.changeFile("/settings/settings.json", function(file, saveFile){
								file[daySettingsName].random_selection.period = value;
								data = file;
								saveFile(file);
							}, function(isSuccess){
								getBackground(data);
								//notification();
							});
						}
					})
				}));
				wraperRandom.appendChild(UI.createElem({
					tag: "h2",
					class: "header_block",
					content: "Какие фоны выбирать"
				}));
				var tBut = [
					UI.createCheckBox({
						click: function(value){
							editUsingType(0, value);
						},
						value: data[daySettingsName].random_selection.type[0],
						content: "Видео"
					}),
					UI.createCheckBox({
						click: function(value){
							editUsingType(1, value);
						},
						value: data[daySettingsName].random_selection.type[1],
						content: "Изображения"
					}),
					UI.createCheckBox({
						click: function(value){
							editUsingType(2, value);
						},
						value: data[daySettingsName].random_selection.type[2],
						content: "Сплошные цвета"
					})
				];
				wraperRandom.appendChild(tBut);

				function editUsingType(useType, setValue){
					{
						data[daySettingsName].random_selection.type[useType] = setValue;
						let tActive = data[daySettingsName].random_selection.type;
						if(!(tActive[0] || tActive[1] || tActive[2])){
							tBut[useType].setValue(true);
							data[daySettingsName].random_selection.type[useType] = !setValue;
							return;
						}
					}
					bgPage.Window.DB.changeFile("/settings/settings.json", function(file, saveFile){
						file[daySettingsName].random_selection.type[useType] = setValue;
						data = file;
						saveFile(file);
					}, function(isSuccess){
						getBackground(data);
						//notification();
					});
				}
				/*wraperRandom.appendChild(UI.createCheckBox({
					click: function(value){

					},
					value: data[daySettingsName].random_selection.type[0],
					content: "Живые обои"
				}));*/
				/*wraperRandom.appendChild(UI.createInfoWrap({
					text: "Какие фоны выбирать",
					elem: UI.createSelection({
						options: [
							"Только изображения",
							"Только видео",
							"Любые"
						],
						value: data[daySettingsName].random_selection.type,
						click: function(value){
							bgPage.Window.DB.changeFile("/settings/settings.json", function(file, saveFile){
								file[daySettingsName].random_selection.type = value;
								data = file;
								saveFile(file);
							}, function(isSuccess){
								getBackground(data);
								notification();
							});
						}
					})
				}));*/
				gl_dayBlock.appendChild(wraperRandom);					
				if(settingsConstructor)
					settingsConstructor.addClass("hide", function(){
						settingsConstructor.remove();
						wraperRandom.removeClass("hide");
						settingsConstructor = wraperRandom;
					});
				else settingsConstructor = wraperRandom;
				
			}
			function specificallyConstructor(switcher){
				console.log(switcher)
				var wraperSpec = UI.createElem({
					class: ((!settingsConstructor)? "hide" : "") + " bg-select-special",
					style: [
						"overflow: hidden;",
						"position: relative;",
						"background-color: #000;",
						"border-radius: 0px 0px 3px 3px;",
						"margin: 0px -10px;",
						"padding: 0px 10px;"
					]
				});
				var previewBlurWraper = UI.createElem({
					class: "preview_blur",
					style: [
						(data[daySettingsName].specifically_selection.type == "color")? 
							("background-color: "+data[daySettingsName].specifically_selection.name) : 
							("background-image: url('"+bgPage.Window.DB.get()+"/backgrounds/preview/"+
								data[daySettingsName].specifically_selection.name+"')")
					]
				});
				var previewBlur = UI.createElem({
					class: "preview",
					style: [
						(data[daySettingsName].specifically_selection.type == "color")? 
							("background-color: "+data[daySettingsName].specifically_selection.name) : 
							("background-image: url('"+bgPage.Window.DB.get()+"/backgrounds/preview/"+
								data[daySettingsName].specifically_selection.name+"')")
					]
				});
				var typeBG = UI.createElem({
					content: (function(){
						switch(data[daySettingsName].specifically_selection.type){
							case "video": return "Видео";
							case "image": return "Изображение";
							case "color": return "Сплошной цвет";
							case "live": return "Живые обои";
						}
					})()
				});

				if(switcher){
					setSpecial(true);
					return;
				}
								
				wraperSpec.appendChild(previewBlurWraper);
				wraperSpec.appendChild(UI.createInfoWrap({
					text: typeBG,
					class: "preview_info",
					style: ["position: relative;"],
					styleText: ["color: #fff !important;", "font-size: 21px !important"],
					elem: UI.createButton({
						settings: {
							content: "Изменить"
						},
						click: function(){setSpecial(false)}
					})
				}));
				wraperSpec.appendChild(UI.createInfoWrap({
					text: "",
					style: ["position: relative;"],
					elem: previewBlur
				}));
				gl_dayBlock.appendChild(wraperSpec);					
				if(settingsConstructor)
					settingsConstructor.addClass("hide", function(){
						settingsConstructor.remove();
						wraperSpec.removeClass("hide");
						settingsConstructor = wraperSpec;
					});
				else settingsConstructor = wraperSpec;


				function setSpecial(isCallback){
					specialCatalogBG(function(result){
						console.log(result)
						if(!result){
							if(switcher) switcher.setValue(0);
							return;
						}
						var bgListV;
						bgPage.Window.DB.changeFile("/settings/backgroundsList.json", function(bgList, saveFile){
							bgListV = bgList;
							bgList.background_set_now = [];
							bgList.background_set_now[0] = {};
							//console.log(bgList[result.type][result.number]);
							bgList.background_set_now[0] = bgList[result.type][result.number];
							bgList.background_set_now[0].type = result.type;
							//console.log(result.type)
							console.log("resr1.1")
							console.log(typeBG)
							typeBG.innerContent((function(){
								switch(result.type){
									case "video": return "Видео";
									case "image": return "Изображение";
									case "color": return "Сплошной цвет";
									case "live": return "Живые обои";
								}
							})());
							switch(result.type){
								case "color":
									previewBlurWraper.changeStyle("background-image");
									previewBlur.changeStyle("background-image");
									previewBlurWraper.changeStyle([{
										tag: "backgroundColor",
										value: result.name
									}]);
									previewBlur.changeStyle([{
										tag: "backgroundColor",
										value: result.name
									}]);
									break;
								default:
									previewBlurWraper.changeStyle([{
										tag: "backgroundImage",
										value: "url('"+bgPage.Window.DB.get()+"/backgrounds/preview/"+result.name+"')"
									}]);
									previewBlur.changeStyle([{
										tag: "backgroundImage",
										value: "url('"+bgPage.Window.DB.get()+"/backgrounds/preview/"+result.name+"')"
									}]);
									break;
							}
							saveFile(bgList);
						}, function(isSuccess){
							bgPage.Window.DB.changeFile("/settings/settings.json", function(file, saveFile){
								//console.log(bgListV)
								//console.log(daySettingsName);
								file[daySettingsName].background_selection = 1;
								file[daySettingsName].specifically_selection = {
									type: result.type,
									name: result.name,
									isPixelArt: bgListV[result.type][result.number].isPixelArt
								}
								data = file;
								saveFile(file);
							}, function(isSuccess){								
								//bgPage.Window.DB.changeFile("/settings/backgroundsList.json", function(a){console.log(a)});
								//bgPage.Window.DB.changeFile("/settings/settings.json", function(a){console.log(a)});
								getBackground(data);
								if(isCallback) specificallyConstructor(false);
								//notification();
							});
						});
					});
				}
			}

			function webConstructor(){
				var wraperWEB = UI.createElem({
					class: (!settingsConstructor)? "hide" : ""
				});
				gl_dayBlock.appendChild(wraperWEB);					
				if(settingsConstructor)
					settingsConstructor.addClass("hide", function(){
						settingsConstructor.remove();
						wraperWEB.removeClass("hide");
						settingsConstructor = wraperWEB;
					});
				else settingsConstructor = wraperWEB;
			}
			if(data[daySettingsName].background_selection) specificallyConstructor(); else randomConstructor();
			return gl_dayBlock;			
		}
		addedCloseFunction(function(){
			rightMenu.addClass("hide", function(){
				rightMenu.remove();
			});					
		});
	}

	/*--------------------------------------------------------------------------------------*/
	/*---------------------------------ДОПОЛНИТЕЛЬНО----------------------------------------*/
	/*--------------------------------------------------------------------------------------*/

	mainCntr.appendChild(UI.createButton({
		click: function(event, elem){
			expandSmallMenu(elem, function(block, closeBlock, openBlock, addedCloseFunction){
				bgPage.Window.DB.changeFile("/settings/settings.json", function(file){
					constructorMoreMenu(block, closeBlock, openBlock, addedCloseFunction, file);
					openBlock(elem);
				});				
			}); 				
		},
		settings: {
			class: "clear settings_button",
			style: ["background-image: url(../image/ic_more_horiz_black_24dp_1x.png)"],
			attr: [{tag: "id", value: "menu-additionally"}],
			content: "Дополнительно"
		}
	}));

	function constructorMoreMenu(block, closeBlock, openBlock, addedCloseFunction, data){
		
		//	RIGHT MENU
		
		block.appendChild([
			UI.createElem({
				tag: "h2",
				class: "header_block",
				content: "Интерфейс"
			}),
			UI.createSwitcher({
				click: function(value){
					bgPage.Window.DB.changeFile("/settings/settings.json", function(file, saveFile){
						file.hide_right_menu = value;
						data = file;
						saveFile(file);
						if(file.hide_right_menu) document.getElementById("interfaceWraper").className = "";
						else document.getElementById("interfaceWraper").className = "show_button_panel";	
					});						
				},
				value: data.hide_right_menu,
				content: "Скрывать кнопки на главном экране"
			}),
			UI.createInfoWrap({
				text: "Изменить имя вкладки",
				elem: UI.createButton({
					click: function(){
						var inputName = UI.createInput({
							settings: {content: data.custom_tab_name}
						});
						popup({
							name: "Редактирование имени вкладки",
							isWide: true,
							rightCol: (function(){											
								var col = [
									UI.createElem({tag: "h2", content: "Имя"}),
									inputName
								];
								return col;
							})(),
							buttons: {
								cancel: {click: function(){
									
								}},
								ok: {
									text: "Сохранить",
									click: function(){
										bgPage.Window.DB.changeFile("/settings/settings.json", function(file, save){
											file.custom_tab_name = inputName.element.value;
											localStorage.setItem("custom_tab_name", (!file.custom_tab_name.trim())? "u200E" : file.custom_tab_name);
											data = file;
											save(file);
										},
										function(){
											document.title = (localStorage.getItem("custom_tab_name") == "u200E")? "\u200E" : localStorage.getItem("custom_tab_name");
										});
									}
								}
							}
						}, function(){
							inputName.element.focus();
						});
					},
					settings: {
						content: "Изменить"
					}
				})
			}),
			UI.createSwitcher({
				click: function(value){
					bgPage.Window.DB.changeFile("/settings/settings.json", function(file, saveFile){
						file.new_theme = value;
						data = file;
						saveFile(file);
						if(file.new_theme) document.body.classList.add("theme-new");
						else document.body.classList.remove("theme-new");	
					});						
				},
				value: data.new_theme,
				content: "Упрощеный интерфейс"
			}),
			UI.createElem({
				tag: "h2",
				class: "header_block",
				content: "Резервное копирование и восстановление данных"
			}),
			UI.createButton({
				click: function(){
					var inputSpirit = document.createElement("input");
					inputSpirit.setAttribute("type", "file");
					inputSpirit.click();													
					inputSpirit.onchange = function(event){
						let name = event.srcElement.files[0].name.toLowerCase();
						if(name.substring(name.length-6) == ".ctbup"){
							let file = "";
							var reader = new FileReader();
							reader.onload = function(){
					        	try{
									file = JSON.parse(reader.result);
									console.log(file)
									if(file.product == "ClockTab" && file.type == "backup file")
										acceptBackupFile(file);
									else throw new Error();
								}catch(e){
									notification({
										image: "../image/ic_error_white_24dp_1x.png",
										text: "Неудается прочитать файл",
										timeout: 10000
									})
								}
					        };
					        reader.readAsText(event.srcElement.files[0]);
						}else{
							notification({
								image: "../image/ic_error_white_24dp_1x.png",
								text: "Неизвестный файл. Файлы воcстановления типа '.ctbup'",
								timeout: 10000
							})
						}						
					}
				},
				settings: {
					content: "Восстановление данных",
					style: ["display: block;","margin: 0px 10px 10px 10px;"]
				}
			}),
			UI.createButton({
				click: function(){
					let btns = null;						
					let swSite = UI.createSwitcher({
						click: function(value){
							btns.ok.distabled(!(value || swSettings.value /*|| swBG.value*/));
						},
						value: true,
						content: "Добавить сайты"
					});
					let swSettings = UI.createSwitcher({
						click: function(value){
							btns.ok.distabled(!(value || swSite.value /*|| swBG.value*/));
						},
						value: false,
						content: "Добавить настройки"
					});
					/*let swBG = UI.createSwitcher({
						click: function(value){
							btns.ok.distabled(!(value || swSettings.value || swSite.value));
						},
						value: false,
						content: "Добавить фоны"
					});*/
					popup({
						name: "Создание резервных данных",
						isWide: true,
						rightCol: [swSite, swSettings/*, swBG*/],
						buttons: {
							ok: {
								text: "Создать данные восстановления",
								click: function(){
									compileBackup({
										sites: swSite.value,
										settings: swSettings.value//,
										//bg: swBG.value,
									}, function(bcupFile){
										notification({text: "Данные успешно собраны"});
										bgPage.Window.DB.set("/backups/", {
											file: new Blob([JSON.stringify(bcupFile)], {type: "application/json"}),
											name: "clockTab Backup File ("+Date()+").ctbup"
										}, function(isSuccess, pathFile){
											var a = document.createElement('a');
											a.href = Window.dataOfTab.namespace+pathFile;
											a.download = "";
											a.click();
										});											
										console.log(bcupFile);
									});									
								}
							}
						}
					}, function(Nbtns){
						btns = Nbtns;
					})
				},
				settings: {
					content: "Создание резервных данных",
					style: ["margin: 0px 10px 10px 10px;"]
				}
			}),
			UI.createElem({
				tag: "h2",
				class: "header_block",
				content: "Ночная тема"
			}),
			UI.createSwitcher({
				click: function(value){
					bgPage.Window.DB.changeFile("/settings/settings.json", function(file, saveFile){
						file.dark_theme = value;
						data = file;
						saveFile(file);
						if(file.dark_theme) document.body.classList.add("night-theme");
						else document.body.classList.remove("night-theme");	
					});						
				},
				value: data.dark_theme,
				content: "Использовать ночную тему"
			}),
			UI.createSwitcher({
				click: function(value){
					bgPage.Window.DB.changeFile("/settings/settings.json", function(file, saveFile){
						file.low_brightness_bg = value;
						data = file;
						saveFile(file);
						if(file.low_brightness_bg) document.getElementById("backgroundWraper").classList.add("low-brightness");
						else document.getElementById("backgroundWraper").classList.remove("low-brightness");	
					});						
				},
				value: data.low_brightness_bg,
				content: "Понизить яркость фона"
			})
		]);
		addedCloseFunction(function(){});
	}

	/*--------------------------------------------------------------------------------------*/
	/*----------------------------------О ПРОЕКТЕ-------------------------------------------*/
	/*--------------------------------------------------------------------------------------*/

	mainCntr.appendChild(UI.createButton({
		click: function(event, elem){
			expandSmallMenu(elem, function(block, closeBlock, openBlock){
				block.changeStyle([{tag: "padding", value: "0px 20px"}]);
				block.appendChild([
					UI.createElem({
						class: "about_menu_plane",
						content: [
							UI.createElem({
								class: "icon_pl_ab"
							}),
							UI.createElem({
								content: [
									UI.createElem({
										class: "text_pl_ab",
										content: "Пройдите небольшой гайд, чтобы научиться пользоваться закладками"
									}),
									UI.createButton({
										settings:{
											content: "Начать",
											style: ["float: right;"]
										},
										click: function(){
											if(localStorage.getItem("training_stage") < 7){
												notification({
													image: "../image/ic_error_white_24dp_1x.png",
													text: "У вас уже открыто обучение"
												});
												return;
											}
											localStorage.setItem("training_stage", 0);
											guide();
										}
									})
								]
							})
						]
					}),
					UI.createElem({
						tag: "a",
						class: "href",
						attr: [
							{tag: "href", value: "http://danilkinkin.com"},
							{tag: "target", value: "_blank"}
						],
						content: "Другие проекты Danilkinkin"
					}),
					UI.createElem({
						tag: "a",
						class: "href",
						attr: [
							{tag: "href", value: "http://danilkinkin.com/projects/clockTab/donate"},
							{tag: "target", value: "_blank"}
						],
						content: "Поддержать проект"
					}),
					UI.createElem({
						tag: "a",
						class: "href",
						attr: [
							{tag: "href", value: "http://danilkinkin.com/projects/clockTab"},
							{tag: "target", value: "_blank"}
						],
						content: "О расширении"
					}),
					UI.createElem({
						tag: "a",
						class: "href",
						attr: [
							{tag: "href", value: "mailto:danilkinkin@gmail.com"},
							{tag: "target", value: "_blank"}
						],
						content: "Написать разработчику"
					}),
					UI.createElem({
						tag: "a",
						class: "href",
						attr: [
							{tag: "href", value: "http://danilkinkin.com/projects/clockTab/politics"},
							{tag: "target", value: "_blank"}
						],
						content: "Политика конфидициальности"
					}),
					UI.createElem({
						tag: "h2",
						content: "Danilkinkin | 2018"
					})
				]);
				openBlock(elem);
			}); 	
		},
		settings: {
			class: "clear settings_button",
			style: ["background-image: url(../image/ic_info_black_24dp_1x.png)"],
			content: "О проекте"
		}
	}));

	/*--------------------------------------------------------------------------------------*/
	/*-------------------------------НОВОСТНОЙ БЛОК-----------------------------------------*/
	/*--------------------------------------------------------------------------------------*/
	if(localStorage.getItem("advertising_post"))
		mainCntr.appendChild(UI.createElem({
			class: "adv-block",
			attr: [{tag: "id", value: "adv-block"}],
			content: [
				UI.createButton({
					settings:{
						content: "Больше не показывать это сообщение",
						class: "clear adv-close-btn"
					},
					click: function(){
						localStorage.setItem("blocked_advertising_id", JSON.parse(localStorage.getItem("advertising_post")).advId);
						localStorage.removeItem("advertising_post");
						document.getElementById("adv-block").remove();
					}
				}),
				UI.createElem({
					class: "adv-content",
					content: (function(){
						var wrp = JSON.parse(localStorage.getItem("advertising_post"));
						wrp = toDoc(wrp);
						return wrp;

						function toDoc(elem){
							console.log(elem);
							if(elem.content && typeof elem.content == "object"){
								if(elem.content.forEach) elem.content = elem.content.map(el => toDoc(el));
								else elem.content = toDoc(elem.content);
							}
							switch (elem.tag) {
								case "div":
									elem = UI.createElem(elem);
									break;
								case "btn":
									elem.click = new Function(elem.click);
									elem = UI.createButton(elem);
									break;
							}
							return elem;
						}
					})()

				})
			]
		}));

	function expandSmallMenu(button, callback){
		if(!!now_menu_expand) now_menu_expand.classList.remove("open-block");
		if(!menu_block_is_colsed) return;
		if(now_menu_expand && now_menu_expand.block){
			now_menu_expand.block.close(now_menu_expand);
			if(now_menu_expand == button) return;
		}
		
		var block = UI.createElem({
			tag: "div",
			class: "settings_small_block"
		});		

		function close(buttonParent){
			menu_block_is_colsed = false;
			let ths = this;
			if(buttonParent.closeFunction) buttonParent.closeFunction()
			if(buttonParent.block.addedCloseFunction) buttonParent.block.addedCloseFunction()
			block.removeClass("expand", function(){
				block.changeStyle("height", function(){
					ths.remove();
					if(buttonParent){
						buttonParent.block = null;
						menu_block_is_colsed = true;
					}
				}, 300);
			}, 50);
		}
		block.close = close;	
		button.block = block;
		now_menu_expand = button;
		menu_block_is_colsed = false;
		callback(block, close, function(butElem){		
			butElem.classList.add("open-block");
			button.parentNode.insertBefore(block.element, button.nextSibling);
			var heightBlock = block.element.clientHeight;
			block.addClass("zeroHeight", function(){
				block.changeStyle([{tag: "height", "value": heightBlock+"px"}], function(){
					block.addClass("expand");
					menu_block_is_colsed = true;
				});
			}, 50);			
		},
		function(addCloseFunc){
			block.addedCloseFunction = addCloseFunc;
		});
	}


	//document.getElementById("interfaceWraper").classList.add("hide");
	setTimeout(function(){
		body.removeClass(["hide", "zeroWidth"]);

	}, 200);	
}

function specialCatalogBG(callback){
	var content = UI.createElem({class: "content"});
	var BG_manager = UI.createElem({
		class: "BGManager hide",
		content: UI.createElem({
			class: "manager",
			content: [
				UI.createElem({
					class: "ahead",
					content: [
						UI.createElem({
							tag: "h1",
							content: "Выберите фон"
						}),
						UI.createButton({
							click: function(){
								callback(false);
								BG_manager.addClass("hide", function(){
									BG_manager.remove();
									Window.dataOfTab.widthPreviewContent = null;									
								}, 250);								
							},
							settings: {
								class: "clear close_manager"
							}
						})						
					]
				}), content
			]
		})
	});

	var catalog = UI.createElem({class: "select_catalog"});
	var catalogFiles = UI.createElem({class: "centralize-catalog"});	
	content.appendChild(catalog);
	catalog.appendChild([
		UI.createElem({
			class: "centralize-catalog",
			content: UI.createElem({
				class: "load-files-panel",
				content:[
					UI.createElem({
						tag: "h1",
						content: "Загрузите фон с компьютера"
					}),
					UI.createButton({
						settings: {content: "Загрузить"},
						click: function(){localCatalogAddedLocalFile(function(bgNew){
							callback(bgNew);
							BG_manager.addClass("hide", function(){
								BG_manager.remove();
								Window.dataOfTab.widthPreviewContent = null;									
							}, 250);
						}, true)}
					})
				]
			})
		}),
		catalogFiles
	]);
	fillCatalog();
	function fillCatalog(){
		catalogFiles.clearContent();
		bgPage.Window.DB.changeFile("/settings/backgroundsList.json", function(file){
			var url = bgPage.Window.DB.get()+"backgrounds/preview/";
			if((file.video.length == 0)&&
				   (file.image.length == 0)&&
				   (file.color.length == 0)&&
				   (file.live.length == 0)) catalogFiles.appendChild(UI.createElem({
					class: "charter",
					style: ["text-align: center;"],
					content: "У вас еще нет ни одного фона, загрузите их, либо добавьте свои"
				}));
				if(file.video.length != 0) catalogFiles.appendChild(UI.createElem({
					class: "charter",
					content: "Видео"
				}));
				file.video.forEach(function(object, i){
					catalogFiles.appendChild(constructorPreview(object.name, "video", i));
				});			
				if(file.image.length != 0) catalogFiles.appendChild(UI.createElem({
					class: "charter",
					content: "Изображения"
				}));
				file.image.forEach(function(object, i){
					catalogFiles.appendChild(constructorPreview(object.name, "image", i));
				});
				if(file.color.length != 0) catalogFiles.appendChild(UI.createElem({
					class: "charter",
					content: "Сплошные цвета"
				}));
				file.color.forEach(function(object, i){
					catalogFiles.appendChild(constructorPreview(object.color, "color", i));
				});
				if(file.live.length != 0) catalogFiles.appendChild(UI.createElem({
					class: "charter",
					content: "Живые обои"
				}));
				file.live.forEach(function(object, i){
					catalogFiles.appendChild(constructorPreview(object.name, "live", i));
				});

			function constructorPreview(name, type, number){
				return (function(){
					if(type != "color"){
						let img = new Image();
						img.src = url+name;
						img.onload = function(){
							preview.removeClass("hide");
						}					
					}
					var preview = UI.createButton({
						settings: {
							class: "preview clear "+((type != "color")? "hide" : ""),
							style: [(type != "color")? "background-image: url('"+url+name+"');" : "background-color: "+name+";"]
						},
						click: function(){
							callback({type: type, number: number, name: name});
							BG_manager.addClass("hide", function(){
								BG_manager.remove();
								Window.dataOfTab.widthPreviewContent = null;
							}, 250);
						}
					});
					return preview;
				})();
			}
		});		
	}					

	globalBody.appendChild(BG_manager);
	Window.dataOfTab.widthPreviewContent = BG_manager.element;
	Window.dataOfTab.updateVarStyles();
	setTimeout(function(){
		BG_manager.removeClass("hide");
	}, 50);
}

function BGManagerConstructor(openPage){
	var content = UI.createElem({class: "content"});
	var sortFunc;
	var sortBy = UI.createSelection({
		options: ["Сначала новые", "Сначала популярные"],
		click: function(val){
			sortFunc(val);
		}
	});
	var BG_manager = UI.createElem({
		class: "BGManager hide",
		content: UI.createElem({
			class: "manager",
			content: [
				UI.createElem({
					class: "ahead",
					content: [
						UI.createElem({
							tag: "h1",
							content: "Менеджер фонов"
						}),
						UI.createSelection({
							options: ["Каталог", "Загруженные"],
							settings: {
								style: ["margin-right: 15px;"]
							},
							style: ["margin-right: 15px;"],
							click: function(value){
								if(value == 0){
									webCatalog(function(sortFuncCal){
										sortFunc = sortFuncCal;
										sortFunc(sortBy.value);
									});

									sortBy.removeClass("DOE_hide");
								}else{
									localCatalog();
									sortBy.addClass("DOE_hide");
								}
							}
						}),
						sortBy,
						UI.createButton({
							click: function(){
								BG_manager.addClass("hide", function(){
									BG_manager.remove();
									Window.dataOfTab.widthPreviewContent = null;
								}, 250);								
							},
							settings: {
								class: "clear close_manager"
							}
						})
					]
				}), content
			]
		})
	});
	webCatalog(function(sortFuncCal){
		sortFunc = sortFuncCal;
		sortFunc(sortBy.value);
	});
	//Window.dataOfTab.countPreview = Math.floor((BG_manager.element.clientWidth-25)/260);

	function webCatalog(callback, bgList){
		if(!bgList){
			bgPage.Window.DB.changeFile("/settings/backgroundsList.json", function(a){webCatalog(callback, a.download)});
			return;
		}		
		content.clearContent();
		var pre_cont = UI.createElem({class: "web_catalog centralize-catalog"});
		pre_cont.appendChild(UI.createElem({
			class: "charter",
			content: "Медиа"
		}));
		var pre_cont_color = UI.createElem({class: "web_catalog centralize-catalog"});
		pre_cont_color.appendChild(UI.createElem({
			class: "charter",
			content: "Сплошные цвета"
		}));
		pre_cont_color.appendChild((function(){
			return [
				"#ff8c00", 
				"#e81123", 
				"#d13438", 
				"#c30052",
				"#bf0077", 
				"#9a0089", 
				"#881798", 
				"#744da9", 
				"#10893e", 
				"#107c10", 
				"#018574", 
				"#2d7d9a", 
				"#0063b1", 
				"#6b69d6", 
				"#8e8cd8", 
				"#8764b8", 
				"#038387", 				 
				"#486860", 
				"#525e54", 
				"#7e735f", 
				"#4c4a48", 
				"#515c6b", 
				"#4a5459", 
				"#000000"
			].map(function(color){
				var isDownload = bgList.find(elem => (elem == "color_"+color));
				var dwnButton = UI.createButton({
					settings: {
						class: "clear download-bg",
						content: "Добавить",
						attr: [{tag: "title", value: ((isDownload)? "Цвет добавлен" : "Добавить цвет в библиотеку")}]
					},
					click: function(){
						if(isDownload) return;
						bgPage.saveBackgroundFileInSystem({
							name: "color_"+color.substring(1),
							color: color,
							type: "color/",
							isLocal: false,
							urlFile: "color_"+color
						}, function(){
							notification({text: "Цвет добавлен в библиотеку"});
							dwnButton.element.onclick = null;
							dwnButton.setAttribute("title", "Фон добавлен");
							preview.addClass("download");														
						});	
					}
				});
				var preview = UI.createElem({
					class: "preview "+((isDownload)? "download" : ""),
					style: ["background-color: "+color+";"],
					content: [
						UI.createButton({
							settings: {
								class: "clear preview-open-button",
								content: "Предпросмотр",
								attr: [{tag: "title", value: "Предпросмотр фона"}]
							},
							click: function(){
								isDownload = preview.containsClass("download");
								var noteGWraper = UI.createElem({
									class: "manager_window previewBGinCatalog hide",
									content: [
										UI.createElem({
											class: "previewBGinCatalogWarp",
											content: [
												UI.createElem({
													tag: "div",
													style: [
														"width: 100%;",
														"height: 100%;",
														"box-shadow: 0 5px 12px rgba(0, 0, 0, 0.43);",
														"background-color: "+color+";",
														"border-radius: 3px;",
													],
													attr: [{tag: "background-color", value: color}]
												}),
												UI.createElem({class: "description-BG-File", content: [
													UI.createButton({
														settings: {
															content: (isDownload? "Фон уже добавлен" : "Добавить"),
															isEnabled: !isDownload,
															log: true
														},
														click: function(){
															noteGWraper.addClass("hide", function(){
																noteGWraper.remove();
															});
															bgPage.saveBackgroundFileInSystem({
																name: "color_"+color.substring(1),
																color: color,
																type: "color/",
																isLocal: false,
																urlFile: "color_"+color
															}, function(){
																notification({text: "Цвет добавлен в библиотеку"});
																dwnButton.element.onclick = null;
																dwnButton.setAttribute("title", "Фон добавлен");
																preview.addClass("download");														
															});		
														}
													}),					
													UI.createButton({
														settings: {class: "false", content: "Закрыть", style: ["margin-right: 15px;"]},
														click: function(){
															noteGWraper.addClass("hide", function(){
																noteGWraper.remove();
															})
														}
													})
												]})	
										]})	
									]
								});

								globalBody.appendChild(noteGWraper);
								setTimeout(function(){
									noteGWraper.removeClass("hide");
								}, 50);
							}
						}),
						UI.createElem({
							class: "trie",
							style: ["width: 240px; border-radius: 0px 0px 3px 3px;"],
							content: dwnButton
						})
					]
				});








				/*var preview = UI.createButton({
					settings:{class: "preview clear", style: ["font-size: 0;", "background-color: "+color+";"]},
					click: function(){
						preview.isDownload = preview.containsClass("download");
						var noteGWraper = UI.createElem({
							class: "manager_window previewBGinCatalog hide",
							content: [
								UI.createElem({
									class: "previewBGinCatalogWarp",
									content: [
										UI.createElem({
											tag: "div",
											style: [
												"width: 100%;",
												"height: 100%;",
												"box-shadow: 0 5px 12px rgba(0, 0, 0, 0.43);",
												"background-color: "+color+";",
												"border-radius: 3px;",
											],
											attr: [{tag: "background-color", value: color}]
										}),
										UI.createElem({class: "description-BG-File", content: [
											UI.createButton({
												settings: {
													content: (preview.isDownload? "Фон уже добавлен" : "Добавить"),
													isEnabled: !preview.isDownload,
													log: true
												},
												click: function(){
													noteGWraper.addClass("hide", function(){
														noteGWraper.remove();
													});
													bgPage.saveBackgroundFileInSystem({
														name: "color_"+color.substring(1),
														color: color,
														type: "color/",
														isLocal: false,
														urlFile: "color_"+color
													}, function(){
														notification({text: "Цвет добавлен в библиотеку"});
														preview.addClass("download");														
													});		
												}
											}),					
											UI.createButton({
												settings: {class: "false", content: "Закрыть", style: ["margin-right: 15px;"]},
												click: function(){
													noteGWraper.addClass("hide", function(){
														noteGWraper.remove();
													})
												}
											})
										]})	
								]})	
							]
						});

						globalBody.appendChild(noteGWraper);
						setTimeout(function(){
							noteGWraper.removeClass("hide");
						}, 50);
					}
				});
				if(bgList.find(elem => (elem == "color_"+color))) preview.addClass("download");	*/				
				return preview;
			});
		})());
		var previewWraper = UI.createElem();
		content.appendChild([pre_cont, pre_cont_color]);
		var spinner = UI.createElem({
			class: "load_spinner"
		});
		var searchTags = "";
		console.log(pre_cont.element)
		pre_cont.appendChild(spinner);
		bgPage.Window.DB.sendRequest("http://danilkinkin.com/backgrounds/getTagList.php", {},
		function(result){
			spinner.remove();
			//console.log(JSON.parse(result))
			try{
				if(JSON.parse(result).length == 0){
					pre_cont.appendChild(UI.createElem({
						tag: "h2",
						class: "info",
						content: "Данные не найдены"
					}));
					return;
				}
			}catch(e){
				pre_cont.appendChild(UI.createElem({
					tag: "h2",
					class: "info",
					content: "Неудалось загрузить данные с сервера, попробуйте позже"
				}));
				return;
			}
			var res = JSON.parse(result).map(function(curVall){
				return UI.createButton({
					click: function(){
						this.isSelect = !this.isSelect;
						if(this.isSelect){
							this.settings.object.addClass("select");							
							searchTags = ":"+curVall.id+":"+searchTags;
						}else{
							this.settings.object.removeClass("select");
							searchTags = searchTags.replace(":"+curVall.id+":", "");
						}
						//console.log(sortBy)
						search(searchTags, sortBy.value);
					},
					settings: {
						class: "clear tag_bg",
						content: curVall.tag
					}
				});
			});	
			//res[res.length]=;
			pre_cont.appendChild(UI.createElem({
				class: "tag_list",
				content: res
			}));
			pre_cont.appendChild(previewWraper);
		});

		callback(function(sortBy){
			search(searchTags, sortBy);
		})

		function search(searchTags, sortBy){
			//console.log(sortBy)
			if(searchTags)
				searchTags = "%:"+searchTags.substring(1, searchTags.length-1).split("::").map((a)=>(+a)).sort((a, b)=>(a>b)).join(":%:")+":%";
			else
				searchTags = "%";
			previewWraper.clearContent();
			previewWraper.appendChild(spinner);
			bgPage.Window.DB.sendRequest("http://danilkinkin.com/backgrounds/getBGList.php", {
				searchTag: searchTags,
				sortByPopular: sortBy
			}, function(result){
				spinner.remove();
				try{
					if(JSON.parse(result).length == 0){
						previewWraper.appendChild(UI.createElem({
							tag: "h2",
							class: "info",
							content: "По данным тегам ничего не найдено"
						}));
						return;
					}
				}catch(e){
					previewWraper.appendChild(UI.createElem({
						tag: "h2",
						class: "info",
						content: "Неудалось загрузить данные, попробуйте позже"
					}));
					return;
				}			
				JSON.parse(result).forEach(function(elemInCatalog){
					elemInCatalog.isDownload = bgList.find(elem => (elem == "http://"+elemInCatalog.url+elemInCatalog.name+"."+elemInCatalog.type));
					var dwnButton = UI.createButton({
						settings: {
							class: "clear download-bg",
							content: "Добавить",
							attr: [{tag: "title", value: ((elemInCatalog.isDownload)? "Фон добавлен" : "Добавить фон в библиотеку")}]
						},
						click: function(){
							if(preview.data.isDownload) return;
							notification({
								text: "Подготовка...",
								image: "../image/ic_file_download_white_24dp_1x.gif",
								deadFunc: function(dead, notic){
									bgPage.Window.DB.sendRequest("http://"+preview.data.url+"preview/"+preview.data.name+".jpg", {},
										function(previewFile){
											bgPage.Window.DB.sendRequest("http://"+preview.data.url+"full/"+preview.data.name+"."+preview.data.type, {},
												function(fullFile){
													//fullFile.type = "video/";
													//console.log(fullFile)
													bgPage.saveBackgroundFileInSystem({
														file: new File([fullFile], preview.data.name, {type: preview.data.kind+"/"}),
														preview: new File([previewFile], preview.data.name),
														isPixelArt: (preview.data.type == "gif")? true : false,
														isLocal: false,
														urlFile: "http://"+preview.data.url+preview.data.name+"."+preview.data.type
													}, function(){
														notification({text: "Фон успешно добавлен"});
														bgPage.Window.DB.changeFile("/settings/backgroundsList.json", function(a){bgList = a.download;});
														preview.addClass("download");
														dwnButton.element.onclick = null;
														dwnButton.setAttribute("title", "Фон добавлен");
														bgPage.Window.DB.sendRequest("http://danilkinkin.com/backgrounds/incDownloadBG.php", {
															nameBG: elemInCatalog.name
														},function(res){
															//console.log(res)
														});														
													});
													notic.innerContent("Загрузка завершена");
													setTimeout(function(){
														dead();
													}, 1000);													
												},
												{blob: true, type: "GET"},
												function(val){
													notic.innerContent("Загрузка фона "+(Math.ceil(val*0.8)+20)+"%");
											});
										},
										{blob: true, type: "GET"},
										function(val){
											notic.innerContent("Загрузка фона "+Math.ceil(val*0.2)+"%");
									});
								}
							});	
						}
					});
					var preview = UI.createElem({
						class: "preview hide "+((elemInCatalog.isDownload)? "download" : ""),
						content: [
							UI.createButton({
								settings: {
									class: "clear preview-open-button",
									content: "Предпросмотр",
									attr: [{tag: "title", value: "Предпросмотр фона"}]
								},
								click: function(){
									console.log("Предпросмотр")
									preview.data.isDownload = preview.containsClass("download");
									WebCatalogDownloadFile(preview.data, previewWraper, function(){
										bgPage.Window.DB.changeFile("/settings/backgroundsList.json", function(a){bgList = a.download;});
										preview.addClass("download");
										dwnButton.element.onclick = null;
										dwnButton.setAttribute("title", "Фон добавлен");
										bgPage.Window.DB.sendRequest("http://danilkinkin.com/backgrounds/incDownloadBG.php", {
											nameBG: elemInCatalog.name
										},function(res){
											//console.log(res)
										});
									})
								}
							}),
							UI.createElem({
								class: "trie",
								style: ["width: 240px; border-radius: 0px 0px 3px 3px;"],
								content: dwnButton
							})
						]
					})					
					var image = new Image();
					image.src = "http://"+elemInCatalog.url+"preview/"+elemInCatalog.name+".jpg";
					image.onload = function(){
						preview.changeStyle([{tag: "backgroundImage", value: "url("+image.src+")"}]);
						preview.removeClass("hide");
					}
					preview.data = elemInCatalog;			
					previewWraper.appendChild(preview);
				});
			});
		}
	}

	function WebCatalogDownloadFile(info, previewWraper, callback){
		/*addEventListener('resize', function() {
			Math.floor((previewWraper.clientWidth-10)/260)
		}, false);*/
		var spinner = UI.createElem({
			class: "load_spinner"
		});
		//console.log(info)
		var noteGWraper = UI.createElem({
			class: "manager_window previewBGinCatalog hide",
			content: [
				UI.createElem({
					class: "previewBGinCatalogWarp",
					content: [
						spinner,
						(function(){
							if(info.type != "video")
								return UI.createElem({
									tag: "img",
									style: [
										"max-width: 100%;",
										"max-height: 100%;",
										"box-shadow: 0 5px 12px rgba(0, 0, 0, 0.43);",
										"border-radius: 3px;",
										"transition: 0.3s ease;"
									],
									class: ((info.type == "gif")? "bgPIXEL" : "")+" display_none hide",
									attr: [{tag: "src", value: "http://"+info.url+"full/"+info.name+"."+info.type}],
									special: {
										onload: function(){
											spinner.remove();
											let ths = this;
											this.classList.remove("display_none");
											setTimeout(function(){ths.classList.remove("hide");}, 300);						
										},
										onerror: function(){
											console.error("ERROR LOAD IMAGE");
											spinner.remove();
											notification({
												image: "../image/ic_error_white_24dp_1x.png",
												text: "Не удается загрузить фон",
												timeout: 6000
											});
											noteGWraper.remove();
										}
									}
								});
							else
								return UI.createElem({
									tag: "video",
									style: [
										"max-width: 100%;",
										"max-height: 100%;",
										"box-shadow: 0 5px 12px rgba(0, 0, 0, 0.43);",
										"border-radius: 3px;",
										"transition: 0.3s ease;"
									],
									attr: [
										{tag: "autoplay", value: "true"},
										{tag: "loop", value: "true"},
										{tag: "src", value: "http://"+info.url+"full/"+info.name+"."+info.type}
									],
									class: "display_none hide",
									special: {
										onloadedmetadata: function(event){
											spinner.remove();
											let ths = this;
											this.classList.remove("display_none");
											setTimeout(function(){ths.classList.remove("hide");}, 300);											
										},
										onerror: function(){
											console.error("ERROR LOAD VIDEO");
											spinner.remove();
											notification({
												image: "../image/ic_error_white_24dp_1x.png",
												text: "Не удается загрузить фон",
												timeout: 6000
											});
											noteGWraper.remove();
										}
									}
								});
						})()
					]
				}),
				UI.createElem({class: "description-BG-File", content: [
					UI.createElem({
						class: "infoAboutBGInCatalog",
						content: "Автор: "+info.author+"<br><br>"+
								 info.info+"<br><br>"+
								 "Разрешение: "+info.resolution
						
					}),
					UI.createButton({
						settings: {
							content: (info.isDownload? "Фон уже добавлен" : "Добавить"),
							isEnabled: !info.isDownload,
							log: true
						},
						click: function(){
							noteGWraper.addClass("hide", function(){
								noteGWraper.remove();
							});
							notification({
								text: "Подготовка...",
								image: "../image/ic_file_download_white_24dp_1x.gif",
								deadFunc: function(dead, notic){
									bgPage.Window.DB.sendRequest("http://"+info.url+"preview/"+info.name+".jpg", {},
										function(previewFile){
											bgPage.Window.DB.sendRequest("http://"+info.url+"full/"+info.name+"."+info.type, {},
												function(fullFile){
													//fullFile.type = "video/";
													//console.log(fullFile)
													bgPage.saveBackgroundFileInSystem({
														file: new File([fullFile], info.name, {type: info.kind+"/"}),
														preview: new File([previewFile], info.name),
														isPixelArt: (info.type == "gif")? true : false,
														isLocal: false,
														urlFile: "http://"+info.url+info.name+"."+info.type
													}, function(){
														notification({text: "Фон успешно добавлен"});
														callback();																
													});
													notic.innerContent("Загрузка завершена");
													setTimeout(function(){
														dead();
													}, 1000);													
												},
												{blob: true, type: "GET"},
												function(val){
													notic.innerContent("Загрузка фона "+(Math.ceil(val*0.8)+20)+"%");
											});
										},
										{blob: true, type: "GET"},
										function(val){
											notic.innerContent("Загрузка фона "+Math.ceil(val*0.2)+"%");
									});
								}
							});							
						}
					}),					
					UI.createButton({
						settings: {class: "false", content: "Закрыть", style: ["margin-right: 15px;"]},
						click: function(){
							noteGWraper.addClass("hide", function(){
								noteGWraper.remove();
							})
						}
					})
				]})		
			]
		});

		globalBody.appendChild(noteGWraper);
		setTimeout(function(){
			noteGWraper.removeClass("hide");
		}, 50);
	}

	function localCatalog(){
		content.clearContent();		
		var catalog = UI.createElem({class: "local_catalog"});
		content.appendChild(catalog); 
		var catalogFiles = UI.createElem({class: "centralize-catalog"});
		catalog.appendChild([
			UI.createElem({
				class: "centralize-catalog",
				content: UI.createElem({
					class: "load-files-panel",
					content:[
						UI.createElem({
							tag: "h1",
							content: "Загрузите фоны с компьютера"
						}),
						UI.createButton({
							settings: {content: "Загрузить"},
							click: function(){localCatalogAddedLocalFile(localCatalog)}
						})
					]
				})
			}),
			catalogFiles
		]);
		bgPage.Window.DB.changeFile("/settings/backgroundsList.json", function(file){
			var url = bgPage.Window.DB.get()+"backgrounds/preview/";
			if((file.video.length == 0)&&
			   (file.image.length == 0)&&
			   (file.color.length == 0)&&
			   (file.live.length == 0)) catalogFiles.appendChild(UI.createElem({
				class: "charter",
				style: ["text-align: center;"],
				content: "У вас еще нет ни одного фона, загрузите их, либо добавьте свои"
			}));
			if(file.video.length != 0) catalogFiles.appendChild(UI.createElem({
				class: "charter",
				content: "Видео"
			}));
			file.video.forEach(function(object, i){
				catalogFiles.appendChild(constructorPreview(object, "video", i));
			});			
			if(file.image.length != 0) catalogFiles.appendChild(UI.createElem({
				class: "charter",
				content: "Изображения"
			}));
			file.image.forEach(function(object, i){
				catalogFiles.appendChild(constructorPreview(object, "image", i));
			});
			if(file.color.length != 0) catalogFiles.appendChild(UI.createElem({
				class: "charter",
				content: "Сплошные цвета"
			}));
			file.color.forEach(function(object, i){
				catalogFiles.appendChild(constructorPreview(object, "color", i));
			});
			if(file.live.length != 0) catalogFiles.appendChild(UI.createElem({
				class: "charter",
				content: "Живые обои"
			}));
			file.live.forEach(function(object, i){
				catalogFiles.appendChild(constructorPreview(object, "live", i));
			});

			function constructorPreview(object, type, number){
				return (function(){
					if(type != "color"){
						let img = new Image();
						img.src = url+object.name;
						img.onload = function(){
							preview.removeClass("hide");
						}
					}
					var preview = UI.createElem({
						class: "preview "+type+"_preview "+((type != "color")? "hide" : ""),
						style: [(type != "color")? "background-image: url('"+url+object.name+"');" : "background-color: "+object.color+";"],
						content: UI.createElem({
							class: "trie",
							style: ["width: 240px; border-radius: 0px 0px 3px 3px;"],
							attr: [{tag: "title", value: "Удалить фон из библиотеки"}],
							content: UI.createButton({
								settings: {
									class: "clear remove_bg",
									content: "Удалить"
								},
								click: function(){
									if(type != "color")
										bgPage.Window.DB.removeFile("/backgrounds/full/"+object.name, function(isSuccess){
											bgPage.Window.DB.removeFile("/backgrounds/preview/"+object.name, function(isSuccess){
												bgPage.Window.DB.changeFile("/settings/backgroundsList.json", function(file, save){
													//console.log(number);
													file[type].splice(number, 1);
													if(object.urlFile) file.download.find(function(elem, i){
														if(elem == object.urlFile){
															file.download.splice(i, 1);
														}
													});
													save(file);											
												}, function(isSuccess){
													if(isSuccess) notification({text: "Фон успешно удален"});
													else notification({text: "Ошибка удаления фона"});
													preview.remove();//localCatalog();
												});
											});
										});										
									else
										bgPage.Window.DB.changeFile("/settings/backgroundsList.json", function(file, save){
											file[type].splice(number, 1);
											if(object.urlFile) file.download.find(function(elem, i){
												if(elem == object.urlFile){
													file.download.splice(i, 1);
												}
											});
											save(file);											
										}, function(isSuccess){
											if(isSuccess) notification({text: "Фон успешно удален"});
											else notification({text: "Ошибка удаления фона"});
											preview.remove();//localCatalog();
										});
								}
							})
						})
					});
					return preview;
				})();
			}
		});						
	}

	globalBody.appendChild(BG_manager);
	Window.dataOfTab.widthPreviewContent = BG_manager.element;
	Window.dataOfTab.updateVarStyles();
	setTimeout(function(){
		BG_manager.removeClass("hide");
	}, 50);
}

function notification(info){
	if(typeof info == "boolean") if(info) info = {}; else return;
	info = (info)? info : {};
	info.text = (info.text)? info.text : "Изменения сохранены";
	var contentNotic = UI.createElem({
		content: info.text,
		style: (info.image)? ["background-image: url("+info.image+")"] : []
	})
	var notic = UI.createElem({
		class: "notification hide",
		content: contentNotic
	});

	if(info.deadFunc) info.deadFunc(function(){
		notic.changeStyle("height");
		notic.addClass("hide", function(){notic.remove();});
	}, contentNotic)

	document.getElementById("tape").appendChild(notic.element);
	setTimeout(function(){
		notic.changeStyle([{
			tag: "height",
			value: (contentNotic.element.clientHeight+20)+"px"
		}]);
		notic.removeClass("hide", function(){
			if(!info.deadFunc){
				notic.changeStyle("height");
				notic.addClass("hide", function(){notic.remove();})
			}
		}, info.timeout? info.timeout : 3000);
	}, 50);	
}

function closeMenu(callback){
	header_menu = null;
	//document.getElementById("interfaceWraper").classList.remove("hide");
	if(now_menu_expand && now_menu_expand.block) if(now_menu_expand.block.addedCloseFunction) now_menu_expand.block.addedCloseFunction();
	body.addClass("hide", function(){
		Window.dataOfTab.menuIsOpen = false;
		Window.dataOfTab.sitePanelIsLooked = false;
		body.clearContent();
		body.addClass("zeroWidth");
		if(callback) callback();
		//document.getElementById("settings_zone").classList.remove("openMenu");
	});	
}

function getPreviewFile(file, callback){
	/*
		Создание превью для фонов
	*/
	var canvas = document.createElement("canvas");
	var ctx = canvas.getContext("2d");

	if(~file.type.indexOf("video")){
		var video = document.createElement("video");
		video.setAttribute("src", URL.createObjectURL(file));
		video.setAttribute("autoplay","");
		video.setAttribute("muted","");

		video.onloadedmetadata = function(){
			video.currentTime = video.duration/2;			
			video.addEventListener('play', function(){
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
		    	ctx.drawImage(video, 0, 0);
				//console.log(canvas.toDataURL("image/png"));
		     	postprocessing(canvas);
		    },false);
		}
		
	}else{
		var img = document.createElement("img");
		img.setAttribute("src", URL.createObjectURL(file));

		img.onload = function(){			
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0);			
			postprocessing(canvas);
		}
	}

	function postprocessing(cnvs){
		var oc   = document.createElement('canvas'),
		octx = oc.getContext('2d');
		if((cnvs.width > 250*4)&&(cnvs.height > 141*4)){
			oc.width  = cnvs.width  * 0.5;
			oc.height = cnvs.width * 0.5;

			octx.drawImage(cnvs, 0, 0, oc.width, oc.height);

			octx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5);

			cnvs.getContext("2d").drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5, 0, 0, cnvs.width,   cnvs.height);
		}

		var canvasResize = document.createElement("canvas");
		var ctxResize = canvasResize.getContext("2d");
		if(cnvs.width/cnvs.height < 1.7730496453900708){
			canvasResize.width = 250;
			canvasResize.height = 250/cnvs.width*cnvs.height;
		}else{
			canvasResize.width = 141/cnvs.height*cnvs.width;
			canvasResize.height = 141;
		}		
		ctxResize.drawImage(cnvs, 0, 0, cnvs.width, cnvs.height, 0, 0, canvasResize.width, canvasResize.height);
		oc.width  = 250;
		oc.height = 141;
		if(cnvs.width/cnvs.height < 1.7730496453900708){
			octx.drawImage(canvasResize, 0, -(canvasResize.height-141)*0.5, canvasResize.width, canvasResize.height);
		}else{
			octx.drawImage(canvasResize, -(canvasResize.width-250)*0.5, 0, canvasResize.width, canvasResize.height);
		}		
		oc.toBlob(function(blob){
			callback(blob);
		}, "image/jpeg", 1);
	}
}

function localCatalogAddedLocalFile(localCatalog, isReturnFile){
	console.log("load")
	var inputSpirit = document.createElement("input");
	inputSpirit.setAttribute("type", "file");
	inputSpirit.setAttribute("multiple", "true");
	inputSpirit.setAttribute("accept", "video/*,image/*");
	inputSpirit.click();													
	inputSpirit.onchange = function(event){	
		//console.log(event.srcElement.files)
		if(event.srcElement.files.length > 50){
			notification({
				image: "../image/ic_error_white_24dp_1x.png",
				text: "Слишком много файлов для одновременной загрузки, можно не больше 50",
				timeout: 10000
			})
			return;
		}		
		localCatalogAddedLocalFileQueue(event.srcElement.files, 0, localCatalog, isReturnFile);		
	}
}
function localCatalogAddedLocalFileQueue(fileList, numb, localCatalog, isReturnFile){
	var fileSave = {
		file: fileList[numb],
		isPixelArt: false,
		isLocal: true
	}
	if (!(~fileSave.file.type.indexOf("image") || ~fileSave.file.type.indexOf("video"))){
		notification({
			image: "../image/ic_error_white_24dp_1x.png",
			text: "Неподерживаемый тип файла, загрузите видео/картинку, либо анимацию",
			timeout: 10000
		});
		return;
	}
	if(fileSave.file.size/1024 > 100000){
		notification({
			image: "../image/ic_error_white_24dp_1x.png",
			text: "Файл слишком большой, максимальный размер файла 100Мб",
			timeout: 10000
		});
		return;
	}
	var spinner = UI.createElem({
		class: "load_spinner"
	});
	var preview = [
			UI.createElem({
				class: "preview_blur"
			}),
			UI.createElem({
				class: "preview load",
				content: UI.createElem({class: "load_spinner"})
			})
		];
	getPreviewFile(fileSave.file, function(image){
		fileSave.preview = image;
		preview[0].changeStyle([{tag: "backgroundImage", value: "url("+URL.createObjectURL(image)+")"}]);
		preview[1].changeStyle([{tag: "backgroundImage", value: "url("+URL.createObjectURL(image)+")"}]);
		preview[1].removeClass("load", function(){
			preview[1].clearContent();
			saveButton.distabled(false);
		})
	});

	var saveButton = UI.createButton({
		settings: {
			style: ["margin-left: 10px"],
			isEnabled: false,
			content: "Добавить"
		},
		click: function(){
			loadActivity.addClass("dark");
			form.addClass("hide", function(){
				loadActivity.appendChild([
					spinner,
					UI.createElem({
						style: ["font-size: 20px;", "text-align: center;", "color: white;"],
						content: "Фон загружается"
					})
				]);			
				form.remove();
			});
			bgPage.saveBackgroundFileInSystem(fileSave, function(numbFile){
				loadActivity.addClass("hide", function(){
					loadActivity.remove();
					notification({text: "Фон успешно добавлен"});
					if(!isReturnFile) localCatalog();
					if(numb < fileList.length-1)
						localCatalogAddedLocalFileQueue(fileList, numb+1, localCatalog, isReturnFile);
					else if(isReturnFile){
						fileSave.number = numbFile-1;
						localCatalog(fileSave);
					}
				});																
			});
		}
	});

	var form = UI.createElem({
		class: "loadFile_local_content",
		content: [
			UI.createElem({
				class: "collum",
				content: preview
			}),
			UI.createElem({
				class: "collum",
				content: [
					UI.createElem({
						style: ["padding-left: 0px;", "padding-top: 0;"],
						tag: "h1",
						content: "Добавление фона"+((fileList.length>1)? (" "+(numb+1)+"/"+fileList.length) : "")
					}),
					UI.createElem({
						style: ["margin: 0px -10px;", "padding: 5px 10px;"],
						content: UI.createElem({
							style: ["padding: 0px 10px;"],
							tag: "h2",
							content:
							   "имя - "+fileSave.file.name+"<br>"+
							   "размер - "+Math.round(Math.round(fileSave.file.size/1024)/10.24)/100+" Mb<br>"+
							   "тип - "+((fileSave.file.type.substring(0, fileSave.file.type.indexOf("/")) != "video")
							   				? "изображение"
							   				: "видео")+"<br>"+
							   "формат - "+fileSave.file.type.substring(fileSave.file.type.indexOf("/")+1)
						})
						
					}),
					UI.createCheckBox({
						settings: {
							style: ["border: none"]
						},
						content: [
							"Это пиксельная графика <span>",
							UI.createElem({
								class: "hover-helper",
								attr: [{tag: "data-helper", value: "Если вы усатновите этот чек бокс, то к фону не будет применено сглаживание"}]
							}),
							"</span>"
						],
						click: function(value){
							fileSave.isPixelArt = value;
						}
					}),
					UI.createElem({
						style: ["bottom: 10px;", "position: absolute;", "right: 10px;"],
						content: [
							UI.createButton({
								settings: {
									class: "false",
									content: "Отмена"
								},
								click: function(){
									loadActivity.addClass("hide", function(){
										loadActivity.remove();
									})
								}
							}),
							saveButton
						]
					})
				]
			})
		]
	});

	var loadActivity = UI.createElem({
		class: "loadFile_local hide",
		content: form
	});
	globalBody.appendChild(loadActivity);
	setTimeout(function(){
		loadActivity.removeClass("hide");
	}, 50);
}
function localCatalogAddedURL(localCatalog){
	var inputURL = UI.createInput({
		settings: {
			style: ["width: 100%;"],
			special: {
				oninput: function(){
					bgPage.Window.DB.sendRequest(inputURL.element.value, {}, function(resultBG){					
						//console.log(/*URL.createObjectURL(*/new File([resultBG], "test.jpg"))//)
					}, {blob: true, type: "GET"}, function(val){/*console.log(val)*/});
				}
			}
	}

	});
	var noteGWraper = UI.createElem({
		class: "manager_window hide",
		content: UI.createElem({
			class: "manager_wraper_content addURlManager",
			content: [				
				UI.createElem({
					class: "ahead",
					content: [
						UI.createElem({
							tag: "h1",
							content: "Добавление фона по URL"
						}),						
						UI.createButton({
							click: function(){
								noteGWraper.addClass("hide", function(){
									noteGWraper.remove();									
								}, 250);								
							},
							settings: {
								class: "clear close_manager",
								attr: [{tag: "title", value: "Закрыть"}]
							}
						})
					]
				}),
				UI.createElem({ class: "content", content: [
					UI.createElem({
						tag: "h2",
						content: "Добавьте фон по URL. URL должен быть прямо ведущий к фону"
					}),
					inputURL,
					UI.createElem()
				]})				
			]
		})		
	});

	globalBody.appendChild(noteGWraper);
	setTimeout(function(){
		inputURL.element.focus();
		noteGWraper.removeClass("hide");
	}, 50);
}
function localCatalogAddedIFRAME(localCatalog){
	
}
function moveWatch(callback, oldPosition){
	var saveChange_wraper = UI.createElem({class: "save_change_move_watch hide"});
	[{
		key: "x", info: "отцентровать по горизонтали"
	},{
		key: "y", info: "отцентровать по вертикали"
	}].forEach(createInfo);
	function createInfo(object){
		saveChange_wraper.appendChild(UI.createElem({
			tag: "div",
			style: ["margin-bottom: 10px;"],
			content: [
				UI.createElem({
					tag: "h2",
					class: "caption1 info buttHelp",
					style: [
						"margin: 0;",
						"margin-right: 10px;",
						"color: white;",
						"display: inline-block;",
						"background-color: rgba(255, 255, 255, 0.25);",
						"padding: 5px 10px;",
						"border-radius: 3px;",
						"font-size: 16px;"
					],
					content: object.key
				}),
				UI.createElem({
					tag: "h2",
					class: "caption1 info",
					style: ["color: white;", "display: inline-block;", "margin: 0;"],
					content: object.info
				})
			]
		}));
	}
	saveChange_wraper.appendChild(UI.createElem({
		style: ["margin-top: 20px;"],
		content: [
			UI.createButton({
				settings: {
					content: "Отмена",
					class: "false light",
					style: ["margin-right: 20px;"]
				},
				click: function(){
					document.getElementById("clock-block").onmousedown = window.onmousemove = window.onmousedown = window.onmouseup = undefined;
					removeEventListener('keydown', keyListenerDown);
					removeEventListener('keyup', keyListenerUp);
					document.getElementById("clock-block").classList.remove("moveWatch");
					document.getElementById("bodyWraper").classList.remove("interfaceOff");
					callback(null);
					saveChange_wraper.addClass("hide", function(){
						document.getElementById("settings_zone").classList.remove("hide");
						saveChange_wraper.remove();
					});
				}
			}),
			UI.createButton({
				settings: {
					content: "Сохранить изменения"
				},
				click: function(){
					document.getElementById("clock-block").onmousedown = window.onmousemove = window.onmousedown = window.onmouseup = undefined;				
					removeEventListener('keydown', keyListenerDown);
					removeEventListener('keyup', keyListenerUp);	
					callback(position);
					document.getElementById("clock-block").classList.remove("moveWatch");
					document.getElementById("bodyWraper").classList.remove("interfaceOff");
					saveChange_wraper.addClass("hide", function(){
						document.getElementById("settings_zone").classList.remove("hide");
						saveChange_wraper.remove();
					});					
				}
			})
		]
	}));
	globalBody.appendChild(saveChange_wraper, function(){
		saveChange_wraper.removeClass("hide");
	}, 50);

	document.getElementById("clock-block").onmousedown = function(event){
		grabClock(document.getElementById("clock-block"), event);
	}

	var wraperSettings;
	var isGrab = false;
	var freeze = {x: false, y:false};
	var lastEvent;
	var position = oldPosition;

	function grabClock(node, startEvent){
		isGrab = true;
		let width = node.offsetWidth;
		let height = node.offsetHeight;
		var Y,X;
		freeze = {x: false, y:false}	
		let widthScreen = document.documentElement.clientWidth;
		let heightScreen = document.documentElement.clientHeight;
		//lastEvent = null;	
		let startPos = {
			x: startEvent.clientX,
			y: startEvent.clientY,
			offsetX: startEvent.clientX - node.getBoundingClientRect().left,
			offsetY: startEvent.clientY - node.getBoundingClientRect().top
		};
		node.classList.add("grabClock");
		node.style.right = null;
		node.style.left = null;
		node.style.top = null;
		node.style.bottom = null;
		node.style.position = "absolute";

		window.onmousemove = window.onmousedown =  function(event){
			if(!isGrab) return;		
			if(event) lastEvent = event;
			if(event){
				X = event.clientX-startPos.offsetX;
				Y = event.clientY-startPos.offsetY;
				X = (X < 0)? 0 : (X+width > widthScreen)? widthScreen-width : X;
				Y = (Y < 0)? 0 : (Y+height > heightScreen)? heightScreen-height : Y;
			}
			if(freeze.y){
				X = widthScreen/2-width/2;
				position.center.x = true;
			}else{
				position.center.x = false;
			}
			if(freeze.x){
				Y = heightScreen/2-height/2;
				position.center.y = true;
			}else{
				position.center.y = false;
			}
			node.style.top = Y+"px";
			node.style.left = X+"px";
			if(X+width > widthScreen-600) saveChange_wraper.addClass("left"); else saveChange_wraper.removeClass("left");
		}
		window.onmouseup = function(event){
			isGrab = false;
			node.classList.remove("grabClock");
			let isTop = (Y+height/2 < heightScreen/2);
			let isLeft = (X+width/2 < widthScreen/2);
			position.top = (isTop)? Y/heightScreen*100 : null;
			position.left = (isLeft)? X/widthScreen*100 : null;
			position.bottom = (isTop)? null : (heightScreen-Y-height)/heightScreen*100;
			position.right = (isLeft)? null : (widthScreen-X-width)/widthScreen*100;
			CLOCK.setPosition(position);		
		}
	}

	var keyListenerDown = function(event) {
		if(isGrab){
			if(event.keyCode == 88) document.body.classList.add("xCenter");
			if(event.keyCode == 89) document.body.classList.add("yCenter");
		}

		//if(!isGrab) return;
		//x
		if(event.keyCode == 88) freeze.x = true;
		//y
		if(event.keyCode == 89) freeze.y = true;
		window.onmousedown()
	};
	var keyListenerUp = function(event){

		if(event.keyCode == 88) document.body.classList.remove("xCenter");
		if(event.keyCode == 89) document.body.classList.remove("yCenter");

		//if(!isGrab) return;
		//x
		if(event.keyCode == 88) freeze.x = false;
		//y
		if(event.keyCode == 89) freeze.y = false;

		if(isGrab) window.onmousedown(lastEvent);
	};
	addEventListener('keydown', keyListenerDown);
	addEventListener('keyup', keyListenerUp);
}
function drawFavPanel(){
	let panel = UI.createElem(document.getElementById("site_panel"));
	panel.clearContent();
	bgPage.Window.DB.changeFile("/settings/sitesList.json", function(file){
		if(file.favorites.length == 0) return;
		file.favorites.forEach(function(obj){
			panel.appendChild(getMark(obj));
		});
	});


	function getMark(obj){
		//var mouseEnterIsPressed = false;
		return UI.createElem({
			tag: "a",
			class: "mark",
			style: (obj.image)? ["background-image: url('"+Window.dataOfTab.namespace+obj.image+"');"] : null,
			content: (obj.image)? "" : obj.name.substring(0, 1),
			attr: [
				{tag: "title", value: obj.name},
				{tag: "href", value: obj.url}
			]
		})
	}
}

function drawSitePanel(fastOpen){
	let site_wrap = UI.createElem({toDOE: document.getElementById("marks_search_wraper")});
	site_wrap.element.className = "all_sites "+((fastOpen)? "fast-open-site-panel" : "hide");
	Window.dataOfTab.sitePanel = site_wrap;
	Window.dataOfTab.sitePanel.update = drawAllSites;
	document.getElementById("add_site_button").style.display = "";
	setTimeout(function(){
		document.getElementById("add_site_button").classList.remove("hide");
	}, 150);
	drawAllSites();
	var favGroup;
	var favoritesWraper;
	function drawAllSites(endDrawCallback){	
		bgPage.Window.DB.changeFile("/settings/sitesList.json", function(file){
			site_wrap.clearContent();		
			favGroup = UI.createElem({
				style: ["padding-top: 20px;", "width: 648px;", "margin: auto;", "font-size: 0;", "margin-bottom: 20px;"]
			});
			site_wrap.appendChild(favGroup);
			favGroup.appendChild([
				UI.createElem({class: "site_group", content: "Избранное"}),
				UI.createElem({class: "site_group_desc", content: "Добавляйте в эту группу сайты, к которым вы хотите получать быстрый доступ."})
			]);
			favoritesWraper = UI.createElem({
				attr: [{tag: "id", value: "favorites_wraper"}]
			});
			favGroup.appendChild(favoritesWraper);
			for(let i=0; i<9; i++){
				if(file.favorites[i]){
					let obj = file.favorites[i];
					obj.numbMark = i;
					obj.numbGroup = null;
					obj.isMove = false;
					obj.mouseEvent = null;
					obj.isSmall = true;
					let mark = UI.createElem({
						/*tag: "a",
						class: "mark",
						style: (file.favorites[i].image)? ["background-image: url('"+Window.dataOfTab.namespace+file.favorites[i].image+"');"] : null,
						content: (file.favorites[i].image)? "" : file.favorites[i].name.substring(0, 1),
						attr: [
							{tag: "title", value: file.favorites[i].name},
							{tag: "href", value: file.favorites[i].url}
						],*/
						class: "mark",
						style: (file.favorites[i].image)? ["background-image: url('"+Window.dataOfTab.namespace+file.favorites[i].image+"');"] : null,
						content: [
							UI.createElem({
								tag: "a",
								content: (file.favorites[i].image)? "" : file.favorites[i].name.substring(0, 1),
								style: ["font-size: 24px;",
									    "text-align: center;",
									    "line-height: 48px;",
									    "font-weight: 900;",
									    "text-decoration: unset;",
									    "color: #4a4a4a;",
									    "width: 48px;",
									    "height: 48px;",
									    "position: absolute;",
										"top: 0;",
									    "left: 0;",
									    "border-radius: 50%;"
								],
								attr: [
									{tag: "title", value: file.favorites[i].name},
									{tag: "href", value: file.favorites[i].url}
								]
							}),
							UI.createElem({
								class: "mark-control-panel",
								content: [
									UI.createButton({
										settings: {
											class: "clear edit_mark",
											attr: [{tag: "title", value: "Отредактировать закладку"}]
										},
										click: function(){
											editMarkActivity(obj, function(){
												drawAllSites();
												drawFavPanel();
											});
										}
									}),
									UI.createButton({
										settings: {
											class: "clear remove_mark",
											attr: [{tag: "title", value: "Удалить заметку"}]
										},
										click: function(){
											if(confirm("Вы уверены? Удалить закладку?")){
												bgPage.Window.DB.changeFile("/settings/sitesList.json", function(file, save){
													//console.log(file.all[i].sites[i]);
													console.log(i);
													console.log(file)
													file.favorites.splice(i, 1);
													save(file);
												},
												function(){
													drawAllSites();
													drawFavPanel()
												});
											}
										}
									})	
								]
							})
						],
						special: {
							onmouseup: function(event){
								obj.isMove = false;
								obj.mouseEvent = null;
							},

							onmousedown: function(event){
								obj.mouseEvent = event;
								window.onmousemove = function(eventMove){
									if((obj.isMove)||(!obj.mouseEvent)) return;
									let y = Math.pow(obj.mouseEvent.clientY-eventMove.clientY, 2);
									let x = Math.pow(obj.mouseEvent.clientX-eventMove.clientX, 2);
									if(Math.sqrt(x+y)>12){
										if(!Window.dataOfTab.markGrabIsActive) return;
										obj.isMove = true;
										window.onmousemove = null;										
										GrabAndPush(obj, mark, eventMove, function(endDraw){
											drawAllSites(endDraw);
											drawFavPanel();
										}, {
											favoritesWraper: favoritesWraper,
											favGroup: favGroup
										});
									}
									return false;
								};
								return false;
							}
						}
					});
					favoritesWraper.appendChild(mark);
				}else
					favoritesWraper.appendChild([
						UI.createElem({
							class: "mark add_site ghost_small_mark"
						})
					]);
			}
			if(file.all.length == 0){
				site_wrap.appendChild(UI.createElem({
					class: "site_group_wraper",
					content: UI.createElem({
						class: "empty_mark_group",
						content: "Вы пока еще не добавили ни одну закладку"
					})
				}));
			}	
			file.all.forEach(function(obj, i){
				let wraper = UI.createElem({class: "mark_wraper"});				
				var headerGroup = UI.createElem({
					style: ["width: 648px;", "margin: auto;", "font-size: 0;"],
					content: [
						UI.createElem({content: [						
							UI.createButton({
								settings: {
									class: "clear remove_site_group",
									attr: [{tag: "title", value: "Удалить группу"}]
								},
								click: function(){
									if(confirm("Вы уверены? Все закладки в этой группе пропадут")){
										bgPage.Window.DB.changeFile("/settings/sitesList.json", function(file, save){
											file.all.splice(i, 1);
											save(file);
										},
										function(){
											drawAllSites();
										});
									}
								}
							}),							
							UI.createButton({
								settings: {
									class: "clear edit_site_group",
									attr: [{tag: "title", value: "Отредактировать группу"}]
								},
								click: function(){
									var inputName = UI.createInput({
										settings: {content: obj.name_group}
									});
									var inputDisc = UI.createTextarea({
										settings: {content: obj.description_group}
									});
									Window.dataOfTab.sitePanelIsLooked = true;
									popup({
										name: "Редактирование группы",
										isWide: true,
										rightCol: (function(){											
											var col = [
												UI.createElem({tag: "h2", content: "Название"}),
												inputName,
												UI.createElem({tag: "h2", content: "Описание"}),
												inputDisc
											];
											return col;
										})(),
										buttons: {
											cancel: {click: function(){
												Window.dataOfTab.sitePanelIsLooked = false;
											}},
											ok: {
												text: "Сохранить",
												click: function(){
													console.log(inputName.element.value)
													bgPage.Window.DB.changeFile("/settings/sitesList.json", function(file, save){
														file.all[i].name_group = inputName.element.value;
														file.all[i].description_group = inputDisc.element.value;
														save(file);
													},
													function(){
														Window.dataOfTab.sitePanelIsLooked = false;
														drawAllSites();
													});
												}
											}
										}
									})
								}
							}),
							UI.createButton({
								settings: {
									class: "clear move_up_site_group",
									attr: [{tag: "title", value: "Передвинуть группу выше"}],
									style: [(i == 0)? "display: none;" : ""]
								},
								click: function(){
									bgPage.Window.DB.changeFile("/settings/sitesList.json", function(file, save){
										var t = file.all[i-1];
										file.all[i-1] = file.all[i];
										file.all[i] = t;
										save(file);
									},
									function(){
										drawAllSites();
									});
								}
							}),
							UI.createButton({
								settings: {
									class: "clear move_down_site_group",
									attr: [{tag: "title", value: "Передвинуть группу ниже"}],
									style: [(i == file.all.length-1)? "display: none;" : ""]
								},
								click: function(){
									bgPage.Window.DB.changeFile("/settings/sitesList.json", function(file, save){
										var t = file.all[i+1];
										file.all[i+1] = file.all[i];
										file.all[i] = t;
										save(file);
									},
									function(){
										drawAllSites();
									});
								}
							}),
							UI.createElem({class: "site_group", content: obj.name_group})
						]}),
						UI.createElem({class: "site_group_desc", content: obj.description_group})
					]
				});
				site_wrap.appendChild(headerGroup);
				site_wrap.appendChild(UI.createElem({
					class: "site_group_wraper",
					content: [headerGroup, wraper]
				}));
				obj.sites.forEach(function(mark, numbMark){
					wraper.appendChild(getMark(mark, numbMark, i));
				});
			});
			if(endDrawCallback) endDrawCallback();
		});
	}
	

	setTimeout(function(){
		if(!fastOpen) site_wrap.removeClass("hide");
		else site_wrap.addClass("fast-open-site-panel-open", function(){
			site_wrap.removeClass(["fast-open-site-panel-open", "fast-open-site-panel"]);
		});
	}, 100);

	function getMark(obj, numbMark, numbGroup){
		obj.numbMark = numbMark;
		obj.numbGroup = numbGroup;
		obj.isMove = false;
		obj.mouseEvent = null;
		obj.isSmall = false;
		if(obj.name.length > 25) obj.сutName = obj.name.substring(0, 25)+"...";
		else obj.сutName = obj.name;
		var icon = null;
		if(obj.image != null){
			var img = new Image();
			img.src = Window.dataOfTab.namespace+obj.image;
			img.onload = function(){
				icon.changeStyle("opacity");
			}
			icon = UI.createElem({
				class: "icon",
				style: ["background-image: url('"+Window.dataOfTab.namespace+obj.image+"');", "opacity = '0';"]
			});
		}
		var mark = UI.createElem({
			style: (obj.substring != null)? ["background-color: "+obj.substring+";"] : [],
			class: "mark_full "+((obj.substring != null)? "light" : ""),
			content: [
				icon,
				UI.createElem({tag: "h1", content: obj.сutName}),
				UI.createElem({
					class: "mark_click_zone",
					tag: "a",
					attr: [
						{tag: "title", value: obj.name},
						{tag:"href", value: obj.url}
					],
					special: {
						onmouseup: function(event){
							obj.isMove = false;
							obj.mouseEvent = null;
						},

						onmousedown: function(event){
							obj.mouseEvent = event;
							window.onmousemove = function(eventMove){
								if((obj.isMove)||(!obj.mouseEvent)) return;
								let y = Math.pow(obj.mouseEvent.clientY-eventMove.clientY, 2);
								let x = Math.pow(obj.mouseEvent.clientX-eventMove.clientX, 2);
								if(Math.sqrt(x+y)>12){
									if(!Window.dataOfTab.markGrabIsActive) return;
									obj.isMove = true;
									window.onmousemove = null;					
									GrabAndPush(obj, mark, eventMove, function(endDraw){
										drawAllSites(endDraw);
										drawFavPanel();
									}, {
										favoritesWraper: favoritesWraper,
										favGroup: favGroup
									});
								}
								return false;
							};
							return false;
						}

					}
				}),
				UI.createButton({
					settings: {
						class: "clear add_fav_mark",
						attr: [{tag: "title", value: "Дублировать закладку в избранное"}]
					},
					click: function(){
						bgPage.Window.DB.changeFile("/settings/sitesList.json", function(file, save){
							//console.log(newData)
							//console.log(markData)
							if(file.favorites.length >= 9){
								notification({
									image: "../image/ic_error_white_24dp_1x.png",
									text: "Эта группа переполннена, невозможно добавть в нее закладку"
								});
							}else{
								console.log(obj)
								file.favorites.push(file.all[obj.numbGroup].sites[obj.numbMark]);
								save(file);
							}
						}, function(){
							drawAllSites();
							drawFavPanel();
						});	
					}
				}),
				UI.createButton({
					settings: {
						class: "clear edit_mark",
						attr: [{tag: "title", value: "Отредактировать закладку"}]
					},
					click: function(){
						editMarkActivity(obj, function(){
							drawAllSites();
						});
						
					}
				}),
				UI.createButton({
					settings: {
						class: "clear remove_mark",
						attr: [{tag: "title", value: "Удалить заметку"}]
					},
					click: function(){
						if(confirm("Вы уверены? Удалить закладку?")){
							bgPage.Window.DB.changeFile("/settings/sitesList.json", function(file, save){
								//console.log(file.all[i].sites[i]);
								file.all[numbGroup].sites.splice(numbMark, 1);
								save(file);
							},
							function(){
								drawAllSites();
							});
						}
					}
				})				
			]
		})
		return mark;
	};
}

function AddSite(list, callback){	
	//console.log(callback)
	//console.log("NEW SITE ADD")
	Window.dataOfTab.sitePanelIsLooked = true;
	//console.log(Window.dataOfTab.sitePanelIsLooked)
	//console.log(Window.dataOfTab)
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
					content: "Начните вводить адрес сайта"
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
				loadActivity.addClass("hide", function(){
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
							substring: (saveData.colorfull_sub.value)? 
											((saveData.preview.images[saveData.preview.select].baseColor != null)? 
													saveData.preview.images[saveData.preview.select].baseColor 
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
					Window.dataOfTab.sitePanelIsLooked = false;
					loadActivity.remove();
				});
			}
		}),
		list: UI.createElem({
			class: "list_result hide",
			special: {
				onmousedown: function(){
					saveData.list.isActive = true;
				},
				onmouseup: function(){
					saveData.list.isActive = false;					
					saveData.list.addClass("hide");
				}
			}	
		}),
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
		url: UI.createInput({
			settings: {
				special: {
					oninput: function(){
						parser.checkURL(saveData.url.element.value);
					},
					onfocus: function(){
						if(saveData.url.element.value.trim() == "") return;
						saveData.list.removeClass("hide");
					},
					onblur: function(){
						if(!saveData.list.isActive) saveData.list.addClass("hide");
					}
				}			
			}
		}),
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
			content: "Фон основным цветом"
		})
	};
	parser.setProp(saveData);
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
					UI.createElem({tag: "h2", content: "Адрес"}),
					UI.createElem({style: ["position: relative;"], content: [
						saveData.url,
						saveData.list
					]}),
					UI.createElem({tag: "h2", content: "Название"}),
					saveData.name,
					UI.createInfoWrap({
						text: "Добавить в группу",
						elem: UI.createSelection({
							options: list,
							value: saveData.group,
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
						content: [
							UI.createButton({
								settings: {
									class: "false",
									content: "Отмена"
								},
								click: function(){
									loadActivity.addClass("hide", function(){
										Window.dataOfTab.sitePanelIsLooked = false;
										loadActivity.remove();
									})
								}
							}),
							saveData.saveButton
						]
					})
				]
			})
		]
	});

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

	var loadActivity = UI.createElem({
		class: "site_panel_add hide",
		content: form
	});
	globalBody.appendChild(loadActivity);
	setTimeout(function(){
		saveData.url.element.focus();
		loadActivity.removeClass("hide");
	}, 50);
}

function getTextPopup(quest, callback, errCallback){
	var res = prompt(quest);
	if(res != null) callback(res);
	else errCallback();
}

function popup(settings, callback){
	var buttons = {};
	settings = (settings)? settings : {};
	settings.buttons = (settings.buttons)? settings.buttons : {};
	settings.buttons.ok = (settings.buttons.ok)? settings.buttons.ok : {};
	settings.buttons.cancel = (settings.buttons.cancel)? settings.buttons.cancel : {};

	buttons.ok = UI.createButton({
		settings: {
			style: ["margin-left: 10px"],
			isEnabled: (settings.buttons.ok.isEnabled != undefined)?
						settings.buttons.ok.isEnabled : true,
			content: (settings.buttons.ok.text)? settings.buttons.ok.text : "Ок"
		},
		click: function(){
			loadActivity.addClass("hide", function(){
				if(settings.buttons.ok.click) settings.buttons.ok.click();
				loadActivity.remove();
			});
		}
	});

	var form = UI.createElem({
		class: "popup_content "+((settings.isWide)? "wide": ""),
		content: [
			UI.createElem({
				class: "collum",
				content: (settings.leftCol)? settings.leftCol : []
			}),
			UI.createElem({
				class: "collum",
				content: (function(){
					var content = []
					if(settings.name) content.push(UI.createElem({
						style: ["padding-left: 0px;", "padding-top: 0;"],
						tag: "h1",
						content: settings.name
					}));
					if(settings.rightCol) content = content.concat(settings.rightCol);
					content.push(UI.createElem({
						class: "popup_buttons_block",
						content: (function(){
							var btns = [
								UI.createButton({
									settings: {
										class: "false",
										content: "Отмена"
									},
									click: function(){
										loadActivity.addClass("hide", function(){
											if(settings.buttons.cancel.click) settings.buttons.cancel.click();
											loadActivity.remove();
										})
									}
								})
							];
							if(settings.buttons.other){							
								settings.buttons.other.forEach(function(but){
									if(!but.text) return;
									if(but.tag){
										buttons[but.tag] = UI.createButton({
											settings: {
												style: ["margin-left: 10px"],
												isEnabled: (but.isEnabled != undefined)? but.isEnabled : true,
												content: but.text,
												class: but.class
											},
											click: function(){
												loadActivity.addClass("hide", function(){
													if(but.click) but.click();
													loadActivity.remove();
												});
											}
										});
										btns.push(buttons[but.tag]);
									}else{
										btns.push(UI.createButton({
											settings: {
												style: ["margin-left: 10px"],
												isEnabled: (but.isEnabled != undefined)? but.isEnabled : true,
												content: but.text,
												class: but.class
											},
											click: function(){
												loadActivity.addClass("hide", function(){
													if(but.click) but.click();
													loadActivity.remove();
												});
											}
										}));
									}
								});
							}
							btns.push(buttons.ok);
							return btns;
						})()
					}));
					return content;
				})()				
			})
		]
	});

	var loadActivity = UI.createElem({
		class: "popup hide",
		content: form
	});
	globalBody.appendChild(loadActivity);
	setTimeout(function(){
		loadActivity.removeClass("hide");
	}, 50);
	if(callback) callback(buttons);
}
function GrabAndPush(markData, grabMark, clickEvent, callback, favPanel){
	let h = favPanel.favoritesWraper.element.getBoundingClientRect().top;
	favPanel.favoritesWraper.changeStyle([{
		tag: "top",
		value: h+"px"
	}]);
	favPanel.favGroup.addClass("float-fav-panel", function(){
		favPanel.favoritesWraper.changeStyle([{
			tag: "top",
			value: h + document.getElementById("marks_search_wraper").scrollTop+"px"
		}], updateGroupsRects);
	});			
	Window.dataOfTab.body.classList.add("all-marks-hover-disabled");
	Window.dataOfTab.sitePanelIsLooked = true;
	var sPstn = {
		top: grabMark.element.getBoundingClientRect().top,
		left: grabMark.element.getBoundingClientRect().left
	}
	sPstn.offsetTop = sPstn.top - clickEvent.clientY;
	sPstn.offsetLeft = sPstn.left - clickEvent.clientX;
	let ghost = {
		rippleRadius: (function(){
			var maxR = 237;
			var rect = grabMark.element.getBoundingClientRect();
			rect.bottom = rect.top - rect.height + 17 + 5;
			rect.top -= 12;
			rect.right = rect.left + rect.width + 17;
			rect.left -= 17;
			xY = Math.sqrt(Math.pow(rect.left - clickEvent.clientX, 2) + Math.pow(rect.top - clickEvent.clientY, 2));
			XY = Math.sqrt(Math.pow(rect.right - clickEvent.clientX, 2) + Math.pow(rect.top - clickEvent.clientY, 2));
			Xy = Math.sqrt(Math.pow(rect.right - clickEvent.clientX, 2) + Math.pow(rect.bottom - clickEvent.clientY, 2));
			xy = Math.sqrt(Math.pow(rect.left - clickEvent.clientX, 2) + Math.pow(rect.bottom - clickEvent.clientY, 2));
			return Math.max(xY, XY, Xy, xy);
		})(),
		iconBG: ((markData.image)?
			UI.createElem({
				class: "icon",
				style: [
					"background-image: url('"+Window.dataOfTab.namespace+markData.image+"');",
					"opacity: 0;"
				]
			}) : null),
		iconReal: UI.createElem({
			class: "mark",
			style: [
				(markData.image)? "background-image: url('"+Window.dataOfTab.namespace+markData.image+"');" : null,
				"margin-top: "+(((markData.isSmall)? 24 : 32)+sPstn.offsetTop)+"px;",
				"margin-left: "+(((markData.isSmall)? 24 : 110)+sPstn.offsetLeft)+"px;",
				(!markData.image)? "opacity: 0;" : null
			],
			content: (markData.image)? "" : markData.name.substring(0, 1)
		})
	};
	ghost.substrate = UI.createElem({
		class: " "+((markData.isSmall)? "mark" : "mark_full")+ ((markData.substring != null)? " light" : ""),
		style: [
			"top: "+sPstn.top+"px;",
			"left: "+sPstn.left+"px;",
			(markData.substring != null)? ["background-color: "+markData.substring+";"] : []
		],
		content: [
			ghost.iconBG,
			UI.createElem({tag: "h1", content: (markData.сutName)? markData.сutName : markData.name})			
		]
	});
	ghost.rippleMask = UI.createElem({
		class: "ripple-mask-mark",
		style:[
			"top: "+(clickEvent.clientY-ghost.rippleRadius)+"px;",
			"left: "+(clickEvent.clientX-ghost.rippleRadius)+"px;",
			"height: "+ghost.rippleRadius*2+"px;",
			"width: "+ghost.rippleRadius*2+"px;",
			"margin: 0"
		],
		content: ghost.substrate
	});
	ghost.main = UI.createElem({
		class: "ghost-mark "+((markData.isSmall)? "minimalize-mark" : ""),
		style: [
			"top: "+(clickEvent.clientY-24)+"px;",
			"left: "+(clickEvent.clientX-24)+"px;",
		],
		content: [
			ghost.rippleMask,
			ghost.iconReal
		]
	});

	UI.createElem({toDOE: document.getElementById("marks_search_wraper")}).appendChild(ghost.main, minimalizeMark, 100);
	grabMark.clearContent();
	grabMark.addClass((markData.isSmall)? "ghost_small_mark" : "ghost_mark");
	grabMark.changeStyle([
		{tag: "top", value: "0px"},
		{tag: "left", value: "0px"},
		{tag: "opacity", value: "0"}
	]);

	let groupList = Array.prototype.slice.call(document.getElementById("marks_search_wraper").querySelectorAll(".mark_wraper, #favorites_wraper"));
	if(groupList[0].querySelectorAll(".mark:not(.ghost_small_mark), .mark_full:not(.ghost_mark)").length >= 9){
		groupList[0].appendChild(UI.createElem({
			class: "favorites_is_full",
			content: "В избранном больше нет места"
		}).element);
		groupList[0] = null;
	}
	let groupsRects = [];
	let marksArr = [];
	let marksRects = [];
	let groupHover = null;
	let newData = null;
	let blockMove = false;
	let blockMoveTimer;
	let globalOffset = document.getElementById("marks_search_wraper").scrollTop;
	let helperMark = UI.createElem({
		class: "mark_full ghost_mark",
		style: ["opacity: 0;"]
	});
	let hoverPlaceMark = UI.createElem({
		class: "mark_full hover-palce-mark"
	});
	let lastMoveEvent;
	updateGroupsRects();
	markData.numbGroup = (markData.numbGroup == null)? 0 : markData.numbGroup+1;
	addEventListener("mousemove", onmousemove);
	addEventListener("mouseup", onmouseup);
	addEventListener("wheel", onwheel);
	function onmousemove(event){
		lastMoveEvent = event;
		ghost.main.changeStyle([
			{tag: "top", value: (event.clientY-24)+"px"},
			{tag: "left", value: (event.clientX-24)+"px"}
		]);
		ghost.rippleMask.changeStyle([
			{tag: "top", value: (event.clientY-ghost.rippleRadius)+"px"},
			{tag: "left", value: (event.clientX-ghost.rippleRadius)+"px"}
		]);

		if(!blockMove){
			let h = groupUnderMouse({x: event.clientX, y: event.clientY});
			if((h != null)&&(h != groupHover)){
				updateMarksRects(h, groupHover);
				groupHover = h;
				onmousemove(event);
			}else{
				let mark = markUnderMouse({
					x: event.clientX - ((groupHover == 0)? groupsRects[groupHover].left : 0),
					y: event.clientY + ((groupHover == 0)? - groupsRects[groupHover].top : globalOffset)
				});
				//console.log(event.clientX - groupsRects[groupHover].left +" | "+ marksArr[0].rect.left)
				if(mark != null) offsetMarks(mark)
			}
	}		
		//updateGroupsRects();
	}
	function onmouseup(event){
		lastMoveEvent = null;
		removeEventListener("mousemove", onmousemove);
		removeEventListener("mouseup", onmouseup);
		removeEventListener("wheel", onwheel);
		/*if(marksArr.length == 0 && groupHover == 0){
			newData.group = groupHover = markData.numbGroup;
		}*/
		if(groupHover == 0){
			newData.top = marksRects[(marksArr.length == 0)? 0 : (marksArr.length-1)].top+groupsRects[0].top;
			newData.left = groupsRects[0].left + ((newData.position <= marksArr.length)?
														marksRects[newData.position].left :
														((marksArr.length == 0)? marksRects[0].left : marksRects[marksArr.length-1].left+72));
		}
		ghost.rippleRadius = (function(){
			var maxR = 237;
			var rect = hoverPlaceMark.element.getBoundingClientRect();
			rect.bottom = rect.top - rect.height + 17 + 5;
			rect.top -= 12;
			rect.right = rect.left + rect.width + 17;
			rect.left -= 17;
			xY = Math.sqrt(Math.pow(rect.left - event.clientX, 2) + Math.pow(rect.top - event.clientY, 2));
			XY = Math.sqrt(Math.pow(rect.right - event.clientX, 2) + Math.pow(rect.top - event.clientY, 2));
			Xy = Math.sqrt(Math.pow(rect.right - event.clientX, 2) + Math.pow(rect.bottom - event.clientY, 2));
			xy = Math.sqrt(Math.pow(rect.left - event.clientX, 2) + Math.pow(rect.bottom - event.clientY, 2));
			return Math.max(xY, XY, Xy, xy);
		})();
		sPstn.top +=5;
		//sPstn.offsetTop = event.clientY - sPstn.top;
		//sPstn.offsetLeft = event.clientX - sPstn.left;
		sPstn.offsetTop = event.clientY - newData.top;
		sPstn.offsetLeft = event.clientX - newData.left;
		//if(markReturnCallback) markReturnCallback();
		ghost.main.addClass("clear-transition", maximalizeMark, 50);
	}
	function onwheel(event){
		blockMove = true;
		if(blockMoveTimer) clearTimeout(blockMoveTimer);
		blockMoveTimer = setTimeout(function(){
			blockMove = false;			
			globalOffset = document.getElementById("marks_search_wraper").scrollTop;
			updateGroupsRects();
			if(lastMoveEvent) onmousemove(lastMoveEvent);
		}, 300);
	}
	
	function markUnderMouse(mousePos){		
		for(var i = 0; i<marksRects.length; i++){
			if((marksRects[i].top-10 < mousePos.y)&&(marksRects[i].top+marksRects[i].height+10 > mousePos.y)
				&&(marksRects[i].left-10 < mousePos.x)&&(marksRects[i].left+marksRects[i].width+10 > mousePos.x)){					
					return i;
			}
		}
		return null;
	}
	function groupUnderMouse(mousePos){		
		for(var i = 0; i<groupsRects.length; i++){
			if(!groupsRects[i]) continue;
			if((groupsRects[i].top-10 < mousePos.y)&&(groupsRects[i].bottom+10 > mousePos.y)
				&&(groupsRects[i].left-10 < mousePos.x)&&(groupsRects[i].right+10 > mousePos.x)){					
					return i;
			}
		}
		return null;
	}
	function offsetMarks(startMark, sideOffset){
		for(var i = 0; i<(startMark > marksArr.length? marksArr.length : startMark); i++){
			marksArr[i].style.top = marksRects[i].top+"px";
			marksArr[i].style.left = marksRects[i].left+"px";
		}
		newData = {
			top: marksRects[startMark].top - globalOffset,
			left: marksRects[startMark].left,
			group: groupHover,
			position: startMark
		}
		hoverPlaceMark.element.style.opacity = "1";
		hoverPlaceMark.element.style.top = marksRects[startMark].top+"px";
		hoverPlaceMark.element.style.left = marksRects[startMark].left+"px";
		for(var i = startMark; i<marksArr.length; i++){
			marksArr[i].style.top = marksRects[i+1].top+"px";
			marksArr[i].style.left = marksRects[i+1].left+"px";
		}
			
	}
	function updateMarksRects(group, lastGroup){
		hoverPlaceMark.element.style.opacity = "0";
		hoverPlaceMark.remove();
		if(group != markData.numbGroup && group != 0){
			groupList[group].appendChild(helperMark.element);
			helperMark.element.style.top = "";
			helperMark.element.style.left = "";
		}else{
			helperMark.remove();
			grabMark.element.style.top = "";
			grabMark.element.style.left = "";		
		}
		newData = {
			top: /*helperMark.element.getBoundingClientRect()*/sPstn.top+5 /*- globalOffset*/,
			left: /*helperMark.element.getBoundingClientRect()*/sPstn.left,
			group: markData.numbGroup,
			position: markData.numbMark
		};
		groupList[group].style.height = groupList[group].getBoundingClientRect().height+"px";
		for(var i = 0; i<marksRects.length; i++){
			marksRects[i].elem.style.top = "";
			marksRects[i].elem.style.left = "";
		}			
		if(lastGroup != null){
			groupList[lastGroup].style.height = "";
			groupList[lastGroup].classList.remove("disconnected-marks");
		}
		//grabMark.remove();

		let marksList = groupList[group].querySelectorAll(".mark, .mark_full");		
		marksArr = [];
		marksRects = [];
		if(group != 0)
			for(var i = 0; i<marksList.length; i++){
				marksRects[i] = marksList[i].getBoundingClientRect();
				marksRects[i] = {
					elem: marksList[i],
					top: marksRects[i].top+globalOffset,
					left: marksRects[i].left,
					height: 120,
					width: 220
				}
				marksList[i].style.top = marksRects[i].top+"px";
				marksList[i].style.left = marksRects[i].left+"px";
			}
		else
			for(var i = 0; i<marksList.length; i++){
				marksRects[i] = {
					elem: marksList[i],
					top: 12,
					left: 12+72*i,
					height: 48,
					width: 48
				}
				marksList[i].style.top = marksRects[i].top+"px";
				marksList[i].style.left = marksRects[i].left+"px";
			}
		marksArr = groupList[group].querySelectorAll(".mark:not(.ghost_small_mark), .mark_full:not(.ghost_mark)");
		groupList[group].classList.add("disconnected-marks");
		//updateGroupsRects();
		groupList[group].appendChild(hoverPlaceMark.element);

	}
	function updateGroupsRects(){
		groupsRects = [];
		for(var i = 0; i<groupList.length; i++) groupsRects[i] = (groupList[i])? groupList[i].getBoundingClientRect() : null;
	}
	function minimalizeMark(){
		ghost.main.addClass("minimalize-mark");
		ghost.rippleMask.changeStyle([
			{tag: "margin-top", value: (ghost.rippleRadius)+"px"},
			{tag: "margin-left", value: (ghost.rippleRadius)+"px"}
		]);
		ghost.iconReal.changeStyle([
			{tag: "margin-top", value: (0)+"px"},
			{tag: "margin-left", value: (0)+"px"}
		]);
	}
	function maximalizeMark(){
		if(newData.group == 0){
			markData.isSmall = true;
			ghost.substrate.removeClass("mark_full");
			ghost.substrate.addClass("mark");
		}else{
			markData.isSmall = false;
			ghost.substrate.addClass("mark_full");
			ghost.substrate.removeClass("mark");
		}
		/*ghost.main.changeStyle([
			{tag: "top", value: sPstn.top+"px"},
			{tag: "left", value: sPstn.left+"px"}
		]);*/
		ghost.main.changeStyle([
			{tag: "top", value: newData.top+"px"},
			{tag: "left", value: newData.left+"px"}
		]);
		ghost.iconReal.changeStyle([
			{tag: "margin-top", value: (sPstn.offsetTop-24)+"px"},
			{tag: "margin-left", value: (sPstn.offsetLeft-24)+"px"}
		]);
		if(markData.isSmall) ghost.substrate.remove();
		else
			ghost.substrate.changeStyle([
				//{tag: "top", value: sPstn.top+"px"}
				{tag: "top", value: (newData.top)+"px"},
				{tag: "left", value: (newData.left)+"px"}
			]);
		ghost.rippleMask.addClass("reset-margin");
		ghost.rippleMask.changeStyle([
			{tag: "top", value: (sPstn.offsetTop+newData.top)+"px"},
			{tag: "left", value: (sPstn.offsetLeft+newData.left)+"px"},
			{tag: "margin-top", value: (-ghost.rippleRadius)+"px"},
			{tag: "margin-left", value: (-ghost.rippleRadius)+"px"},
			{tag: "height", value: (ghost.rippleRadius*2)+"px"},
			{tag: "width", value: (ghost.rippleRadius*2)+"px"}
		], function(){
			ghost.rippleMask.changeStyle([
				{tag: "margin-top", value: (-ghost.rippleRadius)+"px"},
				{tag: "margin-left", value: (-ghost.rippleRadius)+"px"}
			]);		
			ghost.main.removeClass("clear-transition");
			ghost.main.addClass("mark-hover-disabled");
			/*favPanel.favoritesWraper.changeStyle([{
				tag: "top",
				value: h+"px"
			}]);*/
			/*favPanel.favGroup.addClass("reset-box-shadow", function(){				
				favPanel.favGroup.removeClass("float-fav-panel");
			});*/
			ghost.main.removeClass("minimalize-mark", function(){
				bgPage.Window.DB.changeFile("/settings/sitesList.json", function(file, save){
					//console.log(newData)
					//console.log(markData)
					var mark;
					if(markData.numbGroup != 0){
						mark = file.all[markData.numbGroup-1].sites.splice(markData.numbMark, 1)[0];	
					}else mark = file.favorites.splice(markData.numbMark, 1)[0];
					if(newData.group != 0){
						file.all[newData.group-1].sites.splice(newData.position, 0, mark);	
					}else file.favorites.splice(newData.position, 0, mark);				
					save(file);
				}, function(){
					Window.dataOfTab.sitePanelIsLooked = false;
					Window.dataOfTab.body.classList.remove("all-marks-hover-disabled");
					callback();
				});	
			}, 400);
			ghost.iconReal.changeStyle([
				{tag: "margin-top", value: ((markData.isSmall)? 0 : 12)+"px"},
				{tag: "margin-left", value: ((markData.isSmall)? 0 : 86)+"px"}
			]);
		}, 50);
	}
}

function compileBackup(param, callback){	
	//sites
	//settings
	//bg
	var fBackup = {
		product: "ClockTab",
		type: "backup file",
		createTime: Date.now(),
		version: localStorage.getItem("version"),
		typeData: {
			sites: param.sites,
			settings: param.settings,
			bg: param.bg,
		},
		data: {}
	};

	saveSettings(!param.settings, function(){
		saveStorage(!param.settings, function(){
			saveWatch(!param.settings, function(){
				saveSites(!param.sites, function(){
					saveBGList(!param.bg, function(){
						callback(fBackup);
					});	
				});	
			});
		});
	});	

	function saveSettings(skip, callback){
		if(skip){
			callback();	
			return;
		}
		bgPage.Window.DB.changeFile("/settings/settings.json", function(settingsFile){
			fBackup.data.settings = settingsFile;
			callback();	
		});
	}
	function saveStorage(skip, callback){
		if(skip){
			callback();	
			return;
		}
		fBackup.data.storage = localStorage;
		delete fBackup.data.storage.bg_preview_now_set;
		delete fBackup.data.storage.next_check_background;
		callback();
	}
	function saveWatch(skip, callback){
		if(skip){
			callback();	
			return;
		}
		fBackup.data.watch = {};
		bgPage.Window.DB.getDirectoryFiles("/settings", function(files){
			queueProcessing(files.length, 0, function(next, i){
				if(~files[i].name.indexOf("watch"))
					bgPage.Window.DB.changeFile("/settings/"+files[i].name, function(watchFile){
						fBackup.data.watch[files[i].name.substring(0, files[i].name.length-5)] = watchFile;
						next();
					});
				else next();
			}, callback);
		});
	}
	function saveSites(skip, callback){
		if(skip){
			callback();	
			return;
		}
		bgPage.Window.DB.changeFile("/settings/sitesList.json", function(sitesListFile){
			fBackup.data.sites = sitesListFile;
			bgPage.Window.DB.getDirectoryFiles("/icons", function(files){
				fBackup.data.sitesIcons = files;
				queueProcessing(fBackup.data.sitesIcons.length, 0, function(next, i){
					imgToBase64(Window.dataOfTab.namespace+files[i].fullPath, function(bs64){
						fBackup.data.sitesIcons[i] = {
							name: files[i].name,
							file: bs64
						}
						next();
					});	
				}, function(){
					callback();					
				})
			});						
		});
	}
	function saveBGList(skip, callback){
		if(skip){
			callback();	
			return;
		}
		bgPage.Window.DB.changeFile("/settings/backgroundsList.json", function(backgroundsListFile){
			fBackup.data.backgroundsList = backgroundsListFile;
			callback();	
		});
	}

	function imgToBase64(src, callback){
		let img = document.createElement("img");
		img.setAttribute("src", src);
		img.onload = function(){
			var canvas = document.createElement("canvas");
			var ctx = canvas.getContext("2d");
		    canvas.width = img.width;
		    canvas.height = img.height;
		    ctx.drawImage(img, 0, 0);
		    callback(canvas.toDataURL("image/png"));
		}
	}
}

function queueProcessing(size, now, operation, finishCallback){
	if(size == now){
		if(finishCallback) finishCallback();
		return;
	}
	operation(function(){
		queueProcessing(size, now+1, operation, finishCallback)
	}, now);
}
function objectToArr(object){
	var dat = [];
	for(var key in object) dat[dat.length] = {"key": key, "data": object[key]};
	return dat;
}

function acceptBackupFile(file){
	file.createTime = new Date(file.createTime);
	file.createTime = file.createTime.getDate()+" "+
					  window.CLOCK.time.getMonth(file.createTime.getMonth()).toLowerCase()+" "+
					  file.createTime.getFullYear()+" года ("+
					  file.createTime.getHours()+":"+file.createTime.getMinutes()+")";

	let sites = [];
	for(var key in file.typeData){
		if(file.typeData[key])
			switch(key){
				case "sites": sites[sites.length] = "сайты"; break;
				case "settings": sites[sites.length] = "настройки"; break;
				//case "bg": sites[sites.length] = "фоны"; break;
			}
	}

	file.typeData = sites[0];
	for(var i=1; i<sites.length-2; i++) file.typeData +=", "+sites[i];
	if(sites.length > 1) file.typeData += " и "+sites[sites.length-1];
	if(sites.length == 0) file.typeData = "ничего";
	
	popup({
		name: "Восстановление данных",
		isWide: true,
		rightCol: [
			UI.createElem({tag: "h2", content: "Этот файл востановления данных был создан "+file.createTime+
				". Он востановит "+file.typeData+"."})
		],
		buttons: {
			ok: {
				text: "Восстановить",
				click: function(){
					if(file.version > JSON.parse(localStorage.getItem("version"))){
						notification({
							image: "../image/ic_error_white_24dp_1x.png",
							text: "Файл востановления принадлежит более поздей версии расширения. Сначала обновите ClockTab",
							timeout: 10000
						})
						return;
					}
					var dat = objectToArr(file.data);
					queueProcessing(dat.length, 0, function(nextFile, now){
						switch(dat[now].key){
							case "settings":
								bgPage.Window.DB.removeFile("/settings/settings.json", function(){
									bgPage.Window.DB.set("/settings/", {
										name: "settings.json",
										file: new Blob([JSON.stringify(dat[now].data)], {type: "application/json"})
									}, nextFile);
								});
								break;
							case "storage": 
								localStorage = dat[now].data;
								nextFile();
								break;
							case "watch":
								var watches = objectToArr(file.data.watch);
								queueProcessing(watches.length, 0, function(next, now){
									bgPage.Window.DB.removeFile("/settings/"+watches[now].key+".json", function(){
										bgPage.Window.DB.set("/settings/", {
											name: watches[now].key+".json",
											file: new Blob([JSON.stringify(watches[now].data)], {type: "application/json"})
										}, next);
									});
								}, nextFile);
								break;
							case "sites":
								bgPage.Window.DB.removeFile("/settings/sitesList.json", function(){
									bgPage.Window.DB.set("/settings/", {
										name: "sitesList.json",
										file: new Blob([JSON.stringify(dat[now].data)], {type: "application/json"})
									}, function(){
										bgPage.Window.DB.clearPath("/icons/", null, nextFile);
									});
								});
								break;
							case "sitesIcons": 
								queueProcessing(dat[now].data.length, 0, function(next, i){
									var img = new Image();
									img.src = dat[now].data[i].file
									img.onload = function(){
										var c = document.createElement("canvas");
										var ctx = c.getContext("2d");
										c.width = this.naturalWidth;
										c.height = this.naturalHeight;
										ctx.drawImage(this, 0, 0); 

										c.toBlob(function(blob_icon){
											bgPage.Window.DB.set("/icons", {
												file: blob_icon,
												name: dat[now].data[i].name
											}, function(isSuccess){
												if(!isSuccess) console.error("Ошибка записи иконки");
												next();
											});
										}, "image/jpeg", 1);
									}
								}, nextFile)
								break;
							case "backgroundsList": 
								/*Window.DB.changeFile("settings/", function(sFile, save){

								});*/
								nextFile();
								break;
						}
					}, function(){
						localStorage.setItem("start-notification", JSON.stringify({
							text: "Данные востановленны",
							timeout: 10000
						}));
						document.location.reload();
					});
				}
			}
		}
	})
}


function guide(nNewPos){
	if(Window.dataOfTab.menuIsOpen){
		closeMenu(function(){
			guide(nNewPos);
		});
		return;
	}
	var nowPos = (nNewPos)? nNewPos : localStorage.getItem("training_stage")-1;	
	var scriptGuid = [
		{
			text: "Сохраняйте любимые сайты для быстрого доступа к ним. Чтобы посмотреть их, прокрутите колесико мыши вниз на главном экране.\
				 Сайты можно добавлять как через закладки, так и через кнопку добавления в трее браузера.",
			notificationText: "Попробуйте открыть закладки, прокрутив колесико мыши вниз",
			action: function(nextButton, callback){
				if(Window.dataOfTab.sitePanel){
					closeFunc(true);
					return;
				}
				if(localStorage.getItem("training_stage") >= 2) return;
				addEventListener("wheel", closeFunc);
				function closeFunc(dontCheck){
					if(!dontCheck && event.deltaY < 0) return;
					removeEventListener("wheel", closeFunc);
					callback();					
					localStorage.setItem("training_stage", 2);
				}
			}
		},
		{
			text: "В меню можно настроить фоны, часы и другие механизмы расширения. Чтобы его открыть, \
				переместите курсор в правый край окна на главной странице и нажмите на кнопку меню на сплывающей панели.",
			notificationText: "Закройте панель закладок, прокрутив колесико мыши вниз, и на главном экране откройте меню",
			action: function(nextButton, callback){
				if(Window.dataOfTab.menuIsOpen){
					closeFunc();
					return;
				}
				if(localStorage.getItem("training_stage") >= 3) return;
				document.getElementById("menu").addEventListener("click", closeFunc);
				function closeFunc(){
					callback();
					document.getElementById("menu").removeEventListener("click", closeFunc);
					localStorage.setItem("training_stage", 3);
				}
			}
		},
		{
			text: "Во вкладке 'Часы' вы сможете выбрать какого стиля будут часы, а также настроить их.",
			notificationText: "Откройте вкладку 'Часы'",
			action: function(nextButton, callback){
				if(document.getElementById("menu-clock") && document.getElementById("menu-clock").classList.contains("open-block")){
					closeFunc();
					return;
				}
				if(localStorage.getItem("training_stage") >= 4) return;
				console.log("CLOCK: "+(!document.getElementById("menu-clock")))
				if(!document.getElementById("menu-clock")){
					document.getElementById("menu").addEventListener("click", act);
					return;
				}else act();
				function act(){
					document.getElementById("menu-clock").addEventListener("click", closeFunc);
				}
				function closeFunc(){
					console.log("CLICK CLOCK")
					callback();
					document.getElementById("menu-clock").removeEventListener("click", closeFunc);
					document.getElementById("menu").removeEventListener("click", act);
					localStorage.setItem("training_stage", 4);
				}				
		}
		},
		{
			text: "Во вкладке 'Меню быстрого доступа и закладки' вы сможете настроить панель быстрого доступа \
				к самым нужным сайтам, которая будет отображаться постоянно на главном экране.",
				notificationText: "Откройте вкладку 'Меню быстрого доступа и закладки'",
			action: function(nextButton, callback){
				if(document.getElementById("menu-quick") && document.getElementById("menu-quick").classList.contains("open-block")){
					closeFunc();
					return;
				}
				if(localStorage.getItem("training_stage") >= 5) return;
				if(!document.getElementById("menu-quick")){
					document.getElementById("menu").addEventListener("click", act);
					return;
				}else act();
				function act(){
					document.getElementById("menu-quick").addEventListener("click", closeFunc);
				}
				function closeFunc(){
					callback();
					document.getElementById("menu-quick").removeEventListener("click", closeFunc);
					document.getElementById("menu").removeEventListener("click", act);
					localStorage.setItem("training_stage", 5);
				}				
			}
		},
		{
			text: "Во вкладке 'Фон и планировщик' вы сможете выбрать фоны из нашего каталога или загрузить свой. \
				А также настроить их переключение по времени и дням.",
			notificationText: "Откройте вкладку 'Фон и планировщик'",
			action: function(nextButton, callback){
				if(document.getElementById("menu-bg") && document.getElementById("menu-bg").classList.contains("open-block")){
					closeFunc();
					return;
				}
				if(localStorage.getItem("training_stage") >= 6) return;
				if(!document.getElementById("menu-bg")){
					document.getElementById("menu").addEventListener("click", act);
					return;
				}else act();
				function act(){
					document.getElementById("menu-bg").addEventListener("click", closeFunc);
				}		
				function closeFunc(){
					callback();
					document.getElementById("menu-bg").removeEventListener("click", closeFunc);
					document.getElementById("menu").removeEventListener("click", act);
					localStorage.setItem("training_stage", 6);
				}		
			}
		},
		{
			text: "Во вкладке 'Дополнительно' вы сможете создать файл восстановления и восстановить данные.",
			notificationText: "Откройте вкладку 'Дополнительно'",
			action: function(nextButton, callback){
				if(document.getElementById("menu-additionally") && document.getElementById("menu-additionally").classList.contains("open-block")){
					closeFunc();
					return;
				}
				if(localStorage.getItem("training_stage") >= 7) return;
				if(!document.getElementById("menu-additionally")){
					document.getElementById("menu").addEventListener("click", act);
					return;
				}else act();
				function act(){
					document.getElementById("menu-additionally").addEventListener("click", closeFunc);
				}
				function closeFunc(){
					callback();
					nextButton.distabled(false);
					document.getElementById("menu-additionally").removeEventListener("click", closeFunc);
					document.getElementById("menu").removeEventListener("click", act);
					localStorage.setItem("training_stage", 7);
				}				
			}
		}
	];

	if(nowPos == -1){
		var wraper = UI.createElem({
			class: "gid-wrap gid-hide",
			content: UI.createElem({
				class: "gid-main-menu gid-block",
				content: [
					UI.createElem({
						class: "gid-block-ahead",
						content: "Привет, это ClockTab"
					}),
					UI.createElem({
						class: "gid-description",
						content: "Спасибо что выбрали нас, надеемся мы вас не подведем. \
							Чтобы сразу не запутаться в расширении, пройдите небольшое обучение. Это займет меньше минуты."
					}),
					UI.createElem({
						class: "gid-butt-block",
						content: [
							UI.createButton({
								settings: {
									class: "false",
									content: "Пропустить обучение"
								},
								click: function(){
									localStorage.setItem("training_stage", scriptGuid.length+2);
									Window.dataOfTab.sitePanelIsLooked = false;
									wraper.addClass("gid-hide", function(){
										wraper.remove();
									});
								}
							}),
							UI.createButton({
								settings: {
									content: "Начать"
								},
								click: function(){
									wraper.addClass("gid-hide", function(){
										Window.dataOfTab.sitePanelIsLooked = false;
										wraper.remove();
										nowPos++;
										localStorage.setItem("training_stage", ((localStorage.getItem("training_stage") > nowPos-2)? 
												localStorage.getItem("training_stage") : 2));
										loadScript();
									});
								}
							})
						]
					})
				]
			})
		});
		Window.dataOfTab.sitePanelIsLooked = true;
		globalBody.appendChild(wraper, function(){
			wraper.removeClass("gid-hide");
		}, 50);
	}else loadScript();

	function loadScript(){
		if(nowPos < 0){
			guide(nowPos);
			return;
		}
		if(nowPos < scriptGuid.length){
			let nextButton = UI.createButton({
				settings: {
					content: "Вперед",
					isEnabled: localStorage.getItem("training_stage")-1 > nowPos
				},
				click: function(){
					nowPos++;
					panel.addClass("gid-hide", function(){
						panel.remove();
						loadScript();
					});
				}
			});
			let panel =  UI.createElem({
				class: "gid-main-menu gid-block gid-lesson gid-hide "+((nowPos+1 < localStorage.getItem("training_stage"))? "show-finish-notic" : ""),
				content: [
					UI.createElem({
						class: "gid-text-wrp",
							content: [
								UI.createElem({
							class: "gid-block-ahead",
							content: nowPos+1
						}),
						UI.createElem({
							class: "gid-description",
							content: scriptGuid[nowPos].text
						})
						]
					}),
					UI.createElem({
						class: "gid-butt-block",
						content: [
							UI.createButton({
								settings: {
									class: "false",
									content: "Назад"
								},
								click: function(){
									nowPos--;
									panel.addClass("gid-hide", function(){
										panel.remove();
										loadScript();
									});
								}
							}),
							nextButton
						]
					}),
					UI.createElem({
						class: "gid-notification",
						content: scriptGuid[nowPos].notificationText
					}),
					UI.createElem({
						class: "gid-notification-finish",
						content: "Отлично"
					})
				]
			});
			globalBody.appendChild(panel, function(){
				panel.removeClass("gid-hide");
				if(scriptGuid[nowPos].action) scriptGuid[nowPos].action(nextButton, function(){
					panel.addClass("show-finish-notic");					
					nextButton.distabled(false);
				});
			}, 50);
		}else finish();
	}

	function finish(){
		if(Window.dataOfTab.menuIsOpen){
			closeMenu(finish);
			return;
		}
		var wraper = UI.createElem({
			class: "gid-wrap gid-hide",
			content: UI.createElem({
				class: "gid-main-menu gid-block",
				content: [
					UI.createElem({
						class: "gid-block-ahead",
						content: "Ну вот и всё"
					}),
					UI.createElem({
						class: "gid-description",
						content: "Теперь вы не заблудитесь."
					}),
					UI.createElem({
						class: "gid-butt-block",
						content: UI.createButton({
							settings: {
								content: "Поехали"
							},
							click: function(){
								localStorage.setItem("training_stage", scriptGuid.length+2);
								Window.dataOfTab.sitePanelIsLooked = false;
								wraper.addClass("gid-hide", function(){
									wraper.remove();
								});
							}
						})
					})
				]
			})
		});
		if(Window.dataOfTab.sitePanel)
			Window.dataOfTab.sitePanel.addClass("hide", function(panel){
				panel.remove();
				Window.dataOfTab.sitePanelIsLooked = true;
			});	
		globalBody.appendChild(wraper, function(){
			wraper.removeClass("gid-hide");
		}, 50);
	}
}

function editMarkActivity(data, callback){
	console.log(data);
	/*var parser = new bgPage.MConstr;
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
				content: "Сохранить"
			},
			click: function(){*/
				/*bgPage.Window.DB.changeFile("/settings/sitesList.json", function(file, save){
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
						substring: (saveData.colorfull_sub.value)? ((saveData.preview.images[saveData.preview.select].baseColor != null)? 
						saveData.preview.images[saveData.preview.select].baseColor 
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
				},callback);*/
			/*}
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
	//parser.addMarkToList(obj);
	parser.createMarksList(obj);
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
						content: "Редактирование закладки"
					}),
					UI.createElem({tag: "h2", content: "Название"}),
					saveData.name,
					saveData.colorfull_sub,
					UI.createElem({
						style: ["bottom: 10px;", "position: absolute;", "right: 10px;"],
						content: [
							UI.createButton({
								settings: {
									class: "false",
									content: "Отмена"
								},
								click: function(){
									loadActivity.addClass("hide", function(){
										Window.dataOfTab.sitePanelIsLooked = false;
										loadActivity.remove();
									})
								}
							}),
							saveData.saveButton
						]
					})
				]
			})
		]
	});

	var loadActivity = UI.createElem({
		class: "site_panel_add hide",
		content: form
	});
	Window.dataOfTab.sitePanelIsLooked = true;
	globalBody.appendChild(loadActivity);
	setTimeout(function(){
		//saveData.url.element.focus();
		loadActivity.removeClass("hide");
	}, 50);*/






















	var inputName = UI.createInput({
		settings: {content: data.name}
	});
	popup({
		name: "Редактирование закладки",
		isWide: true,
		rightCol: (function(){											
			var col = [
				UI.createElem({tag: "h2", content: "Название"}),
				inputName
			];
			return col;
		})(),
		buttons: {
			cancel: {click: function(){
				
			}},
			ok: {
				text: "Сохранить",
				click: function(){
					bgPage.Window.DB.changeFile("/settings/sitesList.json", function(file, save){4
						console.log(data)
						if(data.numbGroup != null) file.all[data.numbGroup].sites[data.numbMark].name = inputName.element.value;
						else file.favorites[data.numbMark].name = inputName.element.value;
						save(file);
					},
					function(){
						callback();
					});
				}
			}
		}
	});
}