import UI from "../../core/UI.js";
import Slider from "../base/Slider.js";
import Dropdown from "../base/Dropdown.js";
import Checkbox from "../base/Checkbox.js";
import Divider from "../base/Divider.js";
import SettingsRow from "./SettingsRow.js";
import { useClasses } from "../../themes/style.js";
import { getSafeValue as locale} from "../../utils/Locale.js";
import {
	ArrowRight as ArrowRightIcon
} from "../../core/Icons.js";
import { Store, observer } from "../../utils/Store.js";
import Hidden from "../base/Hidden.js";

function BackgroundSheduler(){
	let container = UI.create();

	SettingsRow({
		title: locale("background_selection_method"),
		subtitle: locale("background_selection_method_description"),
		action: Dropdown.create({
			onchange: (value, item, dropdown) => {

			},
			defaultValue: "random",
			list: [
				"random",
				"constant"
			].map(key => ({value: key, label: locale(key)}))
		}),			
		isRipple: false
	}).render.insert(container);

	SettingsRow({
		title: locale("change_background_period"),
		subtitle: locale("change_background_period_description"),
		action: Dropdown.create({
			onchange: (value, item, dropdown) => {

			},
			defaultValue: "every_open",
			list: [
				"every_open",
				"every_1_hour",
				"every_6_hours",
				"every_12_hours"
			].map(key => ({value: key, label: locale(key)}))
		}),			
		isRipple: false
	}).render.insert(container);

	SettingsRow({
		title: locale("background_types"),
		subtitle: locale("background_types_description"),
		action: Dropdown.create({
			onchange: (value, item, dropdown) => {

			},
			defaultValue: "images",
			list: [
				"images",
				"videos",
				"fill_color"
			].map(key => ({value: key, label: locale(key)}))
		}),			
		isRipple: false
	}).render.insert(container);

	return container;
}


function BackgroundSettings(){
	const classes = useClasses(theme => ({
		title: {
			fontSize: theme.typography.size.title1,
			fontWeight: "bold",
			padding: theme.spacing(4),
			paddingTop: theme.spacing(5.5),
			display: "block"
		},
		fisrtTitle: {
			paddingTop: `${theme.spacing(3)} !important`,
		}
	}));

	let page = UI.create();

	UI.create("span")
		.class(classes.title)
			.add(classes.fisrtTitle)
		.content(locale("backgrounds"))
		.insert(page);

	SettingsRow({
		title: locale("my_library"),
		subtitle: locale("you_count_backgrounds", 15),
		action: ArrowRightIcon({size: 22})
	}).render.insert(page);

	SettingsRow({
		title: locale("background_dimming_power"),
		subtitle: locale("background_dimming_power_description"),
		action: Slider.create({
			value: 0,
			onchange: () => {}
		}),
		isRipple: false
	}).render.insert(page);

	UI.create("span")
		.class(classes.title)
		.content(locale("switching_scheduler"))
		.insert(page);

	SettingsRow({
		title: locale("my_library"),
		subtitle: locale("you_count_backgrounds", 15),
		action: ArrowRightIcon({size: 22})
	}).render.insert(page);

	SettingsRow({
		title: locale("switch_background_mode"),
		subtitle: locale("switch_background_mode_description"),
		action: Dropdown.create({
			onchange: (value, item, dropdown) => {

			},
			defaultValue: "by_days",
			list: [
				{value: "by_days", label: locale("by_days")},
				{value: "everyday", label: locale("everyday")},
				{value: "constant", label: locale("constant")}
			]
		}),			
		isRipple: false
	}).render.insert(page);

	Divider().insert(page);

	//By days
	["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].forEach((day, index, { length }) => {
		let [isUsed, setIsUsed, isUsedListener] = new Store(false);


		SettingsRow({
			title: locale(day),
			action: (onclick) => {
				let checkbox = Checkbox.create({
					uncontrollable: true
				});

				onclick(() => {
					checkbox.setValue(!checkbox.checked);
					setIsUsed(!checkbox.checked);
				});

				return checkbox;
			}
		}).render.insert(page);

		//BackgroundSheduler().insert(page);
		observer({
			element: () => Hidden({
				children: [
					BackgroundSheduler,
					length !== index+1 && Divider
				],
				height: 0
			}),
			mutation: (sheduler, isUsed) => {
				if(isUsed) sheduler.hide();
				else sheduler.unhide();
			},
			listener: isUsedListener
		}).insert(page);
	});

	return page;
}

export default () => new BackgroundSettings();