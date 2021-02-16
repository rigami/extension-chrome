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
    StarRounded as StarIcon,
} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import LogoIcon from '@/images/logo-icon.svg';
import LogoText from '@/images/logo-text.svg';

const useStyles = makeStyles((theme) => ({
    splash: {
        width: '100%',
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
}));

const headerProps = { title: 'settings.about.title' };

function Row({ href, primary, secondary, icon }) {
    const Icon = icon;

    return (
        <ListItem
            button
            component={Link}
            href={href}
            target="_blank"
            color="initial"
            underline="none"
        >
            <ListItemIcon>
                <Icon />
            </ListItemIcon>
            <ListItemText primary={primary} secondary={secondary} />
            <ListItemSecondaryAction>
                <ArrowRightIcon />
            </ListItemSecondaryAction>
        </ListItem>
    );
}

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
            <Row
                href="https://rigami.io/"
                icon={HomeIcon}
                primary={t('settings.about.homePage')}
            />
            <Row
                href="https://rigami.io/review?service=chrome-extension"
                icon={ReviewIcon}
                primary={t('settings.about.review.title')}
                secondary={t('settings.about.review.description')}
            />
            <Row
                href="https://rigami.io/bug-report?service=chrome-extension"
                icon={BugIcon}
                primary={t('settings.about.bugReport.title')}
                secondary={t('settings.about.bugReport.description')}
            />
            <Row
                href="mailto:danilkinkin@gmail.com"
                icon={EmailIcon}
                primary={t('settings.about.contact.title')}
                secondary={t('settings.about.contact.description')}
            />
            <Row
                href="https://github.com/rigami/readme/blob/main/POLICY.md"
                icon={PolicyIcon}
                primary={t('settings.about.policy')}
            />
            <Row
                href="https://chrome.google.com/webstore/detail/rigami-new-tab/hdpjmahlkfndaejogipnepcgdmjiamhd"
                icon={StarIcon}
                primary={t('settings.about.rate')}
            />
            <ListItem className={classes.row}>
                <ListItemIcon />
                <ListItemText secondary="Danilkinkin | 2020-2021" />
            </ListItem>
        </React.Fragment>
    );
}

export { headerProps as header, About as content };

export default {
    header: headerProps,
    content: About,
};
