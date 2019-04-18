function Localization(lang){
	var onloadEvent = function(){};
	var onerrorEvent = function(){};

	this.onload = function(onloadFunc){
		onloadEvent = onloadFunc;
		return this;
	}.bind(this);
	this.onerror = function(onerrorFunc){
		onerrorEvent = onerrorFunc;
		return this;
	}.bind(this);

	loadDictonary(lang);

	function loadDictonary(l){
		var dictionary = document.createElement("script");
		dictionary.setAttribute("src", "app_res/lang/"+l.toUpperCase()+".js")
		document.head.appendChild(dictionary);
		dictionary.onload = function(){
			onloadEvent();
		}
		dictionary.onerror = function(){
			console.log("Not find vocabulary '"+l+"'. Try set 'EN' vocabulary");
			loadDictonary("EN");
			if(l == "EN") onerrorEvent();
		};
	}
}