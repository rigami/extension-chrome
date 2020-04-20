import React, {useEffect, useRef, useState} from "preact/compat";
import { h, Component, render, Fragment } from "preact";
import {Card, IconButton, Divider, Tooltip} from "@material-ui/core";
import { Refresh as RefreshIcon, Settings as SettingsIcon } from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles";
import {inject, observer} from "mobx-react";
import {fade} from '@material-ui/core/styles/colorManipulator';

const useStyles = makeStyles(theme => ({
    root: {
        position: 'absolute',
        borderRadius: theme.spacing(3),
        padding: theme.spacing(.5),
        bottom: theme.spacing(3),
        right: theme.spacing(3),
        backdropFilter: 'blur(10px) brightness(200%)',
        backgroundColor: fade(theme.palette.common.white, 0.52),
    },
    divider: {
        marginTop: theme.spacing(.5),
        marginBottom: theme.spacing(.5),
    }
}));

function FabMenu({ onOpenMenu, onRefreshBackground }) {
    const classes = useStyles();
    const [distance, setDistance] = useState(999);
    const rootAl = useRef();

    const moveMouseHandler = (e) => {
        if (!rootAl.current) return;

        const {x, y, height, width} = rootAl.current.getBoundingClientRect();
        const a = Math.abs((x + width * 0.5) - e.pageX);
        const b = Math.abs((y + height * 0.5) - e.pageY);
        let dist = 0.96 * Math.max(a, b) + 0.4 * Math.min(a, b);
        dist = ( dist > 700 ? 700 : dist < 160 ? 160 : dist ) - 160;

        setDistance(1 - dist / 540);
    };

    useEffect(() => {
        document.addEventListener("mousemove", moveMouseHandler);

        return () => {
            document.removeEventListener("mousemove", moveMouseHandler);
        };
    }, []);

    return (
        <Card className={classes.root} elevation={6} ref={rootAl} style={{ opacity: distance }}>
            <Tooltip title='Настройки' placement='left'>
                <IconButton size='small' onClick={() => onOpenMenu()}>
                    <SettingsIcon />
                </IconButton>
            </Tooltip>
            <Divider className={classes.divider}/>
            <Tooltip title='Обновить фон' placement='left'>
                <IconButton size='small' onClick={() => onRefreshBackground()}>
                    <RefreshIcon />
                </IconButton>
            </Tooltip>
        </Card>
    );
}

export default FabMenu;