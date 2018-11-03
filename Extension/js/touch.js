var touchStart = false;
var touch;

addEventListener("touchstart", function(event){
	touch = event.touches[0];
	touchStart = true;
	console.log(event)
}, false);
addEventListener("touchend", function(event){
	console.log(event);
	
}, false);
addEventListener("touchmove", function(event){
	if((touchStart)&&(!Window.dataOfTab.sitePanel)&&(!Window.dataOfTab.sitePanelIsLooked)&&(touch.screenY - event.touches[0].screenY > 10)){
		drawSitePanel();
	}
	if((touchStart)&&(Window.dataOfTab.sitePanel)&&(!Window.dataOfTab.sitePanelIsLooked)&&(Window.dataOfTab.sitePanel.element.scrollTop == 0)&&(touch.screenY - event.touches[0].screenY < -10)){
		Window.dataOfTab.sitePanelIsLooked = true;
		Window.dataOfTab.sitePanel.addClass("hide", function(panel){
			panel.remove();
			Window.dataOfTab.sitePanelIsLooked = false;
		});	
		Window.dataOfTab.sitePanel = null;			
	}
	console.log(event)
}, false);