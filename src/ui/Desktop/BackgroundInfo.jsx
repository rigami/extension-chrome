import React, { memo, Fragment } from 'react';
import {
    Card,
    CardHeader,
    Avatar,
    Tooltip,
    Link,
    IconButton,
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
    infoCard: {
        position: 'absolute',
        right: theme.spacing(3),
        top: theme.spacing(3),
        maxWidth: 430,
        minWidth: 350,
        zIndex: theme.zIndex.modal,
        '&:not(:hover) $subheader': { '-webkit-line-clamp': 4 },
    },
    topOffset: { top: theme.spacing(14) },
    avatar: { alignSelf: 'flex-start' },
    subheader: {
        wordBreak: 'break-word',
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': 20,
        overflow: 'hidden',
    },
    service: { color: theme.palette.text.secondary },
    action: {
        marginTop: theme.spacing(-1),
        marginBottom: theme.spacing(-1),
        marginRight: theme.spacing(-1),
        marginLeft: theme.spacing(1),
        display: 'flex',
    },
    avatarIcon: {
        width: theme.spacing(4),
        height: theme.spacing(4),
    },
    header: { padding: theme.spacing(1.5) },
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
                    classes.infoCard,
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
                        subheader: classes.subheader,
                        action: classes.action,
                    }}
                    avatar={(
                        <Avatar className={classes.avatarIcon} src={authorAvatarSrc} />
                    )}
                    action={(
                        <Tooltip title={t('button.openSource')}>
                            <IconButton
                                data-ui-path="desktop.bgInfo.openSource"
                                onClick={() => { window.open(sourceLink, '_blank'); }}
                            >
                                <OpenSourceIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                    title={(
                        <Fragment>
                            {`${t(`type.${type}`)} `}
                            <Link
                                color="inherit"
                                underline="always"
                                href={authorUrl}
                                target="_blank"
                            >
                                {authorName}
                            </Link>
                            {` ${t('common:from')} `}
                            <Link
                                color="inherit"
                                underline="always"
                                href={serviceUrl}
                                target="_blank"
                            >
                                {serviceName}
                            </Link>
                        </Fragment>
                    )}
                    subheader={description}
                />
            </Card>
        </MouseDistanceFade>
    );
}

export default memo(observer(BackgroundInfo));
