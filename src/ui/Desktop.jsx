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
import { Fade } from "@material-ui/core";
import FullscreenStub from "ui-components/FullscreenStub";
import {useSnackbar} from "notistack";

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
}));

function Desktop({backgroundsStore, onChangedBG }) {
    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar();

    const bgRef = useRef();
    const [bg, setBg] = useState(null);
    const [nextBg, setNextBg] = useState(null);
    const [state, setState] = useState("pending");

    useEffect(() => {
        const currentBg = backgroundsStore.getCurrentBG();

        if (!currentBg) {
            setState("failed");
            return;
        }

        if (!bg && !nextBg) {
            setBg({
                ...currentBg,
                src: FSConnector.getURL(currentBg.fileName),
            });
        } else {
            if (bg && nextBg && state === "pending") {
                setBg({
                    ...currentBg,
                    src: FSConnector.getURL(currentBg.fileName),
                });
                setNextBg(null);
            } else {
                setNextBg({
                    ...currentBg,
                    src: FSConnector.getURL(currentBg.fileName),
                });
            }
            setState("pending");
        }
    }, [backgroundsStore.currentBGId]);

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
                    {state === "failed" && bg && (
                        <FullscreenStub
                            iconRender={(props) => (<BrokenIcon {...props} />)}
                            message="Ошибка загрузка фона"
                            description="Ну удается отобразить фон по неизвестной причине"
                            style={{ height: "100vh" }}
                            actions={[
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
                                    startIcon: (<DeleteIcon />),
                                }
                            ]}
                        />
                    )}
                    {state === "failed" && !bg && (
                        <FullscreenStub
                            iconRender={(props) => (<BrokenIcon {...props} />)}
                            message="Ошибка загрузка фона"
                            description="Нет фона для отрисовки"
                            style={{ height: "100vh" }}
                        />
                    )}
                    {bg && (bg.type === BG_TYPE.IMAGE || bg.type === BG_TYPE.ANIMATION) && (
                        <img
                            className={clsx(classes.bg, classes.image)}
                            src={bg.src}
                            style={{ imageRendering: bg.antiAliasing ? 'auto' : 'pixelated' }}
                            onLoad={() => setState("failed")}
                            onError={() => setState("failed")}
                            ref={bgRef}
                        />
                    )}
                    {bg && (bg.type === BG_TYPE.VIDEO) && (
                        <video
                            autoPlay
                            loop
                            muted
                            src={bg.src}
                            className={clsx(classes.bg, classes.video)}
                            style={{ imageRendering: bg.antiAliasing ? 'auto' : 'pixelated' }}
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