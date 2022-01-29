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
    Extension as ExtensionIcon,
} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import LogoIcon from '@/images/logo-icon.svg';
import LogoText from '@/images/logo-text.svg';
import appVariables from '@/config/appVariables';

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

const headerProps = { title: 'settings:about' };

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
    const { t } = useTranslation(['settingsAbout']);

    return (
        <React.Fragment>
            <Box className={classes.splash}>
                <LogoIcon className={classes.appLogoIcon} />
                <LogoText className={classes.appLogoText} />
                <Typography className={classes.appVersion} variant="body2">
                    {BUILD === 'full' && `v${chrome?.runtime.getManifest().version_name || '-'}`}
                    {BUILD === 'wallpapers' && `v${chrome?.runtime.getManifest().version_name || '-'} (${t('onlyWallpapers')})`}
                </Typography>
            </Box>
            <Divider />
            <Row
                href="https://rigami.io/"
                icon={HomeIcon}
                primary={t('homePage')}
            />
            {BUILD === 'wallpapers' && (
                <Row
                    href="https://chrome.google.com/webstore/detail/hdpjmahlkfndaejogipnepcgdmjiamhd"
                    icon={ExtensionIcon}
                    primary={t('fullVersion')}
                    secondary={t('fullVersion', { context: 'description' })}
                />
            )}
            <Row
                href="https://github.com/rigami/readme/blob/main/REVIEW.md"
                icon={ReviewIcon}
                primary={t('review')}
                secondary={t('review', { context: 'description' })}
            />
            <Row
                href="https://github.com/rigami/readme/blob/main/BUG_REPORT.md"
                icon={BugIcon}
                primary={t('bugReport')}
                secondary={t('bugReport', { context: 'description' })}
            />
            <Row
                href="mailto:danilkinkin@gmail.com"
                icon={EmailIcon}
                primary={t('contact')}
                secondary={t('contact', { context: 'description' })}
            />
            <Row
                href="https://github.com/rigami/readme/blob/main/POLICY.md"
                icon={PolicyIcon}
                primary={t('policy')}
            />
            <Row
                href={`https://chrome.google.com/webstore/detail/${appVariables.extensionId}`}
                icon={StarIcon}
                primary={t('rate')}
            />
            <ListItem className={classes.row}>
                <ListItemIcon />
                <ListItemText secondary="Danilkinkin | 2020-2022" />
            </ListItem>
        </React.Fragment>
    );
}

export { headerProps as header, About as content };

export default {
    id: 'about',
    header: headerProps,
    content: About,
};
