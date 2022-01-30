import React, { useEffect, useRef, useState } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { observer, useLocalObservable } from 'mobx-react-lite';
import {
    BrokenImageRounded as BrokenIcon,
    DeleteRounded as DeleteIcon,
} from '@material-ui/icons';
import clsx from 'clsx';
import { Box, Fade } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { action, toJS } from 'mobx';
import { captureException } from '@sentry/react';
import {
    BG_TYPE,
    FETCH,
    THEME,
    BG_SHOW_STATE,
    BG_SOURCE,
    ACTIVITY,
    BG_SHOW_MODE,
} from '@/enum';
import Stub from '@/ui-components/Stub';
import useCoreService from '@/stores/app/BaseStateProvider';
import BackgroundEntity from '@/stores/universal/wallpapers/entities/wallpaper';
import WallpaperInfo from '@/ui/Desktop/WallpaperInfo';
import { eventToBackground } from '@/stores/universal/serviceBus';
import useAppService from '@/stores/app/AppStateProvider';
import WallpapersUniversalService from '@/stores/universal/wallpapers/service';
import WallpaperService from '@/ui/Desktop/wallpaperService';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        zIndex: 1,
    },
    itemStack: {
        position: 'absolute',
        width: '100vw',
        height: '100vh',
        top: 0,
        left: 0,
        transition: [
            theme.transitions.create(['opacity', 'top'], {
                duration: 900,
                easing: theme.transitions.easing.shiftEaseInOut,
            }),
            theme.transitions.create(['filter'], {
                duration: 1000,
                easing: theme.transitions.easing.easeInOut,
            }),
        ].join(','),
    },
    itemStackLoading: {
        top: -40,
        opacity: 0,
    },
    itemStackHold: { filter: 'saturate(0)' },
    itemStackHide: { opacity: 0 },
    bg: {
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
    },
    image: {
        backgroundPosition: '50%',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        objectFit: 'cover',
    },
    video: { objectFit: 'cover' },
    deleteBG: {
        color: theme.palette.getContrastText(theme.palette.error.main),
        backgroundColor: theme.palette.error.main,
        '&:hover': { backgroundColor: theme.palette.error.dark },
    },
    dimmingSurface: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.palette.common.black,
    },
    errorStub: { backgroundColor: theme.palette.background.default },
}));

function ItemStack(props) {
    const {
        type,
        fullSrc,
        kind,
        angle,
        colors,
        fileName,
        antiAliasing,
        hold = false,
        hide = false,
        disabledDelay = false,
        onLoad,
        onError,
    } = props;
    const classes = useStyles();
    const bgRef = useRef(null);

    useEffect(() => {
        if (kind !== 'media') {
            setTimeout(() => {
                onLoad();
            }, 100);
        }
    }, [kind]);

    return (
        <Box className={clsx(classes.itemStack, hold && classes.itemStackHold, hide && classes.itemStackHide)}>
            {/* (store.stateLoadBg === FETCH.FAILED || !store.currentBg) && (
                <Stub
                    className={classes.errorStub}
                    icon={BrokenIcon}
                    message={t(`error.${store.currentBg ? 'unknown' : 'notFound'}`)}
                    description={t(`error.${store.currentBg ? 'unknown' : 'notFound'}`, { context: 'description' })}
                    style={{ height: '100vh' }}
                    actions={store.currentBg && [
                        {
                            title: t('button.remove'),
                            onClick: () => {
                                WallpapersUniversalService.removeFromLibrary(store.currentBg.id)
                                    .then(() => eventToBackground('wallpapers/next'))
                                    .then(() => enqueueSnackbar({
                                        message: t('removedBrokenBG'),
                                        variant: 'warning',
                                    }));
                            },
                            variant: 'contained',
                            className: classes.deleteBG,
                            startIcon: (<DeleteIcon />),
                        },
                    ]}
                />
            ) */}
            {kind === 'color' && (
                <Box
                    className={classes.bg}
                    style={{ [colors.length > 1 ? 'backgroundImage' : 'backgroundColor']: colors.length > 1 ? `linear-gradient(${angle || 0}deg, ${colors.join(', ')}` : colors[0] }}
                />
            )}
            {kind === 'media' && type === BG_TYPE.IMAGE && (
                <img
                    alt={fileName}
                    className={clsx(classes.bg, classes.image)}
                    src={fullSrc}
                    style={{ imageRendering: antiAliasing ? 'auto' : 'pixelated' }}
                    onLoad={() => {
                        setTimeout(() => {
                            onLoad();
                        }, disabledDelay ? 0 : 1000);
                    }}
                    onError={onError}
                    ref={bgRef}
                />
            )}
            {kind === 'media' && type === BG_TYPE.VIDEO && (
                <video
                    autoPlay
                    loop
                    muted
                    src={fullSrc}
                    className={clsx(classes.bg, classes.video)}
                    style={{ imageRendering: antiAliasing ? 'auto' : 'pixelated' }}
                    onPlay={() => {
                        setTimeout(() => {
                            onLoad();
                        }, disabledDelay ? 0 : 1000);
                    }}
                    onLoadedMetadata={() => {
                        bgRef.current.currentTime = bgRef.current.duration / 2;
                        // bgRef.current.pause();
                    }}
                    onError={onError}
                    ref={bgRef}
                />
            )}
        </Box>
    );
}

function Wallpaper({ service }) {
    const classes = useStyles();
    const theme = useTheme();
    const appService = useAppService();
    const { backgrounds } = appService;
    const coreService = useCoreService();
    const store = useLocalObservable(() => ({
        stack: [],
        topLoaded: false,
    }));

    useEffect(() => {
        if (service.current) {
            store.stack = [service.current, ...store.stack];
            store.topLoaded = false;
        }
    }, [service.current?.id]);

    return (
        <Box className={classes.root}>
            {
                appService.activity !== ACTIVITY.FAVORITES
                && service.current
                && service.current.source !== BG_SOURCE.USER
                && service.current.kind === 'media'
                && (
                    <WallpaperInfo
                        author={service.current?.author}
                        authorName={service.current?.authorName}
                        authorAvatarSrc={service.current?.authorAvatarSrc}
                        sourceLink={service.current?.sourceLink}
                        service={service.current?.source}
                        description={service.current?.description}
                        type={service.current?.type}
                    />
                )
            }
            {store.stack.map((wallpaper, index) => (
                <ItemStack
                    key={wallpaper.id}
                    {...wallpaper}
                    hold={(index !== 0 || service.state === BG_SHOW_STATE.SEARCH) && store.stack[0].kind === 'media'}
                    hide={!store.topLoaded && index === 0}
                    disabledDelay={store.stack.length === 1}
                    onLoad={() => {
                        if (index === 0) {
                            store.topLoaded = true;

                            service.setContrastColor(wallpaper.contrastColor);
                            service.setCurrentDisplayedWallpaper(wallpaper);
                        }

                        if (store.stack.length > 1) {
                            setTimeout(() => {
                                store.stack = store.stack.slice(0, -1);
                            }, 800);
                        }
                    }}
                    onError={() => {

                    }}
                />
            )).reverse()}
            {store.stateLoadBg !== FETCH.FAILED && (
                <div
                    className={classes.dimmingSurface}
                    style={{ opacity: backgrounds.settings.dimmingPower / 100 || 0 }}
                />
            )}
        </Box>
    );
}

export default observer(Wallpaper);
