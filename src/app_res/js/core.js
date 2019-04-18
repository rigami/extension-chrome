function Core(){
	this.page = new UI("div").class("body");

	this.initialization = ()=>{
		console.log(Loc.hello_world);
		document.body.appendChild(this.page.getHTML())
		this.page.append(new Button({}, "app_res/img/icons.svg#settings", "text", Loc.hello_world).onclick(()=>{console.log(Loc.hello_world)}))
		
	}
}