import React, { useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { observer, useLocalStore } from 'mobx-react-lite';
import {
    BrokenImageRounded as BrokenIcon,
    DeleteRounded as DeleteIcon,
} from '@material-ui/icons';
import FSConnector from '@/utils/fsConnector';
import {BG_TYPE, THEME} from '@/enum';
import clsx from 'clsx';
import { Fade, Box } from '@material-ui/core';
import FullscreenStub from '@/ui-components/FullscreenStub';
import { useSnackbar } from 'notistack';
import { useService as useBackgroundsService } from '@/stores/backgrounds';
import { useService as useAppConfigService } from '@/stores/app';
import Menu from '@/ui/Menu';
import GlobalContextMenu from "@/ui/GlobalContextMenu";
import { useTranslation } from 'react-i18next';


const useStyles = makeStyles((theme) => ({
    root: {
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
    },
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
}));

function Desktop() {
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();
    const backgroundsStore = useBackgroundsService();
    const appConfigStore = useAppConfigService();
    const { t } = useTranslation();
    const store = useLocalStore(() => ({
        currentBg: null,
        nextBg: null,
        state: 'pending',
        captureFrameTimer: null,
        bgId: null,
        isOpenMenu: false,
        position: null,
    }));

    const bgRef = useRef(null);

    const handlerContextMenu = (event) => {
        event.preventDefault();
        store.position = {
            top: event.nativeEvent.clientY,
            left: event.nativeEvent.clientX,
        };
        store.isOpenMenu = true;
    };

    const handleCloseMenu = () => {
        store.isOpenMenu = false;
    };

    useEffect(() => {
        const listeners = [
            backgroundsStore.eventBus.on('pausebg', () => {
                bgRef.current.onpause = async () => {
                    const pauseTimestamp = bgRef.current.currentTime;
                    const captureBGId = store.currentBg.id;
                    let temporaryBG;

                    try {
                        temporaryBG = await backgroundsStore.pause(captureBGId, pauseTimestamp);
                    } catch (e) {
                        console.log(e)
                        return;
                    }

                    store.captureFrameTimer = setTimeout(() => {
                        if (pauseTimestamp !== bgRef.current.currentTime) return;

                        store.nextBg = {
                            ...temporaryBG,
                            src: FSConnector.getBGURL('temporaryVideoFrame'),
                        };
                        store.state = 'pending';
                    }, 5000);
                };

                bgRef.current.play().then(() => bgRef.current.pause());
            }),
            backgroundsStore.eventBus.on('playbg', async () => {
                console.log('playbg')
                if (typeof store.captureFrameTimer === 'number') clearTimeout(+store.captureFrameTimer);
                store.captureFrameTimer = null;

                let currentBg;

                try {
                    currentBg = await backgroundsStore.play();
                } catch (e) {
                    console.log(e);
                    return;
                }

                if (bgRef.current.play) {
                    bgRef.current.play();
                    bgRef.current.onpause = null;
                }
                else {
                    store.nextBg ={
                        ...currentBg,
                        src: FSConnector.getBGURL(currentBg.fileName),
                    };
                    store.state = 'pending';
                }
            }),
        ];

        return () => {
            listeners.forEach((listenerId) => backgroundsStore.eventBus.removeListener(listenerId));
        }
    }, []);

    useEffect(() => {
        if (!backgroundsStore.currentBGId) return;
        const currentBg = backgroundsStore.getCurrentBG();

        const fileName = typeof currentBg.pause === 'number' ? 'temporaryVideoFrame' : currentBg.fileName;
        const src = FSConnector.getBGURL(fileName);

        store.state = 'pending';

        if (!store.currentBg) {
            store.currentBg = {
                ...currentBg,
                src,
            };
        } else {
            store.nextBg = {
                ...currentBg,
                src,
            };
        }

        return () => {
            if (typeof store.captureFrameTimer === 'number') clearTimeout(+store.captureFrameTimer);
            store.captureFrameTimer = null;
        };
    }, [backgroundsStore.currentBGId]);

    useEffect(() => {
        if (store.currentBg || !store.nextBg) return;

        store.currentBg = { ...store.nextBg };
        store.nextBg = null;
    }, [store.currentBg]);

    return (
        <Box className={classes.root} onContextMenu={handlerContextMenu}>
            <GlobalContextMenu
                onClose={handleCloseMenu}
                isOpen={store.isOpenMenu}
                position={store.position}
            />
            <Fade
                in={store.state === 'done' || store.state === 'failed'}
                onExit={() => {
                    if (appConfigStore.backdropTheme === THEME.DARK) {
                        document.documentElement.style.backgroundColor = '#000';
                    } else {
                        document.documentElement.style.backgroundColor = '#fff';
                    }
                }}
                onExited={() => {
                    console.log("Reset current bg");
                    store.currentBg = null;
                }}
            >
                <div className={classes.root}>
                    {store.state !== 'failed' && (
                        <div
                            className={classes.dimmingSurface}
                            style={{ opacity: backgroundsStore.dimmingPower / 100 || 0 }}
                        />
                    )}
                    {store.state === 'failed' && (
                        <FullscreenStub
                            iconRender={(props) => (<BrokenIcon {...props} />)}
                            message={t("bg.errorLoad")}
                            description={
                                (store.bg && t("bg.errorLoadUnknownReason"))
                                || t("bg.notFoundBG")
                            }
                            style={{ height: '100vh' }}
                            actions={store.bg && [
                                {
                                    title: t("bg.remove"),
                                    onClick: () => {
                                        backgroundsStore.removeFromStore(bg.id)
                                            .then(() => backgroundsStore.nextBG())
                                            .then(() => enqueueSnackbar({
                                                message: t("bg.brokenRemovedSuccess"),
                                                variant: 'warning',
                                            }));
                                    },
                                    variant: 'contained',
                                    className: classes.deleteBG,
                                    startIcon: (<DeleteIcon />),
                                },
                            ]}
                        />
                    )}
                    {(
                        store.currentBg
                        && (store.currentBg.type === BG_TYPE.IMAGE
                            || store.currentBg.type === BG_TYPE.ANIMATION
                            || (
                                store.currentBg.type === BG_TYPE.VIDEO
                                && !store.currentBg.forceLoadAsVideo
                                && typeof store.currentBg.pause === 'number'
                            )
                        )
                    ) && (
                        <img
                            alt={store.currentBg.fileName}
                            className={clsx(classes.bg, classes.image)}
                            src={store.currentBg.src}
                            style={{ imageRendering: store.currentBg.antiAliasing ? 'auto' : 'pixelated' }}
                            onLoad={() => {
                                console.log("load done")
                                store.state = 'done';
                            }}
                            onError={() => {
                                if (store.currentBg.type === BG_TYPE.VIDEO) {
                                    store.nextBg ={
                                        ...store.currentBg,
                                        forceLoadAsVideo: true,
                                        src: FSConnector.getBGURL(store.currentBg.fileName),
                                    };
                                    store.state = 'pending';
                                    store.currentBg = null;
                                } else {
                                    store.state = 'failed';
                                }
                            }}
                            ref={bgRef}
                        />
                    )}
                    {
                        store.currentBg
                        && store.currentBg.type === BG_TYPE.VIDEO
                        && (
                            typeof store.currentBg.pause !== 'number'
                            || store.currentBg.forceLoadAsVideo
                        )
                        && (
                            <video
                                autoPlay={!store.currentBg.pause}
                                loop
                                muted
                                src={store.currentBg.src}
                                className={clsx(classes.bg, classes.video)}
                                style={{ imageRendering: store.currentBg.antiAliasing ? 'auto' : 'pixelated' }}
                                onPlay={() => { store.state = 'done'; }}
                                onLoadedMetadata={() => {
                                    console.log(store.currentBg)
                                    if (typeof store.currentBg.pause === 'number') {
                                        bgRef.current.currentTime = store.currentBg.pause;
                                        backgroundsStore.eventBus.dispatch('pausebg');
                                    }
                                }}
                                onError={() => { store.state = 'failed'; }}
                                ref={bgRef}
                            />
                        )
                    }
                </div>
            </Fade>
            <Menu />
        </Box>
    );
}

export default observer(Desktop);
