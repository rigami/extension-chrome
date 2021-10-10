import React from 'react';
import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import { THEME } from '@/enum';
import useAppService from '@/stores/app/AppStateProvider';
import { observer } from 'mobx-react-lite';
import tabNamePage from './TabName';
import greetingPage from './Greeting';

const useStyles = makeStyles((theme) => ({
    defaultTabValue: {
        fontStyle: 'italic',
        color: theme.palette.text.secondary,
    },
}));

const headerProps = { title: 'settings:app' };

function AppSettings({ onSelect }) {
    const classes = useStyles();
    const { t } = useTranslation(['settingsApp']);
    const appService = useAppService();

    return (
        <React.Fragment>
            <MenuRow
                title={t('darkThemeBackdrop')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    width: 72,
                    checked: appService.settings.backdropTheme === THEME.DARK,
                    color: 'primary',
                    onChange: (event, value) => {
                        appService.settings.update({ backdropTheme: value ? THEME.DARK : THEME.LIGHT });
                    },
                }}
            />
            <MenuRow
                title={t('darkThemeApp')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    width: 72,
                    checked: appService.settings.theme === THEME.DARK,
                    color: 'primary',
                    onChange: (event, value) => appService.settings.update({ theme: value ? THEME.DARK : THEME.LIGHT }),
                }}
            />
            <MenuRow
                title={t('tabName.title')}
                action={{
                    type: ROWS_TYPE.LINK,
                    onClick: () => onSelect(tabNamePage),
                    component: (
                        <Typography className={(!appService.settings.tabName && classes.defaultTabValue) || ''}>
                            {appService.settings.tabName || 'Rigami'}
                        </Typography>
                    ),
                }}
            />
            {BUILD === 'full' && (
                <MenuRow
                    title={t('greeting.title')}
                    action={{
                        type: ROWS_TYPE.LINK,
                        onClick: () => onSelect(greetingPage),
                    }}
                />
            )}
        </React.Fragment>
    );
}

const ObserverAppSettings = observer(AppSettings);

export { headerProps as header, ObserverAppSettings as content };

export default {
    id: 'app',
    header: headerProps,
    content: ObserverAppSettings,
};
