import React, { Fragment } from 'react';
import {
    ListItem,
    ListItemText,
    Divider,
    ListItemAvatar,
    Avatar,
    Box,
    Link, List, AppBar, Toolbar, IconButton, Typography,
} from '@material-ui/core';
import {
    SettingsRounded as SettingsIcon,
    CollectionsRounded as BackgroundsIcon,
    CollectionsBookmarkRounded as BookmarksIcon,
    HelpRounded as AboutIcon,
    BackupRounded as SyncIcon,
    WidgetsRounded as WidgetsIcon,
    DeveloperBoardRounded as DevToolsIcon, ArrowBackRounded as BackIcon,
} from '@material-ui/icons';
import { VolunteerActivismRounded as ShareIcon } from '@/icons';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import MenuInfo from '@/ui/Menu/MenuInfo';
import appVariables from '@/config/appVariables';
import Header from '@/ui/Menu/PageHeader';
import clsx from 'clsx';
import { alpha } from '@material-ui/core/styles/colorManipulator';
import backgroundsPage from './Backgrounds';
import aboutPage from './About';
import appSettingsPage from './AppSettings';
import bookmarksPage from './Bookmarks';
import syncPage from './Sync';
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
        flexGrow: 1,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    bannerLinks: {
        marginTop: theme.spacing(1),
        display: 'grid',
    },
    root: { },
    toolbar: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    },
    backButton: {
        padding: theme.spacing(1),
        marginRight: theme.spacing(2),
        color: theme.palette.getContrastText(theme.palette.background.paper),
    },
    title: {
        fontSize: '22px',
        fontWeight: 800,
        flexShrink: 0,
    },
    actions: {
        marginLeft: theme.spacing(4),
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        display: 'flex',
        flexDirection: 'row',
    },
    grow: { flexGrow: 1 },
    menuList: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: `calc(100vh - ${theme.spacing(4)}px)`,
        // boxShadow: theme.shadows[20],
        pointerEvents: 'auto',
        flexShrink: 0,
        position: 'sticky',
        top: theme.spacing(2),
    },
    iconContainer: {
        alignSelf: 'flex-start',
        marginTop: 3,
        marginBottom: 3,
    },
    icon: {
        width: 30,
        height: 30,
        marginLeft: 5,
        '& svg': { fontSize: '1.2rem' },
    },
    text: {
        marginTop: 0,
        marginBottom: 0,
    },
    betaBanner: {
        margin: theme.spacing(1),
        width: 'auto',
        borderRadius: theme.shape.borderRadius,
        padding: theme.spacing(1),
    },
}));

const general = [
    {
        icon: <BackgroundsIcon />,
        page: backgroundsPage,
        color: '#2675F0',
    },
    BUILD === 'full' && {
        icon: <BookmarksIcon />,
        page: bookmarksPage,
        color: '#ff4f88',
    },
    {
        icon: <WidgetsIcon />,
        page: widgetsPage,
        color: '#596dff',
    },
    {
        icon: <SettingsIcon />,
        page: appSettingsPage,
        color: '#F88317',
    },
    {
        icon: <SyncIcon />,
        page: syncPage,
        color: '#0f9d58',
    },
    !PRODUCTION_MODE && {
        icon: <DevToolsIcon />,
        page: devTools,
        color: '#49C5B6',
    },
].filter((isAvailable) => isAvailable);
const additional = [
    {
        icon: <AboutIcon />,
        page: aboutPage,
        color: '#9C27B0',
    },
];

function Row(props) {
    const {
        color,
        icon: Icon,
        page,
        selected,
        onSelect,
    } = props;
    const { t } = useTranslation(['settings']);
    const classes = useStyles();

    return (
        <ListItem
            button
            onClick={() => onSelect(page)}
            disabled={!page}
            selected={selected}
        >
            <ListItemAvatar className={classes.iconContainer}>
                <Avatar
                    className={classes.icon}
                    style={{ backgroundColor: color }}
                >
                    {Icon}
                </Avatar>
            </ListItemAvatar>
            <ListItemText className={classes.text} primary={t(page.id)} secondary={t(page.id, { context: 'description' })} />
        </ListItem>
    );
}

function GeneralMenu({ selected, onSelect }) {
    const { t } = useTranslation(['settings']);
    const classes = useStyles();

    return (
        <React.Fragment>
            {general.map((row) => (
                <Row
                    key={row.page.id}
                    selected={row.page.id === selected?.id}
                    onSelect={onSelect}
                    {...row}
                />
            ))}
            <Divider variant="middle" className={classes.divider} />
            {additional.map((row) => (
                <Row
                    key={row.page.id}
                    selected={row.page.id === selected?.id}
                    onSelect={onSelect}
                    {...row}
                />
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
                    classes={{ root: classes.betaBanner }}
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

function PageHeader({ onBack }) {
    const classes = useStyles();
    const { t } = useTranslation(['settings']);

    return (
        <AppBar
            position="sticky"
            color="transparent"
            elevation={0}
            className={classes.root}
        >
            <Toolbar className={classes.toolbar}>
                <IconButton
                    data-ui-path="settings.back"
                    className={classes.backButton}
                    onClick={() => onBack()}
                >
                    <BackIcon />
                </IconButton>
                <Typography className={classes.title} variant="h6" noWrap>{t('title')}</Typography>
            </Toolbar>
        </AppBar>
    );
}

function MenuList({ selected, onClose, onSelect }) {
    const classes = useStyles();

    console.log('selected:', selected);

    return (
        <List
            disablePadding
            className={classes.menuList}
            style={{ width: 300 }}
        >
            <PageHeader onBack={onClose} />
            <GeneralMenu
                selected={selected}
                onSelect={onSelect}
            />
        </List>
    );
}

export default MenuList;
