import React, { memo, Fragment } from 'react';
import {
    Card,
    CardHeader,
    Avatar,
    Link,
} from '@material-ui/core';
import { OpenInNewRounded as OpenSourceIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import MouseDistanceFade from '@/ui-components/MouseDistanceFade';
import { BG_SOURCE, BKMS_FAP_POSITION } from '@/enum';
import clsx from 'clsx';
import useBookmarksService from '@/stores/app/BookmarksProvider';

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'absolute',
        right: 74,
        bottom: theme.spacing(2),
        background: 'none',
        maxWidth: 430,
        minWidth: 350,
        zIndex: theme.zIndex.modal,
        color: theme.palette.common.white,
        overflow: 'unset',
        '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            width: 800,
            height: 500,
            transform: 'translate(-50%, -50%)',
            left: '50%',
            zIndex: -1,
            backgroundImage: 'radial-gradient(closest-side, #00000047, #ffffff00)',
        },
    },
    topOffset: {
        top: 'unset',
        bottom: theme.spacing(2),
        right: theme.spacing(2),
    },
    avatar: { alignSelf: 'flex-start' },
    title: { fontWeight: 500 },
    subheader: {
        wordBreak: 'break-word',
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': 3,
        overflow: 'hidden',
        color: theme.palette.grey[200],
        fontWeight: 450,
    },
    avatarIcon: {
        width: theme.spacing(4),
        height: theme.spacing(4),
    },
    header: { padding: 0 },
    openSource: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: theme.spacing(1),
        fontWeight: 700,
        color: theme.palette.common.white,
        '& svg': {
            width: theme.spacing(2),
            height: theme.spacing(2),
            marginLeft: theme.spacing(1),
        },
    },
    link: { fontWeight: 700 },
}));

function BackgroundInfo(props) {
    const {
        author,
        authorName,
        authorAvatarSrc,
        sourceLink,
        service,
        description,
        type,
    } = props;
    const classes = useStyles();
    const bookmarksService = useBookmarksService();
    const { t } = useTranslation(['background']);

    let serviceName = 'Unknown';
    let serviceUrl = '#';
    let authorUrl = '#';

    if (service === BG_SOURCE.UNSPLASH) {
        serviceName = 'Unsplash';
        serviceUrl = 'https://unsplash.com/?utm_source=rigami&utm_medium=referral';
        authorUrl = `https://unsplash.com/${author}?utm_source=rigami&utm_medium=referral`;
    } else if (service === BG_SOURCE.PIXABAY) {
        serviceName = 'Pixabay';
        serviceUrl = 'https://pixabay.com/ru/videos/';
        authorUrl = `https://pixabay.com/ru/users/${author.substring(1)}/`;
    } else if (service === BG_SOURCE.PEXELS) {
        serviceName = 'Pexels';
        serviceUrl = 'https://www.pexels.com/videos/';
        authorUrl = `https://www.pexels.com/${author}`;
    }

    return (
        <MouseDistanceFade distanceMax={64} distanceMin={8}>
            <Card
                className={clsx(
                    classes.root,
                    bookmarksService.fapIsDisplay
                    && bookmarksService.settings.fapPosition === BKMS_FAP_POSITION.TOP
                    && classes.topOffset,
                )}
                elevation={0}
            >
                <CardHeader
                    classes={{
                        root: classes.header,
                        avatar: classes.avatar,
                        title: classes.title,
                        subheader: classes.subheader,
                    }}
                    avatar={(
                        <Avatar className={classes.avatarIcon} src={authorAvatarSrc} />
                    )}
                    title={(
                        <Fragment>
                            {`${t(`type.${type}`)} `}
                            <Link
                                color="inherit"
                                underline="hover"
                                href={authorUrl}
                                target="_blank"
                                className={classes.link}
                            >
                                {authorName}
                            </Link>
                            {` ${t('common:from')} `}
                            <Link
                                color="inherit"
                                underline="hover"
                                href={serviceUrl}
                                target="_blank"
                                className={classes.link}
                            >
                                {serviceName}
                            </Link>
                        </Fragment>
                    )}
                    subheader={(
                        <Fragment>
                            <Link
                                color="inherit"
                                underline="hover"
                                href={sourceLink}
                                target="_blank"
                                className={classes.openSource}
                            >
                                {t('button.openSource')}
                                <OpenSourceIcon />
                            </Link>
                            <span>{description}</span>
                        </Fragment>
                    )}
                />
            </Card>
        </MouseDistanceFade>
    );
}

export default memo(observer(BackgroundInfo));
