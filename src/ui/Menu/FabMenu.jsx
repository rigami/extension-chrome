import React, { memo } from 'react';
import {
    Card,
    IconButton,
    Divider,
    Tooltip,
    Box,
    CircularProgress,
} from '@material-ui/core';
import {
    Refresh as RefreshIcon,
    Settings as SettingsIcon,
} from '@material-ui/icons';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { BG_SELECT_MODE, BG_SHOW_STATE } from '@/enum';
import useAppStateService from '@/stores/app/AppStateProvider';
import MouseDistanceFade from '@/ui-components/MouseDistanceFade';

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
    },
    loadBGIconWhite: {
        position: 'absolute',
        bottom: theme.spacing(4.25),
        right: theme.spacing(4.25),
        zIndex: 1,
        color: theme.palette.common.white,
    },
    loadBGIcon: {
        color: theme.palette.common.black,
        margin: theme.spacing(0.25),
    },
    loadBgButton: {
        pointerEvents: 'none',
    },
}));

function FabMenu({ onOpenMenu, onRefreshBackground, fastSettings, useChangeBG }) {
    const classes = useStyles();
    const theme = useTheme();
    const { backgrounds } = useAppStateService();
    const { t } = useTranslation();

    return (
        <React.Fragment>
            <MouseDistanceFade>
                <Box className={classes.root}>
                    <Card
                        className={classes.card}
                        elevation={12}
                        style={{ marginBottom: theme.spacing(2) }}
                    >
                        {fastSettings && fastSettings.map(({ tooltip, icon: Icon, ...props }, index) => (
                            <React.Fragment>
                                {index !== 0 && (<Divider />)}
                                <Tooltip title={tooltip} placement="left" key={tooltip}>
                                    <IconButton size="small" className={classes.button} {...props}>
                                        {Icon}
                                    </IconButton>
                                </Tooltip>
                            </React.Fragment>
                        ))}
                    </Card>
                    <Card
                        className={classes.card}
                        elevation={12}
                    >
                        <Tooltip title={t('settings.title')} placement="left">
                            <IconButton size="small" className={classes.button} onClick={() => onOpenMenu()}>
                                <SettingsIcon />
                            </IconButton>
                        </Tooltip>
                        {(
                            backgrounds.settings.selectionMethod === BG_SELECT_MODE.RANDOM
                            || backgrounds.settings.selectionMethod === BG_SELECT_MODE.RADIO
                        ) && (
                            <React.Fragment>
                                <Divider />
                                <Tooltip title={t('bg.next')} placement="left">
                                    <IconButton
                                        size="small"
                                        className={clsx(
                                            classes.button,
                                            backgrounds.bgState === BG_SHOW_STATE.SEARCH && classes.loadBgButton,
                                        )}
                                        onClick={() => onRefreshBackground()}
                                    >
                                        {backgrounds.bgState !== BG_SHOW_STATE.SEARCH &&  (
                                            <RefreshIcon />
                                        )}
                                        {backgrounds.bgState === BG_SHOW_STATE.SEARCH && (
                                            <CircularProgress
                                                className={classes.loadBGIcon}
                                                size={20}
                                            />
                                        )}
                                    </IconButton>
                                </Tooltip>
                            </React.Fragment>
                        )}
                    </Card>
                </Box>
            </MouseDistanceFade>
            {backgrounds.bgState === BG_SHOW_STATE.SEARCH && (
                <CircularProgress
                    className={classes.loadBGIconWhite}
                    size={20}
                />
            )}
        </React.Fragment>
    );
}

export default memo(observer(FabMenu));
