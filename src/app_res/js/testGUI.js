import Button from "./GUI/Button.js";
import Checkbox from "./GUI/Checkbox.js";
import Slider from "./GUI/Slider.js";
import Dropdown from "./GUI/Dropdown.js";
import UI from "./GUI/coreUI.js";
import SettingsRow from "./components/SettingsRow.js";
import Store from "./stores/lightStore.js";


let [counter, setCounter, addCounterListener] = new Store(0, true);

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
			title: "Checkbox test stand",
			subtitle: "This is checkbox",
			action: (onclick) => {
				let checkbox = Checkbox.create({
					uncontrollable: true
				});

				onclick(() => {
					console.log(checkbox.checked)
					checkbox.setValue(!checkbox.checked);
				});

				return checkbox;
			}
		})
	)
	.append(
		SettingsRow.create({
			title: "Slider test stand",
			subtitle: "This is slider",
			action: Slider.create({

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
				]
			}),			
			isRipple: false
		})
	)