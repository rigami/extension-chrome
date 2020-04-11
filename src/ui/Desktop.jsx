import React, {useState, useEffect} from "preact/compat";
import {h, Component, render, Fragment} from "preact";
import {makeStyles} from "@material-ui/core/styles";
import {inject, observer} from "mobx-react";

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
    const [bgSrc, setBgSrc] = useState(null);

    useEffect(() => {
        const bg = backgroundsStore.getCurrentBG();

        if (!bg) {
            setBgSrc(null);
            return;
        }

        setBgSrc(bg.src);
    }, [backgroundsStore.currentBGId]);

    return (
        <div className={classes.root}>
            <div className={classes.bg} style={{ backgroundImage: `url('${bgSrc}')`, opacity: bgSrc ? 1 : 0 }}/>
        </div>
    );
}

export default inject('backgroundsStore')(observer(Desktop));