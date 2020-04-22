import React, {useState, useEffect, useRef} from "preact/compat";
import {h, Component, render, Fragment} from "preact";
import {makeStyles} from "@material-ui/core/styles";
import {inject, observer} from "mobx-react";
import {
    BrokenImageRounded as BrokenIcon,
    DeleteRounded as DeleteIcon,
} from "@material-ui/icons";
import FSConnector from "../utils/fsConnector";
import {BG_TYPE} from "../dict";
import clsx from "clsx";
import {Fade} from "@material-ui/core";
import FullscreenStub from "ui-components/FullscreenStub";
import {useSnackbar} from "notistack";
import createPreview from "utils/createPreview";

const useStyles = makeStyles(theme => ({
    root: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.palette.type === 'dark' ? theme.palette.common.black : theme.palette.common.white,
        overflow: 'hidden',
    },
    bg: {
        width: '100%',
        height: '100%',
        pointerEvents: "none",
    },
    image: {
        backgroundPosition: '50%',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
    },
    video: {
        objectFit: 'cover',
    },
    deleteBG: {
        color: theme.palette.getContrastText(theme.palette.error.main),
        backgroundColor: theme.palette.error.main,
        '&:hover': {
            backgroundColor: theme.palette.error.dark,
        },
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

function Desktop({backgroundsStore, onChangedBG}) {
    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar();

    const bgRef = useRef();
    const [bg, setBg] = useState(null);
    const [nextBg, setNextBg] = useState(null);
    const [state, setState] = useState("pending");
    const [captureFrameTimer, setCaptureFrameTimer] = useState(null);

    useEffect(() => {
        const currentBg = backgroundsStore.getCurrentBG();

        if (backgroundsStore.bgState === "pending") return;

        if (!currentBg) {
            setState("failed");
            setBg(null);
            setNextBg(null);
            return;
        }

        const src = FSConnector.getURL(typeof currentBg.pause === "number" ? "temporaryVideoFrame" : currentBg.fileName);

        if (!bg && !nextBg) {
            setBg({
                ...currentBg,
                src,
            });
        } else {
            if (bg && nextBg && state === "pending") {
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
            setState("pending");
        }
    }, [backgroundsStore.currentBGId]);

    useEffect(() => {
        if (!bgRef.current || !bg || bg.type !== BG_TYPE.VIDEO) return;

        console.log(backgroundsStore.bgState, bg)

        if (backgroundsStore.bgState === "pause") {
            if (typeof bg.pause === "number") {
                bgRef.current.currentTime = bg.pause;
                return;
            }

            bgRef.current.onpause = () => {
                const captureBGId = bg.id;
                setCaptureFrameTimer(setTimeout(() => {
                    backgroundsStore.saveTemporaryVideoFrame(captureBGId, bgRef.current.currentTime)
                        .then((bg) => {
                            console.log("finish transform video to frame", bg)
                            setNextBg({
                                ...bg,
                                src: FSConnector.getURL("temporaryVideoFrame"),
                            });
                            setState("pending");
                        })
                        .catch((e) => console.log(e));
                }, 5000));
            };

            bgRef.current.play().then(() => {
                bgRef.current.pause();
            });
        } else {
            const currentBg = backgroundsStore.getCurrentBG();

            if (currentBg.id !== bg.id) return;

            if (bgRef.current.play) bgRef.current.play();

            setNextBg({
                ...currentBg,
                src: FSConnector.getURL(currentBg.fileName),
            });
            setState("pending");
        }

        return () => {
            if (captureFrameTimer) clearTimeout(captureFrameTimer);
            setCaptureFrameTimer(null);
        };
    }, [backgroundsStore.bgState]);

    return (
        <Fragment>
            <Fade
                in={state === "done" || state === "failed"}
                onExited={() => {
                    if (nextBg) {
                        setBg(nextBg);
                        setNextBg(null);
                        setState("pending");
                    }
                }}
            >
                <div className={classes.root}>
                    {state !== "failed" && (
                        <div
                            className={classes.dimmingSurface}
                            style={{opacity: backgroundsStore.dimmingPower / 100}}
                        />
                    )}
                    {state === "failed" && (
                        <FullscreenStub
                            iconRender={(props) => (<BrokenIcon {...props} />)}
                            message="Ошибка загрузка фона"
                            description={bg ? "Ну удается отобразить фон по неизвестной причине" : "Нет фона для отрисовки"}
                            style={{height: "100vh"}}
                            actions={bg && [
                                {
                                    title: "Удалить фон",
                                    onClick: () => {
                                        console.log("Remove bg:", bg);
                                        backgroundsStore.removeFromStore(bg.id)
                                            .then(() => backgroundsStore.nextBG())
                                            .then(() => enqueueSnackbar({
                                                message: "Битый фон удален",
                                                variant: "warning",
                                            }));
                                    },
                                    variant: "contained",
                                    className: classes.deleteBG,
                                    startIcon: (<DeleteIcon/>),
                                }
                            ]}
                        />
                    )}
                    {(
                        bg
                        && (
                            bg.type === BG_TYPE.IMAGE
                            || bg.type === BG_TYPE.ANIMATION
                            || (bg.type === BG_TYPE.VIDEO && typeof bg.pause === "number")
                        )
                    ) && (
                        <img
                            className={clsx(classes.bg, classes.image)}
                            src={bg.src}
                            style={{imageRendering: bg.antiAliasing ? 'auto' : 'pixelated'}}
                            onLoad={() => setState("done")}
                            onError={() => setState("failed")}
                            ref={bgRef}
                        />
                    )}
                    {bg && bg.type === BG_TYPE.VIDEO && typeof bg.pause !== "number" && (
                        <video
                            autoPlay={!bg.pause}
                            loop
                            muted
                            src={bg.src}
                            className={clsx(classes.bg, classes.video)}
                            style={{imageRendering: bg.antiAliasing ? 'auto' : 'pixelated'}}
                            onPlay={() => setState("done")}
                            onError={() => setState("failed")}
                            ref={bgRef}
                        />
                    )}
                </div>
            </Fade>
        </Fragment>
    );
}

export default inject('backgroundsStore')(observer(Desktop));