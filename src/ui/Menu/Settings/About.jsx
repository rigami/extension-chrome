import React from 'react';
import {
    Box,
    Divider,
    Typography,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    Link,
} from '@material-ui/core';
import {
    NavigateNextRounded as ArrowRightIcon,
    HomeRounded as HomeIcon,
    BugReportRounded as BugIcon,
    ChatBubbleRounded as ReviewIcon,
    EmailRounded as EmailIcon,
    PolicyRounded as PolicyIcon,
} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import LogoIcon from '@/images/logo-icon.svg';
import LogoText from '@/images/logo-text.svg';

const useStyles = makeStyles((theme) => ({
    splash: {
        width: 520,
        height: 250,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    appLogoIcon: {
        width: 64,
        height: 64,
        marginBottom: theme.spacing(1),
    },
    appLogoText: {
        marginBottom: theme.spacing(1),
        width: 100,
        height: 'auto',
        fill: theme.palette.type === 'dark' ? theme.palette.common.white : theme.palette.common.black,
    },
    appVersion: { color: theme.palette.text.secondary },
    row: { width: 520 },
}));

const headerProps = { title: 'settings.about.title' };

function About() {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <React.Fragment>
            <Box className={classes.splash}>
                <LogoIcon className={classes.appLogoIcon} />
                <LogoText className={classes.appLogoText} />
                <Typography className={classes.appVersion} variant="body2">
                    v
                    {chrome?.runtime?.getManifest?.().version || '-'}
                    {' '}
                    (BETA)
                </Typography>
            </Box>
            <Divider />
            <ListItem
                button
                className={classes.row}
                component={Link}
                href="https://rigami.io/"
                target="_blank"
                color="initial"
                underline="none"
            >
                <ListItemIcon>
                    <HomeIcon />
                </ListItemIcon>
                <ListItemText primary={t('settings.about.homePage')} />
                <ListItemSecondaryAction>
                    <ArrowRightIcon />
                </ListItemSecondaryAction>
            </ListItem>
            <ListItem
                button
                className={classes.row}
                component={Link}
                href="https://rigami.io/review?service=chrome-extension"
                target="_blank"
                color="initial"
                underline="none"
            >
                <ListItemIcon>
                    <ReviewIcon />
                </ListItemIcon>
                <ListItemText
                    primary={t('settings.about.review.title')}
                    secondary={t('settings.about.review.description')}
                />
                <ListItemSecondaryAction>
                    <ArrowRightIcon />
                </ListItemSecondaryAction>
            </ListItem>
            <ListItem
                button
                className={classes.row}
                component={Link}
                href="https://rigami.io/bug-report?service=chrome-extension"
                target="_blank"
                color="initial"
                underline="none"
            >
                <ListItemIcon>
                    <BugIcon />
                </ListItemIcon>
                <ListItemText
                    primary={t('settings.about.bugReport.title')}
                    secondary={t('settings.about.bugReport.description')}
                />
                <ListItemSecondaryAction>
                    <ArrowRightIcon />
                </ListItemSecondaryAction>
            </ListItem>
            <ListItem
                button
                className={classes.row}
                disabled
            >
                <ListItemIcon>
                    <EmailIcon />
                </ListItemIcon>
                <ListItemText
                    primary={t('settings.about.contact.title')}
                    secondary={t('settings.about.contact.description')}
                />
                <ListItemSecondaryAction>
                    <ArrowRightIcon />
                </ListItemSecondaryAction>
            </ListItem>
            <ListItem
                button
                className={classes.row}
                component={Link}
                href="https://github.com/rigami/readme/blob/main/POLICY.md"
                target="_blank"
                color="initial"
                underline="none"
            >
                <ListItemIcon>
                    <PolicyIcon />
                </ListItemIcon>
                <ListItemText
                    primary={t('settings.about.policy')}
                />
                <ListItemSecondaryAction>
                    <ArrowRightIcon />
                </ListItemSecondaryAction>
            </ListItem>
            <ListItem className={classes.row}>
                <ListItemIcon />
                <ListItemText secondary="Danilkinkin | 2020" />
            </ListItem>
        </React.Fragment>
    );
}

export { headerProps as header, About as content };
