import React, { useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { observer, useLocalObservable } from 'mobx-react-lite';
import {
    BrokenImageRounded as BrokenIcon,
    DeleteRounded as DeleteIcon,
} from '@material-ui/icons';
import {
    BG_TYPE,
    FETCH,
    THEME,
    BG_SHOW_STATE,
    BG_SOURCE,
} from '@/enum';
import clsx from 'clsx';
import { Fade } from '@material-ui/core';
import Stub from '@/ui-components/Stub';
import { useSnackbar } from 'notistack';
import useCoreService from '@/stores/app/BaseStateProvider';
import { useTranslation } from 'react-i18next';
import useAppStateService from '@/stores/app/AppStateProvider';
import { action, toJS } from 'mobx';
import BackgroundEntity from '@/stores/universal/backgrounds/entities/background';
import BackgroundInfo from '@/ui/Desktop/BackgroundInfo';
import { eventToBackground } from '@/stores/server/bus';

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
    errorStub: { backgroundColor: theme.palette.background.default },
}));

function Background() {
    const { t } = useTranslation();
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();
    const { settings, backgrounds } = useAppStateService();
    const coreService = useCoreService();
    const store = useLocalObservable(() => ({
        currentBg: null,
        requestBg: null,
        stateLoadBg: FETCH.PENDING,
        stateRequestLoadBg: FETCH.WAIT,
        captureFrameTimer: null,
        isFirstRender: true,
        showBg: false,
        loadBgId: null,
    }));

    const bgRef = useRef(null);

    const handleStartSwitch = () => {
        if (settings.backdropTheme === THEME.DARK) {
            document.documentElement.style.backgroundColor = '#000';
        } else {
            document.documentElement.style.backgroundColor = '#fff';
        }
    };

    const handleSwitchBg = () => {
        if (!store.requestBg) return;
        console.log('[BACKGROUND] hide bg');
        store.showBg = false;
        console.log('[BACKGROUND] SWITCH BG', store.currentBg, store.requestBg);

        if (store.stateRequestLoadBg === FETCH.DONE) {
            store.currentBg = store.requestBg;
            console.log('store.requestBg clear 2');
            store.requestBg = null;
            store.stateLoadBg = FETCH.DONE;
            store.stateRequestLoadBg = FETCH.WAIT;
        }
    };

    const handleShow = () => {
        console.log('[BACKGROUND] show bg');
        store.showBg = true;
    };

    useEffect(() => {
        const listeners = [
            coreService.localEventBus.on('background/pause', () => {
                bgRef.current.onpause = async () => {
                    const pauseTimestamp = bgRef.current.currentTime;
                    const captureBGId = store.currentBg.id;

                    try {
                        await new Promise((resolve, reject) => eventToBackground('backgrounds/pause', {
                            bgId: captureBGId,
                            timestamp: pauseTimestamp,
                        }, (data) => {
                            console.log('backgrounds/pause', data);
                            if (data.success) {
                                resolve();
                            } else {
                                reject();
                            }
                        }));
                    } catch (e) {
                        console.log('Failed pause', e);
                        return;
                    }

                    store.captureFrameTimer = setTimeout(() => {
                        if (pauseTimestamp !== bgRef.current.currentTime) return;

                        store.requestBg = backgrounds.currentBG;
                    }, 5000);
                };

                bgRef.current.play().then(() => bgRef.current.pause());
            }),
            coreService.localEventBus.on('background/play', async () => {
                console.log('backgrounds/play');
                if (typeof store.captureFrameTimer === 'number') clearTimeout(+store.captureFrameTimer);
                store.captureFrameTimer = null;

                try {
                    await new Promise((resolve, reject) => eventToBackground('backgrounds/play', {}, (data) => {
                        if (data.success) {
                            resolve();
                        } else {
                            reject();
                        }
                    }));
                } catch (e) {
                    console.log(e);
                    return;
                }

                if (bgRef.current.play) {
                    bgRef.current.play();
                    bgRef.current.onpause = null;
                } else {
                    store.requestBg = backgrounds.currentBG;
                }
            }),
        ];

        return () => {
            listeners.forEach((listenerId) => coreService.localEventBus.removeListener(listenerId));
        };
    }, []);

    useEffect(action(() => {
        console.log('store.requestBg 1:', backgrounds.currentBGId, backgrounds.bgState);
        if (!backgrounds.currentBGId || backgrounds.bgState !== BG_SHOW_STATE.DONE) {
            if (!store.isFirstRender && backgrounds.bgState === BG_SHOW_STATE.NOT_FOUND) {
                console.log('Force reset current bg');
                store.stateLoadBg = FETCH.FAILED;
                store.currentBg = null;
                console.log('store.requestBg clear 1');
                store.requestBg = null;
            }

            store.isFirstRender = false;

            return () => {};
        }

        const currentBg = backgrounds.currentBG;

        if (store.requestBg?.id !== currentBg.id) {
            store.requestBg = new BackgroundEntity(currentBg);
        }

        return () => {
            if (typeof store.captureFrameTimer === 'number') clearTimeout(+store.captureFrameTimer);
            store.captureFrameTimer = null;
        };
    }), [backgrounds.currentBGId, backgrounds.bgState]);

    useEffect(() => {
        if (!store.requestBg) return;
        console.log('[BACKGROUND] NEW BG REQUEST', store.requestBg?.id, toJS(store.requestBg), toJS(store.currentBg));

        const loadBgId = store.requestBg.id;
        store.loadBgId = loadBgId;

        store.stateRequestLoadBg = FETCH.PENDING;

        const successLoad = () => {
            if (loadBgId !== store.requestBg.id) return;
            console.log('[BACKGROUND] NEW BG DONE', store.showBg, store.requestBg, store.stateLoadBg);
            store.stateRequestLoadBg = FETCH.DONE;
            store.loadBgId = null;

            if (!store.showBg) {
                store.currentBg = store.requestBg;
                store.stateLoadBg = FETCH.PENDING;
                store.stateRequestLoadBg = FETCH.WAIT;
            }
        };

        const failedLoad = (e) => {
            if (loadBgId !== store.requestBg.id) return;
            console.log('[BACKGROUND] NEW BG FAILED', e);
            store.stateRequestLoadBg = FETCH.FAILED;
            store.loadBgId = null;
        };

        if (store.requestBg.type === BG_TYPE.VIDEO && store.requestBg.fileName !== 'temporaryVideoFrame') {
            const video = document.createElement('video');

            video.onloadedmetadata = successLoad;
            video.onerror = failedLoad;

            video.src = store.requestBg.fullSrc;
        } else {
            const image = new Image();

            image.onload = successLoad;
            image.onerror = failedLoad;

            image.src = store.requestBg.fullSrc;
        }
    }, [store.requestBg]);

    useEffect(() => {
        if (store.stateLoadBg !== FETCH.DONE) return () => {};

        const timer = setTimeout(() => eventToBackground('backgrounds/prepareNextBg'), 3000);

        return () => clearTimeout(timer);
    }, [store.stateLoadBg]);

    return (
        <Fade
            in={
                (store.stateLoadBg === FETCH.DONE || store.stateLoadBg === FETCH.FAILED)
                && store.stateRequestLoadBg !== FETCH.DONE
            }
            onExit={handleStartSwitch}
            onExited={handleSwitchBg}
            onEntered={handleShow}
        >
            <div className={classes.root}>
                {store.stateLoadBg !== FETCH.FAILED && (
                    <div
                        className={classes.dimmingSurface}
                        style={{ opacity: backgrounds.settings.dimmingPower / 100 || 0 }}
                    />
                )}
                {store.currentBg && store.currentBg?.source !== BG_SOURCE.USER && (
                    <BackgroundInfo
                        author={store.currentBg?.author}
                        authorName={store.currentBg?.authorName}
                        authorAvatarSrc={store.currentBg?.authorAvatarSrc}
                        sourceLink={store.currentBg?.sourceLink}
                        service={store.currentBg?.source}
                        description={store.currentBg?.description}
                        type={store.currentBg?.type}
                    />
                )}
                {(store.stateLoadBg === FETCH.FAILED || !store.currentBg) && (
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
                                    backgrounds.removeFromStore(store.currentBg.id)
                                        .then(() => backgrounds.nextBG())
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
                )}
                {(
                    store.currentBg
                    && (store.currentBg.type === BG_TYPE.IMAGE
                        || store.currentBg.type === BG_TYPE.ANIMATION
                        || (
                            store.currentBg.type === BG_TYPE.VIDEO
                            && store.currentBg.pauseStubSrc
                        )
                    )
                ) && (
                    <img
                        alt={store.currentBg.fileName}
                        className={clsx(classes.bg, classes.image)}
                        src={
                            store.currentBg.type === BG_TYPE.VIDEO
                                ? store.currentBg.pauseStubSrc
                                : store.currentBg.fullSrc
                        }
                        style={{ imageRendering: store.currentBg.antiAliasing ? 'auto' : 'pixelated' }}
                        onLoad={action(() => {
                            store.stateLoadBg = FETCH.DONE;
                        })}
                        onError={action(() => {
                            console.log('Failed load img');
                            if (store.currentBg.type === BG_TYPE.VIDEO) {
                                console.log('store.requestBg 2');
                                store.requestBg = backgrounds.currentBG;
                                store.stateLoadBg = FETCH.PENDING;
                                store.currentBg = null;
                            } else {
                                store.stateLoadBg = FETCH.FAILED;
                            }
                        })}
                        ref={bgRef}
                    />
                )}
                {
                    store.currentBg
                    && store.currentBg.type === BG_TYPE.VIDEO
                    && !store.currentBg.pauseStubSrc
                    && (
                        <video
                            autoPlay={!store.currentBg.pause}
                            loop
                            muted
                            src={store.currentBg.fullSrc}
                            className={clsx(classes.bg, classes.video)}
                            style={{ imageRendering: store.currentBg.antiAliasing ? 'auto' : 'pixelated' }}
                            onPlay={() => {
                                store.stateLoadBg = FETCH.DONE;
                            }}
                            onLoadedMetadata={() => {
                                if (store.currentBg.pauseTimestamp) {
                                    bgRef.current.currentTime = store.currentBg.pauseTimestamp >= 0
                                        ? store.currentBg.pauseTimestamp
                                        : bgRef.current.duration / 2;
                                    bgRef.current.pause();
                                    coreService.localEventBus.call('background/pause');
                                }
                            }}
                            onError={() => { store.stateLoadBg = FETCH.FAILED; }}
                            ref={bgRef}
                        />
                    )
                }
            </div>
        </Fade>
    );
}

export default observer(Background);
