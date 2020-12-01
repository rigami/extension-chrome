import React, { useEffect, useRef, memo } from 'react';
import {
    Card,
    IconButton,
    Divider,
    Tooltip,
    Box,
} from '@material-ui/core';
import {
    Refresh as RefreshIcon,
    Settings as SettingsIcon,
} from '@material-ui/icons';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { useTranslation } from 'react-i18next';
import { useLocalStore, useObserver } from 'mobx-react-lite';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'absolute',
        bottom: theme.spacing(3),
        right: theme.spacing(3),
        zIndex: 2,
    },
    card: {
        borderRadius: theme.spacing(3),
        backdropFilter: 'blur(10px) brightness(200%)',
        backgroundColor: fade(theme.palette.background.default, 0.52),
    },
    button: { padding: theme.spacing(1) },
    smooth: {
        transition: theme.transitions.create(['opacity'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.complex,
        }),
    }
}));

function FabMenu({ onOpenMenu, onRefreshBackground, fastSettings, useChangeBG }) {
    const classes = useStyles();
    const theme = useTheme();
    const { t } = useTranslation();
    const rootAl = useRef();
    const fastAl = useRef();
    const mainAl = useRef();
    const store = useLocalStore(() => ({
        hideTimer: null,
        smooth: false,
    }));

    const moveMouseHandler = (e) => {
        if (!rootAl.current) return;

        store.smooth = false;
        clearTimeout(store.hideTimer);

        const { x, y, height, width } = rootAl.current.getBoundingClientRect();
        const a = Math.abs((x + width * 0.5) - e.pageX);
        const b = Math.abs((y + height * 0.5) - e.pageY);
        let dist = 0.96 * Math.max(a, b) + 0.4 * Math.min(a, b);

        if (dist > 700) {
            dist = 700;
        } else if (dist < 160) {
            dist = 160;
        }

        dist -= 160;

        const opacity = 1 - dist / 540;

        if (fastAl.current) fastAl.current.style.opacity = opacity;
        if (mainAl.current) mainAl.current.style.opacity = opacity;

        store.hideTimer = setTimeout(() => {
            if (e.path.indexOf(mainAl.current) !== -1 || e.path.indexOf(fastAl.current) !== -1) return;

            store.smooth = true;
            if (fastAl.current) fastAl.current.style.opacity = 0;
            if (mainAl.current) mainAl.current.style.opacity = 0;
        }, 3000);
    };

    useEffect(() => {
        if (fastAl.current) fastAl.current.style.opacity = 0;
        if (mainAl.current) mainAl.current.style.opacity = 0;
        window.addEventListener('mousemove', moveMouseHandler);

        return () => {
            window.removeEventListener('mousemove', moveMouseHandler);
        };
    }, []);

    return useObserver(() => (
        <Box className={classes.root} ref={rootAl}>
            <Card
                className={clsx(classes.card, store.smooth && classes.smooth)}
                elevation={12}
                style={{ marginBottom: theme.spacing(2) }}
                ref={fastAl}
            >
                {fastSettings && fastSettings.map(({ tooltip, icon: Icon, ...props }) => (
                    <Tooltip title={tooltip} placement="left" key={tooltip}>
                        <IconButton size="small" className={classes.button} {...props}>
                            {Icon}
                        </IconButton>
                    </Tooltip>
                ))}
            </Card>
            <Card
                className={clsx(classes.card, store.smooth && classes.smooth)}
                elevation={12}
                ref={mainAl}
            >
                <Tooltip title={t('settings.title')} placement="left">
                    <IconButton size="small" className={classes.button} onClick={() => onOpenMenu()}>
                        <SettingsIcon />
                    </IconButton>
                </Tooltip>
                {useChangeBG && (
                    <React.Fragment>
                        <Divider />
                        <Tooltip title={t('bg.next')} placement="left">
                            <IconButton size="small" className={classes.button} onClick={() => onRefreshBackground()}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </React.Fragment>
                )}
            </Card>
        </Box>
    ));
}

export default memo(FabMenu);
