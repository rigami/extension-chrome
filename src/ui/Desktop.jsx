import React, { useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { observer, useLocalObservable } from 'mobx-react-lite';
import {
    BrokenImageRounded as BrokenIcon,
    DeleteRounded as DeleteIcon,
    Refresh as RefreshIcon,
    AddPhotoAlternateRounded as UploadFromComputerIcon,
    Add as AddBookmarkIcon,
} from '@material-ui/icons';
import FSConnector from '@/utils/fsConnector';
import { BG_TYPE, FETCH, THEME } from '@/enum';
import clsx from 'clsx';
import { Fade, Box } from '@material-ui/core';
import FullscreenStub from '@/ui-components/FullscreenStub';
import { useSnackbar } from 'notistack';
import useBackgroundsService from '@/stores/BackgroundsStateProvider';
import useCoreService from '@/stores/BaseStateProvider';
import Menu from '@/ui/Menu';
import { useTranslation } from 'react-i18next';
import useAppStateService from '@/stores/AppStateProvider';
import Widgets from './Widgets';
import { action } from 'mobx';

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

function Desktop() {
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();
    const backgroundsStore = useBackgroundsService();
    const { widgets } = useAppStateService();
    const coreService = useCoreService();
    const { t } = useTranslation();
    const store = useLocalObservable(() => ({
        currentBg: null,
        nextBg: null,
        state: FETCH.PENDING,
        captureFrameTimer: null,
        bgId: null,
        isOpenMenu: false,
        position: null,
    }));

    const bgRef = useRef(null);

    const openMenu = (position) => {
        coreService.localEventBus.call('system/contextMenu', {
            actions: [
                {
                    type: 'button',
                    title: t('bg.next'),
                    icon: RefreshIcon,
                    onClick: () => {
                        backgroundsStore.nextBG();
                    },
                },
                {
                    type: 'button',
                    title: t('bg.addShort'),
                    icon: UploadFromComputerIcon,
                    onClick: () => {
                        const shadowInput = document.createElement('input');
                        shadowInput.setAttribute('multiple', 'true');
                        shadowInput.setAttribute('type', 'file');
                        shadowInput.setAttribute('accept', 'video/*,image/*');
                        shadowInput.onchange = (event) => {
                            const form = event.target;
                            if (form.files.length === 0) return;

                            backgroundsStore.addToUploadQueue(form.files)
                                .catch(() => enqueueSnackbar({
                                    ...t('locale.settings.backgrounds.general.library[e]'),
                                    variant: 'error',
                                }))
                                .finally(() => {
                                    form.value = '';
                                });
                        };
                        shadowInput.click();
                    },
                },
                {
                    type: 'button',
                    title: t('bookmark.addShort'),
                    icon: AddBookmarkIcon,
                    onClick: () => {
                        coreService.localEventBus.call('bookmark/create');
                    },
                },
            ],
            position,
        });
    };

    const handlerContextMenu = (event) => {
        event.preventDefault();
        openMenu({
            top: event.nativeEvent.clientY,
            left: event.nativeEvent.clientX,
        });
    };

    useEffect(() => {
        const listeners = [
            coreService.localEventBus.on('background/pause', () => {
                bgRef.current.onpause = async () => {
                    const pauseTimestamp = bgRef.current.currentTime;
                    const captureBGId = store.currentBg.id;
                    let temporaryBG;

                    try {
                        temporaryBG = await backgroundsStore.pause(captureBGId, pauseTimestamp);
                    } catch (e) {
                        console.log(e);
                        return;
                    }

                    store.captureFrameTimer = setTimeout(() => {
                        if (pauseTimestamp !== bgRef.current.currentTime) return;

                        store.nextBg = {
                            ...temporaryBG,
                            src: FSConnector.getBGURL('temporaryVideoFrame'),
                        };
                        store.state = FETCH.PENDING;
                    }, 5000);
                };

                bgRef.current.play().then(() => bgRef.current.pause());
            }),
            coreService.localEventBus.on('background/play', async () => {
                console.log('background/play');
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
                } else {
                    store.nextBg = {
                        ...currentBg,
                        src: FSConnector.getBGURL(currentBg.fileName),
                    };
                    store.state = FETCH.PENDING;
                }
            }),
        ];

        return () => {
            listeners.forEach((listenerId) => coreService.localEventBus.removeListener(listenerId));
        };
    }, []);

    useEffect(action(() => {
        if (!backgroundsStore.currentBGId) {
            store.state = FETCH.FAILED;

            return () => {};
        }
        const currentBg = backgroundsStore.getCurrentBG();

        const fileName = typeof currentBg.pause === 'number' ? 'temporaryVideoFrame' : currentBg.fileName;
        const src = FSConnector.getBGURL(fileName);

        store.state = FETCH.PENDING;

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
    }), [backgroundsStore.currentBGId]);

    useEffect(() => {
        if (store.currentBg || !store.nextBg) return;

        store.currentBg = { ...store.nextBg };
        store.nextBg = null;
    }, [store.currentBg]);

    return (
        <Box className={classes.root}>
            <Fade
                in={store.state === FETCH.DONE || store.state === FETCH.FAILED}
                onExit={() => {
                    if (coreService.backdropTheme === THEME.DARK) {
                        document.documentElement.style.backgroundColor = '#000';
                    } else {
                        document.documentElement.style.backgroundColor = '#fff';
                    }
                }}
                onExited={() => {
                    console.log('Reset current bg');
                    store.currentBg = null;
                }}
                onContextMenu={handlerContextMenu}
            >
                <div className={classes.root}>
                    {store.state !== FETCH.FAILED && (
                        <div
                            className={classes.dimmingSurface}
                            style={{ opacity: backgroundsStore.settings.dimmingPower / 100 || 0 }}
                        />
                    )}
                    {store.state === FETCH.FAILED && (
                        <FullscreenStub
                            className={classes.errorStub}
                            icon={BrokenIcon}
                            message={t('bg.errorLoad')}
                            description={
                                (store.bg && t('bg.errorLoadUnknownReason'))
                                || t('bg.notFound')
                            }
                            style={{ height: '100vh' }}
                            actions={store.bg && [
                                {
                                    title: t('bg.remove'),
                                    onClick: () => {
                                        backgroundsStore.removeFromStore(store.currentBg.id)
                                            .then(() => backgroundsStore.nextBG())
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
                            onLoad={action(() => {
                                console.log('load done');
                                store.state = FETCH.DONE;
                            })}
                            onError={action(() => {
                                if (store.currentBg.type === BG_TYPE.VIDEO) {
                                    store.nextBg = {
                                        ...store.currentBg,
                                        forceLoadAsVideo: true,
                                        src: FSConnector.getBGURL(store.currentBg.fileName),
                                    };
                                    store.state = FETCH.PENDING;
                                    store.currentBg = null;
                                } else {
                                    store.state = FETCH.FAILED;
                                }
                            })}
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
                                onPlay={() => { store.state = FETCH.DONE; }}
                                onLoadedMetadata={() => {
                                    console.log(store.currentBg);
                                    if (typeof store.currentBg.pause === 'number') {
                                        bgRef.current.currentTime = store.currentBg.pause;
                                        coreService.localEventBus.call('background/pause');
                                    }
                                }}
                                onError={() => { store.state = FETCH.FAILED; }}
                                ref={bgRef}
                            />
                        )
                    }
                </div>
            </Fade>
            {widgets.settings.useWidgets && (
                <Widgets />
            )}
            <Menu />
        </Box>
    );
}

export default observer(Desktop);
