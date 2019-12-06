import UI from "../../core/UI.js";
import SettingsRow from "./SettingsRow.js";


function AboutSettings(){
	let page = UI.create();

	SettingsRow({
		title: "Test settings row stand",
		subtitle: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis et elit lacus.
		 Phasellus vel malesuada erat. Sed eget sem lobortis, mollis dui et, dictum diam. Phasellus ut aliquam nisl.
		  Maecenas ultricies metus id ante tincidunt, non mollis augue imperdiet. Etiam convallis nisi ac lacus pulvinar sollicitudin. 
		  Mauris ut risus at turpis posuere volutpat eget eu nunc. Sed non viverra sem.`
	}).render.insert(page)

	return page;
}

export default () => new AboutSettings();