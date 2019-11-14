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

export class Heart extends Icon{
	constructor(props){
		super({
			props: {
				...props,
				viewBox: "0 0 24 24",
			},
			icon: 
			`
			<path d="M13.35 20.13c-.76.69-1.93.69-2.69-.01l-.11-.1C5.3 15.27 1.87 12.16 2 8.28c.06-1.7.93-3.33 2.34-4.29 2.64-1.8 5.9-.96 7.66 1.1 1.76-2.06 5.02-2.91 7.66-1.1 1.41.96 2.28 2.59 2.34 4.29.14 3.88-3.3 6.99-8.55 11.76l-.1.09z"/>
			`
		});
	};
}