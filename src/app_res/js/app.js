import { setLocale, getValue as LOC} from "./utils/Locale.js";
import lightTheme from "./themes/light.js";
import { setTheme } from "./themes/style.js";

import UI from "./core/UI.js";

import Home from "./pages/Home.js";

setLocale("RU");
setTheme(lightTheme);

UI.create(document.body)
	.append(Home())