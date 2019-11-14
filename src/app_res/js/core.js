import { setLocale, getValue as LOC} from "./utils/Locale.js";
import Store from "./utils/Store.js";
import UI from "./GUI/coreUI.js";

import { Heart as HeartIcon } from "./Icons/Icons.js";

import Home from "./pages/Home.js";

setLocale("RU");

let percent = 0;
let max = Math.max(document.body.clientHeight/150, document.body.clientWidth/150);
let record = 0;

let timer = null;
const handlerClick = () => {
	percent += (max - percent)*0.1;
	downPercent();
}

const downPercent = () => {
	if(timer) clearTimeout(timer);
	timer = null;
	percent -= percent*0.13;
	record = Math.max(percent, record);
	if(percent > 0 && !timer) timer = setTimeout(downPercent, 100);
}

const frame = () => {
	setSize(value => value + (percent - value)*0.1);
	requestAnimationFrame(frame);
}

let [size, setSize, addSizeListener] = new Store(0, true);

frame();

new UI(document.body)
	.append(
		Home.create()
			.append(
				UI.create()
					.append(
						() => {
							let dom = new HeartIcon({
										size: 150,
										fill: "#ff0056"
									});

							addSizeListener(value => {
								dom.style.width = `${150*(value+1)}px`;
								dom.style.height = `${150*(value+1)}px`;
							}, true);

							return dom;
						}
					)
					.append(
						() => {
							let dom = new UI("span").content("Люблю тебя)");

							addSizeListener(value => {
								dom.style()
									.add("font-size", `${10*(value+1)}px`)
									.add("opacity", `${record > 1 && value >= record*0.8? 1 : 0}`)
							}, true);

							return dom;
						}
					)
					.class("heart")
					.event("click", handlerClick)				
			)
	)