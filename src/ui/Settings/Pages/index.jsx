import React, { Fragment } from 'react';
import {
    ListItem,
    ListItemText,
    Divider,
    ListItemAvatar,
    Box,
    Link,
    List,
    AppBar,
    Toolbar,
    Typography,
} from '@material-ui/core';
import {
    SettingsRounded as SettingsIcon,
    HelpRounded as AboutIcon,
    BackupRounded as SyncIcon,
    WidgetsRounded as WidgetsIcon,
    DeveloperBoardRounded as DevToolsIcon,
} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import {
    SelfImprovementRounded as QuietModeIcon,
    VolunteerActivismRounded as ShareIcon,
} from '@/icons';
import Banner from '@/ui-components/Banner';
import appVariables from '@/config/config';
import quietModePage from './QuietMode';
import aboutPage from './About';
import commonSettingsPage from './CommonSettings';
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
        marginTop: theme.spacing(0.8),
        display: 'grid',
        '& a': { marginTop: theme.spacing(0.8) },
    },
    root: { },
    toolbar: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
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
        marginLeft: theme.spacing(1),
        display: 'block',
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
    headerIcon: { alignSelf: 'center' },
}));

const general = [
    {
        icon: <QuietModeIcon />,
        page: quietModePage,
    },
    {
        icon: <WidgetsIcon />,
        page: widgetsPage,
    },
    {
        icon: <SettingsIcon />,
        page: commonSettingsPage,
    },
    {
        icon: <SyncIcon />,
        page: syncPage,
    },
    !PRODUCTION_MODE && {
        icon: <DevToolsIcon />,
        page: devTools,
    },
].filter((isAvailable) => isAvailable);
const additional = [
    {
        icon: <AboutIcon />,
        page: aboutPage,
    },
];

function Row(props) {
    const {
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
                {React.cloneElement(Icon, { className: classes.icon })}
            </ListItemAvatar>
            <ListItemText
                className={classes.text}
                primary={t(page.id)}
                secondary={t(page.id, { context: 'description' })}
            />
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
                <Banner
                    variant="default"
                    icon={ShareIcon}
                    message={t('shareBanner.message')}
                    description={(
                        <Fragment>
                            <span className={classes.bannerLinks}>
                                <Link
                                    color="inherit"
                                    underline="always"
                                    href="https://rigami.io/help-for-the-project"
                                >
                                    {t('shareBanner.button.openProjectSupportPage')}
                                </Link>
                                <Link
                                    color="inherit"
                                    underline="always"
                                    target="_blank"
                                    href={`https://chrome.google.com/webstore/detail/${appVariables.extensionId}`}
                                >
                                    {t('shareBanner.button.rateExtension')}
                                </Link>
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
                        </Fragment>
                    )}
                />
            </Box>
        </React.Fragment>
    );
}

function PageHeader() {
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
                <ListItemAvatar className={clsx(classes.iconContainer, classes.headerIcon)}>
                    <SettingsIcon className={classes.icon} />
                </ListItemAvatar>
                <Typography className={classes.title} variant="h6" noWrap>{t('title')}</Typography>
            </Toolbar>
        </AppBar>
    );
}

function MenuList({ selected, onSelect }) {
    const classes = useStyles();

    return (
        <List
            disablePadding
            className={classes.menuList}
            style={{ width: 280 }}
        >
            <PageHeader />
            <GeneralMenu
                selected={selected}
                onSelect={onSelect}
            />
        </List>
    );
}

export default MenuList;
