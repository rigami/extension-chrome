import React, {useState, useEffect} from "preact/compat";
import {h, Component, render, Fragment} from "preact";
import {makeStyles} from "@material-ui/core/styles";
import {inject, observer} from "mobx-react";
import FSConnector from "../utils/fsConnector";

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
        backgroundPosition: '50%',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        opacity: 0,
        transition: theme.transitions.create('opacity', {
            duration: theme.transitions.duration.complex,
            easing: theme.transitions.easing.easeOut,
        }),
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
            <div
                className={classes.bg}
                style={{
                    backgroundImage: bg && `url('${bg.src}')`,
                    opacity: bg ? 1 : 0,
                    imageRendering: bg && bg.antiAliasing ? 'auto' : 'pixelated',
                }}
            />
        </div>
    );
}

export default inject('backgroundsStore')(observer(Desktop));