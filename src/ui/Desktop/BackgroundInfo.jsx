import React, { memo, Fragment } from 'react';
import {
    Card,
    CardHeader,
    Avatar,
    Tooltip,
    Link,
    IconButton,
} from '@material-ui/core';
import {
    OpenInNewRounded as OpenSourceIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import MouseDistanceFade from '@/ui-components/MouseDistanceFade';
import { BG_SOURCE } from '@/enum';

const useStyles = makeStyles((theme) => ({
    infoCard: {
        position: 'absolute',
        right: theme.spacing(2),
        top: theme.spacing(2),
        maxWidth: 430,
        minWidth: 350,
    },
    avatar: {
        alignSelf: 'flex-start',
    },
    subheader: {
        wordBreak: 'break-word',
    },
    service: {
        color: theme.palette.text.secondary,
    },
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
    header: {
        padding: theme.spacing(1.5),
    },
}));

function BackgroundInfo({ author, authorName, authorAvatarSrc, sourceLink, service, description, type }) {
    const { t } = useTranslation();
    const classes = useStyles();

    let serviceName = 'Unknown';
    let serviceUrl = '#';
    let authorUrl = '#';

    if (service === BG_SOURCE.UNSPLASH) {
        serviceName = 'Unsplash';
        serviceUrl = `https://unsplash.com/?utm_source=rigami&utm_medium=referral`;
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
        <MouseDistanceFade distanceMax={160} distanceMin={16}>
            <Card className={classes.infoCard} elevation={11}>
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
                        <Tooltip title={t('bg.openSource')}>
                            <IconButton onClick={() => { window.open(sourceLink, "_blank"); }}>
                                <OpenSourceIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                    title={(
                        <Fragment>
                            {`${t(`bg.type.${type}`)} `}
                            <Link
                                color="inherit"
                                underline="always"
                                href={authorUrl}
                                target="_blank"
                            >
                                {authorName}
                            </Link>
                            {' с '}
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
