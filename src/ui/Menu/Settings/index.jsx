import React, { Fragment } from 'react';
import {
    ListItem,
    ListItemText,
    Divider,
    ListItemAvatar,
    Avatar,
    Box,
    Link,
} from '@material-ui/core';
import {
    SettingsRounded as SettingsIcon,
    CollectionsRounded as BackgroundsIcon,
    CollectionsBookmarkRounded as BookmarksIcon,
    HelpRounded as AboutIcon,
    BackupRounded as BackupIcon,
    WidgetsRounded as WidgetsIcon,
    DeveloperBoardRounded as DevToolsIcon,
} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import MenuInfo from '@/ui/Menu/MenuInfo';
import appVariables from '@/config/appVariables';
import backgroundsPage from './Backgrounds';
import aboutPage from './About';
import appSettingsPage from './AppSettings';
import bookmarksPage from './Bookmarks';
import backupPage from './Backup';
import widgetsPage from './Widgets';
import devTools from './DevTools';

const useStyles = makeStyles((theme) => ({
    divider: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    bannerWrapper: {
        height: '100%',
        display: 'contents',
    },
    betaBanner: { marginTop: 'auto' },
    betaBannerCard: {
        borderBottomLeftRadius: theme.shape.borderRadius,
        borderBottomRightRadius: theme.shape.borderRadius,
    },
    betaBannerLinks: {
        marginTop: theme.spacing(1),
        display: 'grid',
    },
}));

const general = [
    {
        title: 'settings.bg.title',
        description: 'settings.bg.description',
        icon: <BackgroundsIcon />,
        id: 'backgrounds',
        page: backgroundsPage,
        color: '#2675F0',
    },
    {
        title: 'settings.bookmarks.title',
        description: 'settings.bookmarks.description',
        icon: <BookmarksIcon />,
        id: 'bookmarks',
        page: bookmarksPage,
        color: '#ff4f88',
    },
    {
        title: 'settings.widgets.title',
        description: 'settings.widgets.description',
        icon: <WidgetsIcon />,
        id: 'widgets',
        page: widgetsPage,
        color: '#596dff',
    },
    {
        title: 'settings.app.title',
        description: 'settings.app.description',
        icon: <SettingsIcon />,
        id: 'app',
        page: appSettingsPage,
        color: '#F88317',
    },
    {
        title: 'settings.backup.title',
        description: 'settings.backup.description',
        icon: <BackupIcon />,
        id: 'backup',
        page: backupPage,
        color: '#0f9d58',
    },
    !PRODUCTION_MODE && {
        title: 'DevTools',
        icon: <DevToolsIcon />,
        id: 'devTools',
        page: devTools,
        color: '#49C5B6',
    },
];
const additional = [
    {
        title: 'settings.about.title',
        description: 'settings.about.description',
        icon: <AboutIcon />,
        id: 'about',
        page: aboutPage,
        color: '#9C27B0',
    },
];

const headerProps = { title: 'settings.title' };

function Row(props) {
    const {
        title,
        color,
        description,
        icon: Icon,
        page,
        onSelect,
    } = props;
    const { t } = useTranslation();

    return (
        <ListItem
            button
            onClick={() => onSelect(page)}
            disabled={!page}
        >
            <ListItemAvatar>
                <Avatar style={{ backgroundColor: color }}>
                    {Icon}
                </Avatar>
            </ListItemAvatar>
            <ListItemText primary={t(title)} secondary={t(description)} />
        </ListItem>
    );
}

function GeneralMenu({ onSelect }) {
    const { t } = useTranslation();
    const classes = useStyles();

    return (
        <React.Fragment>
            {general.map((row) => (
                <Row key={row.id} onSelect={onSelect} {...row} />
            ))}
            <Divider variant="middle" className={classes.divider} />
            {additional.map((row) => (
                <Row key={row.id} onSelect={onSelect} {...row} />
            ))}
            <Box className={classes.bannerWrapper}>
                <MenuInfo
                    classes={{
                        wrapper: classes.betaBanner,
                        root: classes.betaBannerCard,
                    }}
                    show
                    message={t('settings.betaBanner.title')}
                    description={(
                        <Fragment>
                            {t('settings.betaBanner.description')}
                            <span className={classes.betaBannerLinks}>
                                <Link
                                    color="inherit"
                                    underline="always"
                                    href="mailto:danilkinkin@gmail.com"
                                >
                                    {t('settings.betaBanner.sendEmail')}
                                </Link>
                                <Link
                                    color="inherit"
                                    underline="always"
                                    target="_blank"
                                    href="https://github.com/rigami/readme/issues"
                                >
                                    {t('settings.betaBanner.openIssue')}
                                </Link>
                                <Link
                                    color="inherit"
                                    underline="always"
                                    target="_blank"
                                    href={`https://chrome.google.com/webstore/detail/${appVariables.extensionId}`}
                                >
                                    {t('settings.betaBanner.rateExtension')}
                                </Link>
                            </span>
                        </Fragment>
                    )}
                />
            </Box>
        </React.Fragment>
    );
}

export default GeneralMenu;
export { headerProps as header };
