import React from 'react';
import { Typography } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import { ACTIVITY, THEME } from '@/enum';
import useAppService from '@/stores/app/AppStateProvider';
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
    const appService = useAppService();

    return (
        <React.Fragment>
            <SectionHeader title={t('behavior')} />
            <MenuRow
                title={t('openOnStartup.title')}
                description={t('openOnStartup.description')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    value: appService.settings.defaultActivity === ACTIVITY.BOOKMARKS,
                    onChange: (event, value) => appService.settings
                        .update({ defaultActivity: value ? ACTIVITY.BOOKMARKS : ACTIVITY.DESKTOP }),
                }}
            />
            <SectionHeader title={t('appearance')} />
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
                            {appService.settings.tabName || 'rigami'}
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
