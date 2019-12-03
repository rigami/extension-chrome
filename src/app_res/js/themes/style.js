export const defaultTheme = {
	space: {
		unit: 4
	},
	palette: {
		bg: {
			main: 	"#FFFFFF",
			second: "#F5F5F5"
		},
		primary: {
			light: 	"#CFE1FC",
			main: 	"#2675F0",
			dark: 	"#0E469C"
		},
		second: {
			light: 	"#E5E5E5",
			main: 	"#545454",
			dark: 	"#1F1F1F"
		},
		text: {
			title: {
				dark: 	"#2D2D2D",
				light: 	"#FFFFFF"
			},
			subtitle: {
				dark: 	"#575757",
				light: 	"#D7D7D7"
			},
			primary: 	"#FFFFFF",
			second: 	"#FFFFFF"
		}
	},
	typography: {
		size: {
			huge: 		"26px",
			big: 		"18px",
			normal: 	"15px",
			small: 		"13px",

			title1: 	"22px",
			title2: 	"17px",
			title3: 	"15px",

			subtitle: 	"13px"
		}
	},
	boxShadow: {
		normal: "0 1px 16px rgba(0, 0, 0, .28)"
	}
};

let usedTheme = null;
let stylesConstructor = null;

let stylesList = {};
let classesList = {};
let classesBlock = document.createElement("style");

export function setTheme(theme){
	usedTheme = theme;
	stylesConstructor = useTheme();

	document.head.appendChild(classesBlock)
}

export const useTheme = () => new function(){
	this.spacing = (spaces) => `${usedTheme.space.unit*spaces}px`;
	this.palette = usedTheme.palette;
	this.typography = usedTheme.typography;
	this.boxShadow = usedTheme.boxShadow;
};

export const useStyles = (styles) => {
	return typeof styles === "function"? styles(stylesConstructor) : styles;
}

export const useClasses = (styles) => {
	styles = typeof styles === "function"? styles(stylesConstructor) : styles;
	
	let calcClasses = {};

	Object.keys(styles).forEach(className => {
		let calcStyle = "";

		Object.keys(styles[className]).forEach(style => {
			let i = 0;

			let lowerStyle = style;

			while(i < lowerStyle.length){
				if(lowerStyle[i] === lowerStyle[i].toUpperCase()){
					lowerStyle = lowerStyle.substring(0, i)+"-"+lowerStyle[i].toLowerCase()+lowerStyle.substring(i+1)
					i++;
				}
				i++;
			}

			calcStyle += lowerStyle+":"+styles[className][style]+";";
		});

		if(classesList[className]){
			classesList[className]++;
		}else{
			classesList[className] = 1;
		}

		let i = 0;

		while(i < (classesList[className] || 0) && stylesList[className+"-"+i] !== calcStyle) i++;

		calcClasses[className] = className+"-"+i;

		if(i !== classesList[className]){
			classesList[className]--;
		}else{
			stylesList[className+"-"+classesList[className]] = calcStyle;
		}

		
	});

	classesBlock.innerHTML = Object.keys(stylesList).map(className => `.${className}{${stylesList[className]}}`).join("");

	return calcClasses;
}