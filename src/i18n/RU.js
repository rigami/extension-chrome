import { THEME, BG_CHANGE_INTERVAL, BG_TYPE, BG_SELECT_MODE } from "dict";

export default {
    /*Settings*/
    settings: {
        title: "Настройки",
        backgrounds: {
            title: "Фон и настройка переключения",
            description: "Загрузите фоны или выберите из каталога и установите время и условия для переключения фонов",
            general: {
                title: "Фоны",
                library: {
                    title: "Ваша библиотека",
                    description: (count_bg) => `У вас сейчас ${count_bg} фонов`,
                },
                dimming_power: {
                    title: "Сила затемнения фона",
                    description: "Выберете силу затемнения фона",
                },
            },
            scheduler: {
                title: "Планировщик перключения",
                selection_method: {
                    title: "Метод выбора фона",
                    description: "Выберете один из методов по приниципу которого будет выбираться фон",
                    [BG_SELECT_MODE.SPECIFIC]: "Специальный",
                    [BG_SELECT_MODE.RANDOM]: "Случайны",
                },
                change_interval: {
                    title: "Интервал изменения фона",
                    description: "Выберете интервал изменения фона",
                    [BG_CHANGE_INTERVAL.OPEN_TAB]: "При каждом открытии вкладки",
                    [BG_CHANGE_INTERVAL.MINUTES_30]: "Каждые 30 минут",
                    [BG_CHANGE_INTERVAL.HOURS_1]: "Каждый час",
                    [BG_CHANGE_INTERVAL.HOURS_6]: "Каждые 6 часов",
                    [BG_CHANGE_INTERVAL.HOURS_12]: "Каждые 12 часов",
                    [BG_CHANGE_INTERVAL.DAY_1]: "Каждый день",
                },
                bg_type: {
                    title: "Тип фона",
                    description: "Выберете тип фона",
                    [BG_TYPE.FILL_COLOR]: "Сплошной цвет",
                    [BG_TYPE.VIDEO]: "Видео",
                    [BG_TYPE.ANIMATION]: "Анимация",
                    [BG_TYPE.IMAGE]: "Изображение",
                },
            },
        },
        bookmarks: {
            title: "Закладки и меню быстрого доступа",
            description: "Загрузите фоны или выберите из каталога и установите время и условия для переключения фонов",
        },
        app: {
            title: "Настройки окружения",
            description: "Загрузите фоны или выберите из каталога и установите время и условия для переключения фонов",
        },
        about: {
            title: "О проекте",
            description: "Загрузите фоны или выберите из каталога и установите время и условия для переключения фонов",
        },
    },
};