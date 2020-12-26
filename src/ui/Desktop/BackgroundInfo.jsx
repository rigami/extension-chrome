import React, { memo } from 'react';
import {
    Card,
    IconButton,
    CardHeader,
    Avatar,
    Typography, Tooltip,
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
        width: 360,
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
        marginTop: theme.spacing(-0.5),
        marginBottom: theme.spacing(-0.5),
    },
}));

function BackgroundInfo({ author, authorName, authorAvatarSrc, sourceLink, service, description }) {
    const { t } = useTranslation();
    const classes = useStyles();

    let serviceName = 'Unknown';

    if (service === BG_SOURCE.UNSPLASH) {
        serviceName = 'Unsplash';
    } else if (service === BG_SOURCE.PIXABAY) {
        serviceName = 'Pixabay';
    } else if (service === BG_SOURCE.PEXELS) {
        serviceName = 'Pexels';
    }

    return (
        <MouseDistanceFade distanceMax={160} distanceMin={16}>
            <Card className={classes.infoCard} elevation={11}>
                <CardHeader
                    classes={{
                        avatar: classes.avatar,
                        subheader: classes.subheader,
                        action: classes.action,
                    }}
                    avatar={(
                        <Avatar src={authorAvatarSrc} />
                    )}
                    action={(
                        <Tooltip title={t('bg.openSource')}>
                            <IconButton
                                onClick={() => {
                                    window.open(sourceLink, "_blank");
                                }}
                            >
                                <OpenSourceIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                    title={(
                        <Typography variant="span">
                            {authorName}
                            <Typography className={classes.service} variant="span">
                                , from {serviceName}
                            </Typography>
                        </Typography>
                    )}
                    subheader={description}
                />
            </Card>
        </MouseDistanceFade>
    );
}

export default memo(observer(BackgroundInfo));
