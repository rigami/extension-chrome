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
import FullscreenStub from '@/ui-components/FullscreenStub';
import { useSnackbar } from 'notistack';
import useCoreService from '@/stores/app/BaseStateProvider';
import { useTranslation } from 'react-i18next';
import useAppStateService from '@/stores/app/AppStateProvider';
import { action, toJS } from 'mobx';
import BackgroundEntity from '@/stores/universal/backgrounds/entities/background';
import BackgroundInfo from '@/ui/Desktop/BackgroundInfo';

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
    errorStub: {
        backgroundColor: theme.palette.background.default,
    },
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
    }));

    const bgRef = useRef(null);

    const handleStartSwitch = () => {
        if (settings.backdropTheme === THEME.DARK) {
            document.documentElement.style.backgroundColor = '#000';
        } else {
            document.documentElement.style.backgroundColor = '#fff';
        }
    }

    const handleSwitchBg = () => {
        store.showBg = false;
        console.log('[BACKGROUND] SWITCH BG', store.currentBg, store.requestBg);

        if (store.stateRequestLoadBg === FETCH.DONE) {
            store.currentBg = store.requestBg;
            store.stateLoadBg = FETCH.PENDING;
            store.stateRequestLoadBg = FETCH.WAIT;
        }
    }

    const handleShow = () => {
        store.showBg = true;
    };

    useEffect(() => {
        const listeners = [
            coreService.localEventBus.on('background/pause', () => {
                console.log('background/pause', bgRef.current.tagName);
                bgRef.current.onpause = async () => {
                    console.log('bgRef.current', bgRef.current)
                    const pauseTimestamp = bgRef.current.currentTime;
                    console.log('pauseTimestamp', pauseTimestamp);
                    const captureBGId = store.currentBg.id;
                    let temporaryBG;

                    try {
                        temporaryBG = await backgrounds.pause(captureBGId, pauseTimestamp);
                    } catch (e) {
                        console.log('Failed pause', e);
                        return;
                    }

                    store.captureFrameTimer = setTimeout(() => {
                        if (pauseTimestamp !== bgRef.current.currentTime) return;

                        store.requestBg = new BackgroundEntity({
                            ...temporaryBG,
                            fileName: 'temporaryVideoFrame',
                        });
                        store.stateLoadBg = FETCH.PENDING;
                    }, 5000);
                };

                bgRef.current.play().then(() => bgRef.current.pause());
            }),
            coreService.localEventBus.on('background/play', async () => {
                console.log('background/play');
                if (typeof store.captureFrameTimer === 'number') clearTimeout(+store.captureFrameTimer);
                store.captureFrameTimer = null;

                try {
                    await backgrounds.play();
                } catch (e) {
                    console.log(e);
                    return;
                }

                if (bgRef.current.play) {
                    bgRef.current.play();
                    bgRef.current.onpause = null;
                } else {
                    store.requestBg = backgrounds.currentBG;
                    store.stateLoadBg = FETCH.PENDING;
                }
            }),
        ];

        return () => {
            listeners.forEach((listenerId) => coreService.localEventBus.removeListener(listenerId));
        };
    }, []);

    useEffect(action(() => {
        if (!backgrounds.currentBGId || backgrounds.bgState !== BG_SHOW_STATE.DONE) {
            if (!store.isFirstRender && backgrounds.bgState === BG_SHOW_STATE.NOT_FOUND) {
                console.log('Force reset current bg')
                store.stateLoadBg = FETCH.FAILED;
                store.currentBg = null;
                store.requestBg = null;
            }

            store.isFirstRender = false;

            return () => {};
        }

        const currentBg = backgrounds.currentBG;

        console.log('currentBg', currentBg, backgrounds, toJS(backgrounds))

        if (store.requestBg?.id !== currentBg.id) {
            store.requestBg = new BackgroundEntity({
                ...currentBg,
                fileName: typeof currentBg.pause === 'number' ? 'temporaryVideoFrame' : currentBg.fileName,
            });
        }

        return () => {
            if (typeof store.captureFrameTimer === 'number') clearTimeout(+store.captureFrameTimer);
            store.captureFrameTimer = null;
        };
    }), [backgrounds.currentBGId, backgrounds.bgState]);

    useEffect(() => {
        if (!store.requestBg) return;
        console.log('[BACKGROUND] NEW BG REQUEST');

        const loadBgId = store.requestBg.id;

        store.stateRequestLoadBg = FETCH.PENDING;

        const successLoad = () => {
            if (loadBgId !== store.requestBg.id) return;
            console.log('[BACKGROUND] NEW BG DONE', store.showBg, store.requestBg, store.stateLoadBg);
            store.stateRequestLoadBg = FETCH.DONE;

            if (!store.showBg) {
                store.currentBg = store.requestBg;
                store.stateLoadBg = FETCH.PENDING;
                store.stateRequestLoadBg = FETCH.WAIT;
            }
        }

        const failedLoad = (e) => {
            if (loadBgId !== store.requestBg.id) return;
            console.log('[BACKGROUND] NEW BG FAILED', e);
            store.stateRequestLoadBg = FETCH.FAILED;
        }

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

    console.log('Fade', (store.stateLoadBg === FETCH.DONE || store.stateLoadBg === FETCH.FAILED) && store.stateRequestLoadBg !== FETCH.DONE)

    return (
        <Fade
            in={(store.stateLoadBg === FETCH.DONE || store.stateLoadBg === FETCH.FAILED) && store.stateRequestLoadBg !== FETCH.DONE}
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
                {store.currentBg?.source !== BG_SOURCE.USER && (
                    <BackgroundInfo
                        author={store.currentBg?.author}
                        authorName={store.currentBg?.authorName}
                        authorAvatarSrc={store.currentBg?.authorAvatarSrc}
                        sourceLink={store.currentBg?.sourceLink}
                        service={store.currentBg?.source}
                        description={store.currentBg?.description}
                    />
                )}
                {(store.stateLoadBg === FETCH.FAILED || !store.currentBg) && (
                    <FullscreenStub
                        className={classes.errorStub}
                        icon={BrokenIcon}
                        message={t('bg.errorLoad')}
                        description={(store.currentBg && t('bg.errorLoadUnknownReason')) || t('bg.notFound')}
                        style={{ height: '100vh' }}
                        actions={store.currentBg && [
                            {
                                title: t('bg.remove'),
                                onClick: () => {
                                    backgrounds.removeFromStore(store.currentBg.id)
                                        .then(() => backgrounds.nextBG())
                                        .then(() => enqueueSnackbar({
                                            message: t('bg.brokenRemovedSuccess'),
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
                            && store.currentBg.fileName === 'temporaryVideoFrame'
                        )
                    )
                ) && (
                    <img
                        alt={store.currentBg.fileName}
                        className={clsx(classes.bg, classes.image)}
                        src={store.currentBg.fullSrc}
                        style={{ imageRendering: store.currentBg.antiAliasing ? 'auto' : 'pixelated' }}
                        onLoad={action(() => {
                            store.stateLoadBg = FETCH.DONE;
                        })}
                        onError={action(() => {
                            console.log('Failed load img')
                            if (store.currentBg.type === BG_TYPE.VIDEO) {
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
                    && store.currentBg.fileName !== 'temporaryVideoFrame'
                    && (
                        <video
                            autoPlay={!store.currentBg.pause}
                            loop
                            muted
                            src={store.currentBg.fullSrc}
                            className={clsx(classes.bg, classes.video)}
                            style={{ imageRendering: store.currentBg.antiAliasing ? 'auto' : 'pixelated' }}
                            onPlay={() => { store.stateLoadBg = FETCH.DONE; }}
                            onLoadedMetadata={() => {
                                if (typeof store.currentBg.pause === 'number') {
                                    bgRef.current.currentTime = store.currentBg.pause;
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
