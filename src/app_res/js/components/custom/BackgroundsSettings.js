import UI from "../../core/UI.js";
import Slider from "../base/Slider.js";
import Dropdown from "../base/Dropdown.js";
import Checkbox from "../base/Checkbox.js";
import Divider from "../base/Divider.js";
import SettingsRow from "./SettingsRow.js";
import { useClasses } from "../../themes/style.js";
import { getSafeValue as locale} from "../../utils/Locale.js";


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
		action: () => {}
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
		action: () => {}
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

	["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].forEach(day => {
		Divider().insert(page);

		SettingsRow({
			title: locale(day),
			action: (onclick) => {
				let checkbox = Checkbox.create({
					uncontrollable: true
				});

				onclick(() => {
					checkbox.setValue(!checkbox.checked);
				});

				return checkbox;
			}
		}).render.insert(page);
	});

	return page;
}

export default () => new BackgroundSettings();