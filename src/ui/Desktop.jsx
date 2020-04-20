import React, {useState, useEffect} from "preact/compat";
import {h, Component, render, Fragment} from "preact";
import {makeStyles} from "@material-ui/core/styles";
import {inject, observer} from "mobx-react";
import FSConnector from "../utils/fsConnector";
import {BG_TYPE} from "../dict";
import clsx from "clsx";

const useStyles = makeStyles(theme => ({
    root: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme.palette.type === 'dark' ? theme.palette.common.black : theme.palette.common.white,
    },
    bg: {
        width: '100%',
        height: '100%',
        opacity: 0,
        transition: theme.transitions.create('opacity', {
            duration: theme.transitions.duration.complex,
            easing: theme.transitions.easing.easeOut,
        }),
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

function Desktop({backgroundsStore}) {
    const classes = useStyles();
    const [bg, setBg] = useState(null);

    useEffect(() => {
        const bg = backgroundsStore.getCurrentBG();

        if (!bg) {
            setBg(null);
            return;
        }

        setBg({
            ...bg,
            src: FSConnector.getURL(bg.fileName),
        });
    }, [backgroundsStore.currentBGId]);

    return (
        <div className={classes.root}>
            {bg && (bg.type === BG_TYPE.IMAGE || bg.type === BG_TYPE.ANIMATION) && (
                <div
                    className={clsx(classes.bg, classes.image)}
                    style={{
                        backgroundImage: `url('${bg.src}')`,
                        opacity: bg ? 1 : 0,
                        imageRendering: bg.antiAliasing ? 'auto' : 'pixelated',
                    }}
                />
            )}
            {bg && (bg.type === BG_TYPE.VIDEO) && (
                <video
                    autoPlay
                    loop
                    muted
                    src={bg.src}
                    className={clsx(classes.bg, classes.video)}
                    style={{
                        opacity: bg ? 1 : 0,
                        imageRendering: bg.antiAliasing ? 'auto' : 'pixelated',
                    }}
                />
            )}
        </div>
    );
}

export default inject('backgroundsStore')(observer(Desktop));