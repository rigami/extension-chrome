function Core(){
	this.page = UI.create(document.body);

	this.initialization = ()=>{
		console.log("Page success initialization")
	}

	var elements = {
		button: Button.create("Switch style", null, (e, btn)=>{
			if(!btn.class().has("gui-second-style")) btn.class().add("gui-second-style");
			else btn.class().remove("gui-second-style");
		}),
		checkbox: Checkbox.create((e, btn)=>{console.log("Checkbox value: ", btn.checked)}),
		slider: Slider.create((e, btn)=>{sliderValue.content(Math.round(btn.value*100)/100+"%)")})
	}

	let sliderValue = UI.create("span").content("0%)");

	this.page
		.append(
			UI.create("h1").content("Test GUI")
		)
		.append(
			Button.create("Disabled GUI", null, (e, btn)=>{
				if(elements.button.enabled){
					for(var key in elements) elements[key].disable();
					btn.content("Enabled GUI");
				}else{					
					for(var key in elements) elements[key].enable();
					btn.content("Disabled GUI");	
				}
			})
		)
		.append(
			UI.create()
				.append(UI.create("h2").content("Button"))
				.append(elements.button)
		)
		.append(
			UI.create()
				.append(UI.create("h2").content("Checkbox"))
				.append(elements.checkbox)
		)
		.append(
			UI.create()
				.append(UI.create("h2").append("Slider (value: ").append(sliderValue)/*.append("%)")*/)
				.append(elements.slider)
		)
}