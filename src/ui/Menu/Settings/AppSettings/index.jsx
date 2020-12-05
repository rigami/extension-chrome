import React, { useState } from 'react';
import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import { THEME } from '@/enum';
import useAppService from '@/stores/AppStateProvider';
import MenuInfo from '@/ui/Menu/MenuInfo';
import { content as TabNamePageContent, header as tabNamePageHeader } from './TabName';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
    defaultTabValue: {
        fontStyle: 'italic',
        color: theme.palette.text.secondary,
    },
}));

const headerProps = { title: 'settings.app.title' };

function AppSettings({ onSelect }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const appService = useAppService();
    const [defaultFontValue] = useState(appService.settings.useSystemFont);

    return (
        <React.Fragment>
            <MenuRow
                title={t('settings.app.darkThemeBackdrop')}
                width={520}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    width: 72,
                    checked: appService.settings.backdropTheme === THEME.DARK,
                    color: 'primary',
                    onChange: (event, value) => {
                        appService.settings.update({ backdropTheme: value ? THEME.DARK : THEME.LIGHT })
                    },
                }}
            />
            <MenuRow
                title={t('settings.app.darkThemeApp')}
                width={520}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    width: 72,
                    checked: appService.settings.theme === THEME.DARK,
                    color: 'primary',
                    onChange: (event, value) => appService.settings.update({ theme: value ? THEME.DARK : THEME.LIGHT }),
                }}
            />
            <MenuRow
                title={t('settings.app.useSystemFont')}
                width={520}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    width: 72,
                    checked: appService.settings.useSystemFont,
                    color: 'primary',
                    onChange: (event, value) => appService.settings.update({ useSystemFont: value }),
                }}
            />
            <MenuInfo
                show={defaultFontValue !== appService.settings.useSystemFont}
                message={t('changeTakeEffectAfterReload')}
                width={520}
            />
            <MenuRow
                title={t('settings.app.tabName.title')}
                width={520}
                action={{
                    type: ROWS_TYPE.LINK,
                    onClick: () => onSelect({
                        content: TabNamePageContent,
                        header: tabNamePageHeader,
                    }),
                    component: (
                        <Typography className={(!appService.settings.tabName && classes.defaultTabValue) || ''}>
                            {appService.settings.tabName || t('default')}
                        </Typography>
                    ),
                }}
            />
        </React.Fragment>
    );
}

const ObserverAppSettings = observer(AppSettings);

export { headerProps as header, AppSettings as content };
