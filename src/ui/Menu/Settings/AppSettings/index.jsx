import React, { useState } from 'react';
import { Typography } from '@material-ui/core';
import locale from '@/i18n/RU';
import { makeStyles } from '@material-ui/core/styles';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import { useObserver } from 'mobx-react-lite';
import { THEME } from '@/dict';
import { useService as useAppConfigService } from '@/stores/app';
import MenuInfo from '@/ui/Menu/MenuInfo';
import { content as TabNamePageContent, header as tabNamePageHeader } from './TabName';

const useStyles = makeStyles((theme) => ({
    defaultTabValue: {
        fontStyle: 'italic',
        color: theme.palette.text.secondary,
    },
}));

const headerProps = { title: locale.settings.app.title };

function AppSettings({ onSelect }) {
    const classes = useStyles();
    const appConfigStore = useAppConfigService();
    const [, setForceUpdate] = useState(0);
    const [defaultFontValue] = useState(appConfigStore.useSystemFont);

    return useObserver(() => (
        <React.Fragment>
            <MenuRow
                title="Тёмная тема подложки"
                width={520}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    width: 72,
                    checked: appConfigStore.backdropTheme === THEME.DARK,
                    color: 'primary',
                    onChange: (event, value) => appConfigStore.setBackdropTheme(value ? THEME.DARK : THEME.LIGHT),
                }}
            />
            <MenuRow
                title="Тёмная тема оформления приложения"
                width={520}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    width: 72,
                    checked: appConfigStore.theme === THEME.DARK,
                    color: 'primary',
                    onChange: (event, value) => {
                        appConfigStore.setTheme(value ? THEME.DARK : THEME.LIGHT)
                            .then(() => setForceUpdate((old) => old + 1));
                    },
                }}
            />
            <MenuRow
                title="Использовать шрифты системы"
                width={520}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    width: 72,
                    checked: appConfigStore.useSystemFont,
                    color: 'primary',
                    onChange: (event, value) => appConfigStore.setUsedSystemFont(value),
                }}
            />
            <MenuInfo
                show={defaultFontValue !== appConfigStore.useSystemFont}
                message="Это изменение вступит в силу после перезагрузки стараницы"
                width={520}
            />
            <MenuRow
                title={locale.settings.app.tab_name}
                width={520}
                action={{
                    type: ROWS_TYPE.LINK,
                    onClick: () => onSelect({ content: TabNamePageContent, header: tabNamePageHeader }),
                    component: (
                        <Typography className={(!appConfigStore.tabName && classes.defaultTabValue) || ''}>
                            {appConfigStore.tabName || 'По умолчанию'}
                        </Typography>
                    ),
                }}
            />
        </React.Fragment>
    ));
}

export { headerProps as header, AppSettings as content };
