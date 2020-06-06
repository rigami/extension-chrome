import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import {
    BrokenImageRounded as BrokenIcon,
    DeleteRounded as DeleteIcon,
} from '@material-ui/icons';
import FSConnector from '@/utils/fsConnector';
import { BG_TYPE, THEME } from '@/dict';
import clsx from 'clsx';
import locale from '@/i18n/RU';
import { Fade, Box } from '@material-ui/core';
import FullscreenStub from '@/ui-components/FullscreenStub';
import { useSnackbar } from 'notistack';
import { useService as useBackgroundsService } from '@/stores/backgrounds';
import { useService as useAppConfigService } from '@/stores/app';
import Menu from '@/ui/Menu';


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

    const bgRef = useRef();
    const [bg, setBg] = useState(null);
    const [nextBg, setNextBg] = useState(null);
    const [state, setState] = useState('pending');
    const [captureFrameTimer, setCaptureFrameTimer] = useState(null);
    const [bgId, setBgId] = useState(null);

    useEffect(() => {
        if (backgroundsStore.currentBGId === bgId) return;

        const currentBg = backgroundsStore.getCurrentBG();

        setBgId(backgroundsStore.currentBGId);

        if (backgroundsStore.bgState === 'pending') return;

        if (!currentBg) {
            setState('failed');
            setBg(null);
            setNextBg(null);
            return;
        }

        const fileName = typeof currentBg.pause === 'number' ? 'temporaryVideoFrame' : currentBg.fileName;
        const src = FSConnector.getURL(fileName);

        if (!bg && !nextBg) {
            setBg({
                ...currentBg,
                src,
            });
        } else {
            if (bg && nextBg && state === 'pending') {
                setBg({
                    ...currentBg,
                    src,
                });
                setNextBg(null);
            } else {
                setNextBg({
                    ...currentBg,
                    src,
                });
            }
            setState('pending');
        }
    }, [backgroundsStore.currentBGId]);

    useEffect(() => {
        if (bgRef.current && bg && bg.type === BG_TYPE.VIDEO) {
            if (backgroundsStore.bgState === 'pause') {
                if (typeof bg.pause === 'number') {
                    bgRef.current.currentTime = bg.pause;
                } else {
                    bgRef.current.onpause = () => {
                        const captureBGId = bg.id;
                        setCaptureFrameTimer(setTimeout(() => {
                            backgroundsStore.saveTemporaryVideoFrame(captureBGId, bgRef.current.currentTime)
                                .then((temporaryBG) => {
                                    setNextBg({
                                        ...temporaryBG,
                                        src: FSConnector.getURL('temporaryVideoFrame'),
                                    });
                                    setState('pending');
                                })
                                .catch((e) => console.log(e));
                        }, 5000));
                    };

                    bgRef.current.play()
                        .then(() => {
                            bgRef.current.pause();
                        });
                }
            } else {
                const currentBg = backgroundsStore.getCurrentBG();

                if (currentBg.id !== bg.id) {
                    if (bgRef.current.play) bgRef.current.play();

                    setNextBg({
                        ...currentBg,
                        src: FSConnector.getURL(currentBg.fileName),
                    });
                    setState('pending');
                }
            }
        }


        return () => {
            if (typeof captureFrameTimer === 'number') clearTimeout(+captureFrameTimer);
            setCaptureFrameTimer(null);
        };
    }, [backgroundsStore.bgState]);


    return (
        <Box className={classes.root}>
            <Fade
                in={state === 'done' || state === 'failed'}
                onExit={() => {
                    if (appConfigStore.backdropTheme === THEME.DARK) {
                        document.documentElement.style.backgroundColor = '#000';
                    } else {
                        document.documentElement.style.backgroundColor = '#fff';
                    }
                }}
                onExited={() => {
                    if (nextBg) {
                        setBg(nextBg);
                        setNextBg(null);
                        setState('pending');
                    }
                }}
            >
                <div className={classes.root}>
                    {state !== 'failed' && (
                        <div
                            className={classes.dimmingSurface}
                            style={{ opacity: backgroundsStore.dimmingPower / 100 || 0 }}
                        />
                    )}
                    {state === 'failed' && (
                        <FullscreenStub
                            iconRender={(props) => (<BrokenIcon {...props} />)}
                            message="Ошибка загрузка фона"
                            description={
                                (bg && locale.settings.backgrounds.desktop.error_load_bg_unknown_reason)
                                || locale.settings.backgrounds.desktop.not_found_bg
                            }
                            style={{ height: '100vh' }}
                            actions={bg && [
                                {
                                    title: 'Удалить фон',
                                    onClick: () => {
                                        backgroundsStore.removeFromStore(bg.id)
                                            .then(() => backgroundsStore.nextBG())
                                            .then(() => enqueueSnackbar({
                                                message: 'Битый фон удален',
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
                        bg
                        && (bg.type === BG_TYPE.IMAGE
                            || bg.type === BG_TYPE.ANIMATION
                            || (bg.type === BG_TYPE.VIDEO && typeof bg.pause === 'number')
                        )
                    ) && (
                        <img
                            alt={bg.fileName}
                            className={clsx(classes.bg, classes.image)}
                            src={bg.src}
                            style={{ imageRendering: bg.antiAliasing ? 'auto' : 'pixelated' }}
                            onLoad={() => setState('done')}
                            onError={() => setState('failed')}
                            ref={bgRef}
                        />
                    )}
                    {bg && bg.type === BG_TYPE.VIDEO && typeof bg.pause !== 'number' && (
                        <video
                            autoPlay={!bg.pause}
                            loop
                            muted
                            src={bg.src}
                            className={clsx(classes.bg, classes.video)}
                            style={{ imageRendering: bg.antiAliasing ? 'auto' : 'pixelated' }}
                            onPlay={() => setState('done')}
                            onError={() => setState('failed')}
                            ref={bgRef}
                        />
                    )}
                </div>
            </Fade>
            <Menu />
        </Box>
    );
}

export default observer(Desktop);
