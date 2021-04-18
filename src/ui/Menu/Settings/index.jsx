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
import { VolunteerActivismRounded as ShareIcon } from '@/icons';
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
        display: 'flex',
        flexDirection: 'column',
        marginTop: 'auto',
        borderBottomLeftRadius: theme.shape.borderRadius,
        borderBottomRightRadius: theme.shape.borderRadius,
        overflow: 'hidden',
    },
    bannerLinks: {
        marginTop: theme.spacing(1),
        display: 'grid',
    },
}));

const general = [
    {
        icon: <BackgroundsIcon />,
        id: 'backgrounds',
        page: backgroundsPage,
        color: '#2675F0',
    },
    {
        icon: <BookmarksIcon />,
        id: 'bookmarks',
        page: bookmarksPage,
        color: '#ff4f88',
    },
    {
        icon: <WidgetsIcon />,
        id: 'widgets',
        page: widgetsPage,
        color: '#596dff',
    },
    {
        icon: <SettingsIcon />,
        id: 'app',
        page: appSettingsPage,
        color: '#F88317',
    },
    {
        icon: <BackupIcon />,
        id: 'backup',
        page: backupPage,
        color: '#0f9d58',
    },
    !PRODUCTION_MODE && {
        icon: <DevToolsIcon />,
        id: 'devTools',
        page: devTools,
        color: '#49C5B6',
    },
].filter((isAvailable) => isAvailable);
const additional = [
    {
        icon: <AboutIcon />,
        id: 'about',
        page: aboutPage,
        color: '#9C27B0',
    },
];

const headerProps = { title: 'title' };

function Row(props) {
    const {
        id,
        color,
        icon: Icon,
        page,
        onSelect,
    } = props;
    const { t } = useTranslation(['settings']);

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
            <ListItemText primary={t(id)} secondary={t(id, { context: 'description' })} />
        </ListItem>
    );
}

function GeneralMenu({ onSelect }) {
    const { t } = useTranslation(['settings']);
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
                    show
                    variant="default"
                    icon={ShareIcon}
                    message={t('shareBanner.message')}
                    description={(
                        <Fragment>
                            {t('shareBanner.description')}
                            <span className={classes.bannerLinks}>
                                <Link
                                    color="inherit"
                                    underline="always"
                                    href="https://rigami.io/help-for-the-project"
                                >
                                    {t('shareBanner.button.openPage')}
                                </Link>
                                <Link
                                    color="inherit"
                                    underline="always"
                                    target="_blank"
                                    href={`https://chrome.google.com/webstore/detail/${appVariables.extensionId}`}
                                >
                                    {t('shareBanner.button.rateExtension')}
                                </Link>
                            </span>
                        </Fragment>
                    )}
                />
                <MenuInfo
                    show
                    variant="warn"
                    message={t('betaBanner.message')}
                    description={(
                        <span className={classes.bannerLinks}>
                            <Link
                                color="inherit"
                                underline="always"
                                href="mailto:danilkinkin@gmail.com"
                            >
                                {t('betaBanner.button.sendEmail')}
                            </Link>
                            <Link
                                color="inherit"
                                underline="always"
                                target="_blank"
                                href="https://github.com/rigami/readme/issues"
                            >
                                {t('betaBanner.button.openIssue')}
                            </Link>
                        </span>
                    )}
                />
            </Box>
        </React.Fragment>
    );
}

export default GeneralMenu;
export { headerProps as header };
