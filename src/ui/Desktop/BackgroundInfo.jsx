import React, { useEffect, useRef, memo } from 'react';
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
import { observer, useLocalObservable } from 'mobx-react-lite';
import { action } from 'mobx';
import { useTranslation } from 'react-i18next';
import useCoreService from '@/stores/app/BaseStateProvider';
import { mean } from 'lodash';

const useStyles = makeStyles((theme) => ({
    infoCard: {
        position: 'absolute',
        right: theme.spacing(2),
        top: theme.spacing(2),
        width: 340,
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
}));

function BackgroundInfo({ author, authorAvatarSrc, sourceLink, service, description }) {
    const { t } = useTranslation();
    const classes = useStyles();
    const mainAl = useRef();
    const coreService = useCoreService();
    const store = useLocalObservable(() => ({
        hideTimer: null,
        smooth: false,
    }));

    const moveMouseHandler = action((e) => {
        if (!mainAl.current) return;

        store.smooth = false;
        clearTimeout(store.hideTimer);

        const { x, y, height, width } = mainAl.current.getBoundingClientRect();
        const a = Math.abs((x + width * 0.5) - e.pageX);
        const b = Math.abs((y + height * 0.5) - e.pageY);
        let dist = 0.96 * Math.max(a, b) + 0.4 * Math.min(a, b);

        if (dist > 700) {
            dist = 700;
        } else if (dist < 160) {
            dist = 160;
        }

        dist -= 160;

        const opacity = 1 - dist / 540;

        coreService.storage.updateTemp({
            interfaceOpacity: {
                ...coreService.storage.temp.interfaceOpacity,
                bgInfo: opacity,
            },
        });

        const calcOpacity = Math.max(
            coreService.storage.temp.interfaceOpacity.bgInfo || 0,
            coreService.storage.temp.interfaceOpacity.menu || 0,
        );

        coreService.localEventBus.call('system/interfaceOpacity', { opacity: calcOpacity });

        if (mainAl.current) mainAl.current.style.opacity = calcOpacity;

        store.hideTimer = setTimeout(action(() => {
            if (e.path.indexOf(mainAl.current) !== -1 || e.path.indexOf(mainAl.current) !== -1) return;

            store.smooth = true;
            if (mainAl.current) mainAl.current.style.opacity = 0;
        }), 3000);
    });

    useEffect(() => {
        if (mainAl.current) mainAl.current.style.opacity = 0;
        window.addEventListener('mousemove', moveMouseHandler);

        const listener = coreService.localEventBus.on('system/interfaceOpacity', ({ opacity }) => {
            if (mainAl.current) mainAl.current.style.opacity = opacity;
        });

        return () => {
            window.removeEventListener('mousemove', moveMouseHandler);
            coreService.localEventBus.removeListener(listener);
        };
    }, []);

    return (
        <Card className={classes.infoCard} elevation={11} ref={mainAl}>
            <CardHeader
                classes={{
                    avatar: classes.avatar,
                    subheader: classes.subheader,
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
                        {author}
                        <Typography className={classes.service} variant="span">
                            , from Unsplash
                        </Typography>
                    </Typography>
                )}
                subheader={description}
            />
        </Card>
    );
}

export default memo(observer(BackgroundInfo));
