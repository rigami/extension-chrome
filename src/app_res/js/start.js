var app = null;
pageIsLoad = false;

new Localization(localStorage.getItem("language")? localStorage.getItem("language") : navigator.language.substring(3))
	.onload(function(){
		app = new Core();
		app.initialization();
	})
	.onerror(function(){
		console.error("Error set language");
	});

window.onload = function(){
	pageIsLoad = true;
}