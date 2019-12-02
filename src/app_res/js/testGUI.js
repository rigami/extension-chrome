import Button from "./GUI/Button.js";
import Checkbox from "./GUI/Checkbox.js";
import Slider from "./GUI/Slider.js";
import Dropdown from "./GUI/Dropdown.js";
import Input from "./GUI/Input.js";
import UI from "./GUI/coreUI.js";
import SettingsRow from "./components/SettingsRow.js";
import { Store } from "./utils/Store.js";
import { Settings as SettingsIcon } from "./Icons/Icons.js";
import { setLocale, getValue as LOC} from "./utils/Locale.js";

setLocale("RU");

console.log(LOC("hello_world"))

let [counter, setCounter, addCounterListener] = new Store(0, true);
let [sliderValue, setSliderValue, addSliderValueListener] = new Store(.5, true);
let [inputValue, setInputValue, addInputValueListener] = new Store('', true);

new UI(document.body)
	.append(
		SettingsRow.create({
			title: "Test settings row stand",
			subtitle: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis et elit lacus.
			 Phasellus vel malesuada erat. Sed eget sem lobortis, mollis dui et, dictum diam. Phasellus ut aliquam nisl.
			  Maecenas ultricies metus id ante tincidunt, non mollis augue imperdiet. Etiam convallis nisi ac lacus pulvinar sollicitudin. 
			  Mauris ut risus at turpis posuere volutpat eget eu nunc. Sed non viverra sem.`
		})
	)
	.append(
		SettingsRow.create({
			title: "Button test stand",
			subtitle: ()=>{
				let counterDom = UI.create("p");

				addCounterListener(value => {
					counterDom.content(`This is button. Button clicked ${value} times`)
				}, true);

				return counterDom;
			},
			action: Button.create({
				label: "Test ripple effect",
				onclick: () => {
					setCounter(value => value+1);
				}
			}),
			isRipple: false
		})
	)
	.append(
		SettingsRow.create({
			title: "Button with icon",
			action: Button.create({
				icon: SettingsIcon,
				label: "Test ripple effect",
			}),
			isRipple: false
		})
	)
	.append(
		SettingsRow.create({
			title: "Button only icon",
			action: Button.create({
				icon: SettingsIcon,
				onclick: () => {
					setCounter(value => value+1);
				}
			}),
			isRipple: false
		})
	)
	.append(
		SettingsRow.create({
			title: "Checkbox test stand",
			subtitle: "This is checkbox",
			action: (onclick) => {
				let checkbox = Checkbox.create({
					uncontrollable: true
				});

				onclick(() => {
					checkbox.setValue(!checkbox.checked);
				});

				return checkbox;
			}
		})
	)
	.append(
		SettingsRow.create({
			title: "Slider test stand",
			subtitle: ()=>{
				let counterDom = UI.create("p");

				addSliderValueListener(value => {
					counterDom.content(`This is slider. Slider value: ${Math.round(value*100)}%`)
				}, true);

				return counterDom;
			},
			action: Slider.create({
				value: sliderValue,
				onchange: setSliderValue
			}),			
			isRipple: false
		})
	)
	.append(
		SettingsRow.create({
			title: "Dropdown test stand",
			subtitle: "This is dropdown",
			action: Dropdown.create({
				onchange: (value, item, dropdown) => {

				},
				defaultValue: "item_3",
				list: [
					{value: "item_1", label: "Item 1"},
					{value: "item_2", label: "Item 2"},
					{value: "item_3", label: "Item 3"},
					{value: "item_4", label: "Item 4"},
					{value: "item_5", label: "Item 5"},					
					{value: "item_1", label: "Item 1"},
					{value: "item_2", label: "Item 2"},
					{value: "item_3", label: "Item 3"},
					{value: "item_4", label: "Item 4"},
					{value: "item_5", label: "Item 5"}
				]
			}),			
			isRipple: false
		})
	)
	.append(
		SettingsRow.create({
			title: "Dropdown (multiple) test stand",
			subtitle: "This is multiple dropdown",
			action: Dropdown.create({
				isMultiple: true,
				list: [
					{value: "item_1", label: "Item 1"},
					{value: "item_2", label: "Item 2"},
					{value: "item_3", label: "Item 3"},
					{value: "item_4", label: "Item 4"},
					{value: "item_5", label: "Item 5"}
				],
				onchange: (values, changeValue, dropdown) => {
					//console.log(values, changeValue)
				},
				labelFormat: (list, selectedValues) => {
					let labels = list.filter(el => selectedValues[el.value]).map(el => el.label);

					if(labels.length === list.length) return "All";

					if(labels.length > 1){
						labels = labels.slice(0, labels.length-1).join(", ")+" and "+labels[labels.length-1];
					}else{
						labels = labels.join(", ");
					}

					return labels || "No selected";
				}
			}),			
			isRipple: false
		})
	)
	.append(
		SettingsRow.create({
			title: "Input test stand",
			subtitle: ()=>{
				let counterDom = UI.create("p");

				addInputValueListener(value => {
					counterDom.content(`This input. Input value: '${value}'`)
				}, true);

				return counterDom;
			},
			action: Input.create({
				title: "Input test",
				onchange: setInputValue
			}),			
			isRipple: false
		})
	)