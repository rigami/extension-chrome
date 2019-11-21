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

export class PhotoLibrary extends Icon{
	constructor(props){
		super({
			props: {
				...props,
				viewBox: "0 0 24 24",
			},
			icon: 
			`
			<path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-10.6-3.47l1.63 2.18 2.58-3.22c.2-.25.58-.25.78 0l2.96 3.7c.26.33.03.81-.39.81H9c-.41 0-.65-.47-.4-.8l2-2.67c.2-.26.6-.26.8 0zM2 7v13c0 1.1.9 2 2 2h13c.55 0 1-.45 1-1s-.45-1-1-1H5c-.55 0-1-.45-1-1V7c0-.55-.45-1-1-1s-1 .45-1 1z"/>
			`
		});
	}

	static create(){
		return new PhotoLibrary(...arguments);
	}
}

export class Toll extends Icon{
	constructor(props){
		super({
			props: {
				...props,
				viewBox: "0 0 24 24",
			},
			icon: 
			`
			<path d="M15 4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zM3 12c0-2.39 1.4-4.46 3.43-5.42.34-.16.57-.47.57-.84v-.19c0-.68-.71-1.11-1.32-.82C2.92 5.99 1 8.77 1 12s1.92 6.01 4.68 7.27c.61.28 1.32-.14 1.32-.82v-.18c0-.37-.23-.69-.57-.85C4.4 16.46 3 14.39 3 12z"/>
			`
		});
	}

	static create(){
		return new Toll(...arguments);
	}
}
