import React, {useEffect, useRef, useState} from "preact/compat";
import { h, Component, render, Fragment } from "preact";
import {
    Card,
    IconButton,
    Divider,
    Tooltip,
    Box
} from "@material-ui/core";
import {
    Refresh as RefreshIcon,
    Settings as SettingsIcon
} from "@material-ui/icons";
import {makeStyles, useTheme} from "@material-ui/core/styles";
import {inject, observer} from "mobx-react";
import {fade} from '@material-ui/core/styles/colorManipulator';

const useStyles = makeStyles(theme => ({
    root: {
        position: 'absolute',
        bottom: theme.spacing(3),
        right: theme.spacing(3),
    },
    card: {
        borderRadius: theme.spacing(3),
        backdropFilter: 'blur(10px) brightness(200%)',
        backgroundColor: fade(theme.palette.background.default, 0.52),
    },
    button: {
        padding: theme.spacing(1),
    }
}));

function FabMenu({ onOpenMenu, onRefreshBackground, fastSettings }) {
    const classes = useStyles();
    const theme = useTheme();
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
        <Box className={classes.root} ref={rootAl}>
            <Card
                className={classes.card}
                elevation={12}
                style={{ marginBottom: theme.spacing(2), opacity: distance }}
            >
                {fastSettings && fastSettings.map(({ tooltip, icon: Icon, ...props }, index) => (
                    <Tooltip title={tooltip} placement='left' key={index+tooltip}>
                        <IconButton size='small' className={classes.button} {...props}>
                            {Icon}
                        </IconButton>
                    </Tooltip>
                ))}
            </Card>
            <Card
                className={classes.card}
                elevation={12}
                style={{ opacity: distance }}
            >
                <Tooltip title='Настройки' placement='left'>
                    <IconButton size='small' className={classes.button} onClick={() => onOpenMenu()}>
                        <SettingsIcon />
                    </IconButton>
                </Tooltip>
                <Divider/>
                <Tooltip title='Обновить фон' placement='left'>
                    <IconButton size='small' className={classes.button} onClick={() => onRefreshBackground()}>
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Card>
        </Box>
    );
}

export default FabMenu;