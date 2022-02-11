import React from 'react';
import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import { ACTIVITY, THEME } from '@/enum';
import { useAppStateService } from '@/stores/app/appState';
import tabNamePage from './TabName';
import greetingPage from './Greeting';
import SectionHeader from '@/ui/Menu/SectionHeader';

const useStyles = makeStyles((theme) => ({
    defaultTabValue: {
        fontStyle: 'italic',
        color: theme.palette.text.secondary,
    },
}));

const headerProps = { title: 'settings:common' };

function AppSettings({ onSelect }) {
    const classes = useStyles();
    const { t } = useTranslation(['settingsCommon']);
    const appStateService = useAppStateService();

    return (
        <React.Fragment>
            <SectionHeader title={t('behavior')} />
            <MenuRow
                title={t('openOnStartup.title')}
                description={t('openOnStartup.description')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    value: appStateService.settings.defaultActivity === ACTIVITY.BOOKMARKS,
                    onChange: (event, value) => appStateService.settings
                        .update({ defaultActivity: value ? ACTIVITY.BOOKMARKS : ACTIVITY.DESKTOP }),
                }}
            />
            <SectionHeader title={t('appearance')} />
            <MenuRow
                title={t('darkThemeBackdrop')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    width: 72,
                    checked: appStateService.settings.backdropTheme === THEME.DARK,
                    color: 'primary',
                    onChange: (event, value) => {
                        appStateService.settings.update({ backdropTheme: value ? THEME.DARK : THEME.LIGHT });
                    },
                }}
            />
            <MenuRow
                title={t('darkThemeApp')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    width: 72,
                    checked: appStateService.settings.theme === THEME.DARK,
                    color: 'primary',
                    onChange: (event, value) => appStateService.settings.update({ theme: value ? THEME.DARK : THEME.LIGHT }),
                }}
            />
            <MenuRow
                title={t('tabName.title')}
                action={{
                    type: ROWS_TYPE.LINK,
                    onClick: () => onSelect(tabNamePage),
                    component: (
                        <Typography className={(!appStateService.settings.tabName && classes.defaultTabValue) || ''}>
                            {appStateService.settings.tabName || 'rigami'}
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
    id: 'common',
    header: headerProps,
    content: ObserverAppSettings,
};
