import React, { useState } from 'react';
import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import { useObserver } from 'mobx-react-lite';
import { THEME } from '@/enum';
import { useService as useAppConfigService } from '@/stores/app';
import MenuInfo from '@/ui/Menu/MenuInfo';
import { content as TabNamePageContent, header as tabNamePageHeader } from './TabName';

const useStyles = makeStyles((theme) => ({
    defaultTabValue: {
        fontStyle: 'italic',
        color: theme.palette.text.secondary,
    },
}));

const headerProps = { title: "settings.app.title" };

function AppSettings({ onSelect }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const appConfigStore = useAppConfigService();
    const [, setForceUpdate] = useState(0);
    const [defaultFontValue] = useState(appConfigStore.useSystemFont);

    return useObserver(() => (
        <React.Fragment>
            <MenuRow
                title={t("settings.app.darkThemeBackdrop")}
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
                title={t("settings.app.darkThemeApp")}
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
                title={t("settings.app.useSystemFont")}
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
                message={t("changeTakeEffectAfterReload")}
                width={520}
            />
            <MenuRow
                title={t("settings.app.tabName.title")}
                width={520}
                action={{
                    type: ROWS_TYPE.LINK,
                    onClick: () => onSelect({
                        content: TabNamePageContent,
                        header: tabNamePageHeader,
                    }),
                    component: (
                        <Typography className={(!appConfigStore.tabName && classes.defaultTabValue) || ''}>
                            {appConfigStore.tabName || t("default")}
                        </Typography>
                    ),
                }}
            />
        </React.Fragment>
    ));
}

export { headerProps as header, AppSettings as content };
