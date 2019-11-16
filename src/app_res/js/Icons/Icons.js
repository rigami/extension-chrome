import UI from "../GUI/coreUI.js";

//TODO сделать подгрузку иконок

class Icon{
	constructor({icon, props = {}}){
		props = {
			...props,
			width: props.size || 15,
			height: props.size || 15
		}
		delete props.size;
		let dom = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		Object.keys(props).forEach((key) => {
			dom.setAttribute(key, props[key]);
		});
		dom.innerHTML = icon;

		return dom;
	}

	static create(){
		return new Icon(...arguments);
	}
}

export class Settings extends Icon{
	constructor(props){
		super({
			props: {
				...props,
				viewBox: "0 0 24 24",
			},
			icon: 
			`
			<path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>
			`
		});
	}
	
	static create(){
		return new Settings(...arguments);
	}
}

export class ArrowDown extends Icon{
	constructor(props){
		super({
			props: {
				...props,
				viewBox: "0 0 24 24",
			},
			icon: 
			`
			<path d="M8.12 9.29L12 13.17l3.88-3.88c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41l-4.59 4.59c-.39.39-1.02.39-1.41 0L6.7 10.7c-.39-.39-.39-1.02 0-1.41.39-.38 1.03-.39 1.42 0z"/>
			`
		});
	}

	static create(){
		return new ArrowDown(...arguments);
	}
}

export class Check extends Icon{
	constructor(props){
		super({
			props: {
				...props,
				viewBox: "0 0 24 24",
			},
			icon: 
			`
			<path d="M9 16.17L5.53 12.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l4.18 4.18c.39.39 1.02.39 1.41 0L20.29 7.71c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0L9 16.17z"/>
			`
		});
	}

	static create(){
		return new Check(...arguments);
	}
}

export class Refresh extends Icon{
	constructor(props){
		super({
			props: {
				...props,
				viewBox: "0 0 24 24",
			},
			icon: 
			`
			<path d="M12 4V2.21c0-.45-.54-.67-.85-.35l-2.8 2.79c-.2.2-.2.51 0 .71l2.79 2.79c.32.31.86.09.86-.36V6c3.31 0 6 2.69 6 6 0 .79-.15 1.56-.44 2.25-.15.36-.04.77.23 1.04.51.51 1.37.33 1.64-.34.37-.91.57-1.91.57-2.95 0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-.79.15-1.56.44-2.25.15-.36.04-.77-.23-1.04-.51-.51-1.37-.33-1.64.34C4.2 9.96 4 10.96 4 12c0 4.42 3.58 8 8 8v1.79c0 .45.54.67.85.35l2.79-2.79c.2-.2.2-.51 0-.71l-2.79-2.79c-.31-.31-.85-.09-.85.36V18z"/>
			`
		});
	}

	static create(){
		return new Refresh(...arguments);
	}
}
