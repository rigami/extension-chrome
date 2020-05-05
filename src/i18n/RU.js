import {
	THEME, BG_CHANGE_INTERVAL, BG_TYPE, BG_SELECT_MODE, BKMS_FAP_STYLE, BKMS_FAP_POSITION,
} from '@/dict';
import { ERRORS as BG_UPLOAD_ERRORS } from '@/stores/backgrounds/service';
import appVariables from '@/config/appVariables';

export default {
	/* Settings */
	settings: {
		title: 'Настройки',
		backgrounds: {
			title: 'Фон и настройка переключения',
			description: 'Добавить новые фоны, настройть переключение и другие настойки рабочего стола',
			general: {
				title: 'Фоны',
				library: {
					title: 'Ваша библиотека',
					description: (countBG) => `У вас сейчас ${countBG} фонов`,
					[BG_TYPE.FILL_COLOR]: 'Сплошной цвет',
					[BG_TYPE.VIDEO]: 'Видео',
					[BG_TYPE.ANIMATION]: 'Анимация',
					[BG_TYPE.IMAGE]: 'Изображения',
					upload_from_computer: 'Загрузите фон с компьютера',
					upload_from_computer_confirm: 'Загрузка фонов',
					get_from_library: 'Получить из библиотеки',
					set_bg: 'Устновать фон',
					remove_bg: 'Удаить фон',
					[BG_UPLOAD_ERRORS.NO_FILES]: { message: 'Нет файлов для загрузки' },
					[BG_UPLOAD_ERRORS.TOO_MANY_FILES]: {
						message: 'Слишком много файлов для одновременной загрузки',
						description: `Максимальное количество файлов для одновременной загрузки: ${appVariables.maxUploadFiles}`,
					},
					upload_form: {
						anti_aliasing: {
							tooltip: 'Если вы добавляйте пиксель арт, то выключите этот параметр, что бы фон не размывался',
							label: 'Сглаживание',
						},
						add_to_library: 'Добавить в библиотеку',
						drop_to_add_bg: 'Отпустите, чтобы добавить новый фон',
						drop_to_add_bgs: 'Отпустите, чтобы добавить новые фоны',
					},
				},
				dimming_power: {
					title: 'Сила затемнения фона',
					description: 'Выберете силу затемнения фона',
				},
			},
			scheduler: {
				title: 'Планировщик перключения',
				selection_method: {
					title: 'Метод выбора фона',
					description: 'Выберете один из методов по приниципу которого будет выбираться фон',
					[BG_SELECT_MODE.SPECIFIC]: 'Оперделеный',
					[BG_SELECT_MODE.RANDOM]: 'Случайный',
				},
				change_interval: {
					title: 'Интервал изменения фона',
					description: 'Выберете интервал изменения фона',
					[BG_CHANGE_INTERVAL.OPEN_TAB]: 'При каждом открытии вкладки',
					[BG_CHANGE_INTERVAL.MINUTES_30]: 'Каждые 30 минут',
					[BG_CHANGE_INTERVAL.HOURS_1]: 'Каждый час',
					[BG_CHANGE_INTERVAL.HOURS_6]: 'Каждые 6 часов',
					[BG_CHANGE_INTERVAL.HOURS_12]: 'Каждые 12 часов',
					[BG_CHANGE_INTERVAL.DAY_1]: 'Каждый день',
				},
				bg_type: {
					title: 'Тип фона',
					description: 'Выберете тип фона',
					[BG_TYPE.FILL_COLOR]: 'Сплошной цвет',
					[BG_TYPE.VIDEO]: 'Видео',
					[BG_TYPE.ANIMATION]: 'Анимация',
					[BG_TYPE.IMAGE]: 'Изображение',
				},
			},
			desktop: {
				error_load_bg_unknown_reason: 'Ну удается отобразить фон по неизвестной причине',
				not_found_bg: 'Нет фона для отрисовки',
			},
		},
		bookmarks: {
			title: 'Закладки и меню быстрого доступа',
			description: 'Добавить новые фоны, настройть переключение и другие настойки рабочего стола',
			use_fap: 'Использовать панель быстрого доступа',
			fap_style: {
				title: 'Вариант панели быстрого доступа',
				[BKMS_FAP_STYLE.HIDDEN]: 'Отключен',
				[BKMS_FAP_STYLE.TRANSPARENT]: 'Без подложки',
				[BKMS_FAP_STYLE.CONTAINED]: 'С подложкой',
			},
			fap_position: {
				title: 'Позиционирование панели',
				[BKMS_FAP_POSITION.TOP]: 'Сверху',
				[BKMS_FAP_POSITION.RIGHT]: 'Справа',
				[BKMS_FAP_POSITION.BOTTOM]: 'Снизу',
				[BKMS_FAP_POSITION.LEFT]: 'Слева',
			},
			open_on_startup: 'Открытие при запуске',
		},
		app: {
			title: 'Настройки окружения',
			description: 'Тема приложения, название вкладки',
			theme: {
				[THEME.LIGHT]: 'Светлая',
				[THEME.DARK]: 'Тёмная',
				system: 'В зависимости от системы',
			},
			tab_name: 'Название вкладки',
		},
		backup: {
			title: 'Бекап и синхронизация',
			description: 'Сохраните свои данные и настройте синхронизация между устройствами',
		},
		about: {
			title: 'О проекте',
			description: 'Написать отзыв, сообщить о багах или связаться с разработчиком',
			home_page: 'Домашняя страница проекта',
			review: {
				title: 'Написать отзыв о проекте',
				description: 'Расскажите о своих впечетлениях',
			},
			bug_report: {
				title: 'Сообщить о багах в проекте',
				description: 'Если вы встретили какой то баг, сообщите мне, и я обязательно его поправлю',
			},
			contact: {
				title: 'Написать разработчику на прямую',
				description: 'Напишите мне на почту, если хотите что то сообщить лично',
			},
			policy: 'Политика конфиденциальности',
		},
	},
	/* Global values */
	global: {
		tab_name: {
			default: 'Новая вкладка',
			prepare: 'Подготовка',
		},
		all: 'Все',
		nothing_selected: 'Ничего не выбрано',
		cancel: 'Отмена',
		bg_type: {
			title: 'Тип фона',
			description: 'Выберете тип фона',
			[BG_TYPE.FILL_COLOR]: 'Сплошной цвет',
			[BG_TYPE.VIDEO]: 'Видео',
			[BG_TYPE.ANIMATION]: 'Анимация',
			[BG_TYPE.IMAGE]: 'Изображение',
		},
	},
};
