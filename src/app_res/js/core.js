function Core(){
	this.page = UI.create(document.body);

	this.initialization = ()=>{
		console.log("Page success initialization")
	}

	let btnCounter = new function(){
		this.count = 0;
		this.message =  UI.create("h2").content("Button");
		this.inc = ()=>{
			this.count+=1;
			this.message.content("Button. Pressed "+this.count+" times");

			return this.message;
		}
	};

	var testBtn = Button.create("Switch style", null, (e, btn)=>{
		btnCounter.inc();
		if(btnCounter.count % 2) btn.class().add("gui-second-style");
		else btn.class().remove("gui-second-style");
	});

	this.page
		.append(
			UI.create("h1").content("Test GUI")
		)
		.append(
			UI.create()
				.append(btnCounter.message)
				.append(testBtn)
		)
		.append(
			UI.create("h2").content("Action button")
		)
		.append(
			Button.create("Disabled button", null, (e, btn)=>{
				if(testBtn.enabled){
					testBtn.disable();
					btn.content("Enabled button");
				}else{
					testBtn.enable();
					btn.content("Disabled button");	
				}
			})
		)
		.append(
			UI.create("h1").content("Test GUI")
		)
		.append(
			UI.create()
				.append(UI.create("h2").content("Checkbox"))
				.append(
					Checkbox.create(()=>{console.log("Checkbox value: ", this.checked)})
				)
		)
}