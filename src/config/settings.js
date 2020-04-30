import {
	THEME, BG_CHANGE_INTERVAL, BG_TYPE, BG_SELECT_MODE,
} from '@/dict';

export default {
	backgrounds: {
		change_interval: BG_CHANGE_INTERVAL.HOURS_1,
		bg_type: [BG_TYPE.IMAGE, BG_TYPE.VIDEO, BG_TYPE.ANIMATION, BG_TYPE.FILL_COLOR],
		selection_method: BG_SELECT_MODE.SPECIFIC,
		current_bg_link: 'default_bg',
		dimming_power: 25,
	},
	bookmarks: {},
	app: {
		backdropTheme: THEME.DARK,
		theme: THEME.LIGHT,
	},
};
