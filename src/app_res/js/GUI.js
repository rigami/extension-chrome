/**
 * Light GUI library
 * Dependency: UI library
 * @author Danilkinkin <hello@danilkinkin.com>
 */

class GUI extends UI{
	constructor(hintText, ){
		this._hintText = hintText;
		this._enabled = true;
	}

	set hint(newHintText){
		this._hintText = newHintText;
	}

	setHint(newHintText){
		this._hintText = newHintText;

		return this;
	}

	get enabled(){
		return this._enabled;
	}

	isEnabled(callback){
		if(callback) callback(this._enabled);
		else console.error("GUI: Invalid arguments for 'isEnabled' method. Method should be called as 'isEnabled(callback)'");

		return this;
	}

	enable(){
		this._enabled = true;

		return this;
	}

	disable(){
		this._enabled = false;

		return this;
	}
}

class Button extends GUI{
	constructor(){
		super();
	}
}

class Checkbox extends GUI{
	constructor(){
		super();
	}
}

class Slider extends GUI{
	constructor(){
		super();
	}
}

class Input extends GUI{
	constructor(){
		super();
	}
}

class Dropdown extends GUI{
	constructor(){
		super();
	}
}

class MultiCheckbox extends Dropdown{
	constructor(){
		super();
	}
}