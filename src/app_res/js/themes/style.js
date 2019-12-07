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
const classesAlphabet = ["a", "b", "c", "d", "e", "f", "j", "h", "i", "g", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
let classesIndex = 0;
let updateTimeout = null;
let stableClassesStore = document.createElement("style");
//let tempClassesStore = document.createElement("style");

export function setTheme(theme){
	usedTheme = theme;
	stylesConstructor = useTheme();

	document.head.appendChild(stableClassesStore);
	//document.head.appendChild(tempClassesStore);
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
		let classProps = {classIndex: 0};

		Object.keys(styles[className]).forEach(style => {
			switch (style) {
				case "$classIndex":
					classProps.classIndex = styles[className][style];
					break;
				default:
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
					break;
			}			
		});

		if(!stylesList[classProps.classIndex]) stylesList[classProps.classIndex] = [];

		let i = 0;		

		while(i < stylesList[classProps.classIndex].length && stylesList[classProps.classIndex][i].style !== calcStyle) i++;

		if(i === stylesList[classProps.classIndex].length){
			stylesList[classProps.classIndex].push({style: calcStyle, index: classesIndex});
			classesIndex++;
		}

		calcClasses[className] = getClassName(stylesList[classProps.classIndex][i].index);
	});

	updateStyles();

	return calcClasses;
}

function getClassName(index = 0){
	let className = '';

	while(index >= classesAlphabet.length){
		let symbol = index % classesAlphabet.length;
		className = classesAlphabet[symbol]+className;
		index = Math.floor(index / classesAlphabet.length);
	}

	className = classesAlphabet[index]+className;

	return className;
}

function updateStyles(){
	if(updateTimeout) clearTimeout(updateTimeout);

	stableClassesStore.innerHTML = "";

	Object.keys(stylesList).forEach(index => {
		stableClassesStore.innerHTML += stylesList[index].map((classObject, index) => `.${getClassName(classObject.index)}{${classObject.style}}`).join("");
	});

	/*updateTimeout = setTimeout(() => {
		stableClassesStore.innerHTML = tempClassesStore.innerHTML;
		//tempClassesStore.innerHTML = '';
	}, 1000);*/
}