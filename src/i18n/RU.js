import { THEME, BG_CHANGE_INTERVAL, BG_TYPE, BG_SELECT_MODE } from "dict";
import { ERRORS as BG_UPLOAD_ERRORS } from "stores/backgrounds";
import appVariables from "config/appVariables";

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
                    [BG_TYPE.FILL_COLOR]: "Сплошной цвет",
                    [BG_TYPE.VIDEO]: "Видео",
                    [BG_TYPE.ANIMATION]: "Анимация",
                    [BG_TYPE.IMAGE]: "Изображения",
                    upload_from_computer: "Загрузите фон с компьютера",
                    upload_from_computer_confirm: "Загрузка фонов",
                    get_from_library: "Получить из библиотеки",
                    set_bg: "Устновать фон",
                    remove_bg: "Удаить фон",
                    [BG_UPLOAD_ERRORS.NO_FILES]: {
                        message: "Нет файлов для загрузки",
                    },
                    [BG_UPLOAD_ERRORS.TOO_MANY_FILES]: {
                        message: "Слишком много файлов для одновременной загрузки",
                        description: `Максимальное количество файлов для одновременной загрузки: ${appVariables.maxUploadFiles}`,
                    },
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
                    [BG_SELECT_MODE.SPECIFIC]: "Оперделеный",
                    [BG_SELECT_MODE.RANDOM]: "Случайный",
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
        backup: {
            title: "Бекап и синхронизация",
            description: "Сохраните свои данные и настройте синхронизация между устройствами",
        },
        about: {
            title: "О проекте",
            description: "Загрузите фоны или выберите из каталога и установите время и условия для переключения фонов",
        },
    },
    /*Global values*/
    global: {
        all: "Все",
        nothing_selected: "Ничего не выбрано",
        cancel: "Отмена",
        bg_type: {
            title: "Тип фона",
            description: "Выберете тип фона",
            [BG_TYPE.FILL_COLOR]: "Сплошной цвет",
            [BG_TYPE.VIDEO]: "Видео",
            [BG_TYPE.ANIMATION]: "Анимация",
            [BG_TYPE.IMAGE]: "Изображение",
        },
    }
};