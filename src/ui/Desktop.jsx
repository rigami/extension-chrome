import React, {useState, useEffect} from "preact/compat";
import {h, Component, render, Fragment} from "preact";
import {makeStyles} from "@material-ui/core/styles";
import {inject, observer} from "mobx-react";
import FSConnector from "../utils/fsConnector";
import {BG_TYPE} from "../dict";
import clsx from "clsx";
import { Fade } from "@material-ui/core";

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
    }
}));

function Desktop({backgroundsStore, onChangedBG }) {
    const classes = useStyles();

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
            if (bg && nextBg && (state === "pending")) {
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
        <Fade
            in={state === "done"}
            onExited={() => {
                if (nextBg) {
                    setBg(nextBg);
                    setNextBg(null);
                    setState("pending");
                }
            }}
        >
            <div className={classes.root}>
                {bg && (bg.type === BG_TYPE.IMAGE || bg.type === BG_TYPE.ANIMATION) && (
                    <img
                        className={clsx(classes.bg, classes.image)}
                        src={bg.src}
                        style={{ imageRendering: bg.antiAliasing ? 'auto' : 'pixelated' }}
                        onLoad={() => setState("done")}
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
                    />
                )}
            </div>
        </Fade>
    );
}

export default inject('backgroundsStore')(observer(Desktop));