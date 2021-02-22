import React, { memo } from 'react';
import {
    Card,
    Divider,
    Tooltip,
    Box,
    CircularProgress,
    ButtonBase,
    Collapse,
} from '@material-ui/core';
import {
    RefreshRounded as RefreshIcon,
    SettingsRounded as SettingsIcon,
    PauseRounded as PauseIcon,
    PlayArrowRounded as PlayIcon,
    SaveAltRounded as SaveBgIcon,
    CheckRounded as SavedBgIcon,
} from '@material-ui/icons';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';
import { makeStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import {
    ACTIVITY,
    BG_SELECT_MODE,
    BG_SHOW_MODE,
    BG_SHOW_STATE,
    BG_SOURCE,
    BG_TYPE,
} from '@/enum';
import MouseDistanceFade from '@/ui-components/MouseDistanceFade';
import { eventToBackground } from '@/stores/server/bus';
import useCoreService from '@/stores/app/BaseStateProvider';
import BackgroundsUniversalService from '@/stores/universal/backgrounds/service';
import useAppService from '@/stores/app/AppStateProvider';

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'absolute',
        bottom: theme.spacing(3),
        right: theme.spacing(3),
        zIndex: 2,
    },
    card: {
        borderRadius: theme.shape.borderRadius,
        backdropFilter: 'blur(10px) brightness(200%)',
        backgroundColor: fade(theme.palette.background.default, 0.52),
        display: 'flex',
        flexDirection: 'column',
        marginTop: theme.spacing(2),
    },
    button: { padding: theme.spacing(1.25) },
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
    notActive: { pointerEvents: 'none' },
    divider: {
        backgroundColor: fade(theme.palette.common.white, 0.12),
        marginTop: theme.spacing(0.5),
        marginBottom: theme.spacing(0.5),
    },
    outline: { boxShadow: `0px 0px 0px 1px ${theme.palette.divider}` },
}));

function Group({ children, ...other }) {
    const classes = useStyles();
    const appService = useAppService();

    return (
        <Card
            className={clsx(classes.card, appService.activity !== ACTIVITY.DESKTOP && classes.outline)}
            elevation={0}
            {...other}
        >
            {children}
        </Card>
    );
}

function Button({ tooltip, onClick, icon, className: externalClassName }) {
    const classes = useStyles();

    const Icon = icon;

    return (
        <Tooltip title={tooltip} placement="left">
            <ButtonBase size="small" className={clsx(classes.button, externalClassName)} onClick={onClick}>
                <Icon />
            </ButtonBase>
        </Tooltip>
    );
}

function FabMenu() {
    const classes = useStyles();
    const coreService = useCoreService();
    const appService = useAppService();
    const { backgrounds } = appService;
    const { t } = useTranslation();

    const bgShowMode = backgrounds.currentBG.type === BG_TYPE.VIDEO;
    const saveBgLocal = (
        backgrounds.settings.selectionMethod === BG_SELECT_MODE.STREAM
        && backgrounds.currentBG.source !== BG_SOURCE.USER
    );
    const nextBg = (
        backgrounds.settings.selectionMethod === BG_SELECT_MODE.RANDOM
        || backgrounds.settings.selectionMethod === BG_SELECT_MODE.STREAM
    );

    return (
        <React.Fragment>
            <MouseDistanceFade>
                <Box className={classes.root}>
                    <Group>
                        <Button
                            tooltip={t('settings.title')}
                            onClick={() => coreService.localEventBus.call('settings/open')}
                            icon={SettingsIcon}
                        />
                    </Group>
                    <Group>
                        <Button
                            tooltip={t('bookmark.addShort')}
                            onClick={() => coreService.localEventBus.call('bookmark/create')}
                            icon={AddBookmarkIcon}
                        />
                    </Group>
                    <Collapse
                        in={appService.activity === ACTIVITY.DESKTOP && (bgShowMode || saveBgLocal || nextBg)}
                        unmountOnExit
                    >
                        <Group>
                            {bgShowMode && (
                                <Button
                                    tooltip={
                                        backgrounds.bgShowMode === BG_SHOW_MODE.LIVE
                                            ? (
                                                <React.Fragment>
                                                    <b>{t('bg.pauseVideo')}</b>
                                                    <Divider className={classes.divider} />
                                                    {t('bg.pauseVideoDescription')}
                                                </React.Fragment>
                                            )
                                            : t('bg.playVideo')
                                    }
                                    onClick={() => {
                                        if (backgrounds.bgShowMode === BG_SHOW_MODE.LIVE) {
                                            coreService.localEventBus.call('background/pause');
                                        } else {
                                            coreService.localEventBus.call('background/play');
                                        }
                                    }}
                                    icon={backgrounds.bgShowMode === BG_SHOW_MODE.LIVE ? PauseIcon : PlayIcon}
                                />
                            )}
                            {saveBgLocal && (
                                <React.Fragment>
                                    {backgrounds.currentBG.type === BG_TYPE.VIDEO && (<Divider />)}
                                    <Button
                                        tooltip={
                                            backgrounds.currentBG.isSaved
                                                ? t('bg.addedToLibrary')
                                                : t('bg.addToLibrary')
                                        }
                                        className={clsx(
                                            backgrounds.currentBG.isSaved && classes.notActive,
                                        )}
                                        onClick={() => (
                                            !backgrounds.currentBG.isSaved
                                                && BackgroundsUniversalService.addToLibrary(backgrounds.currentBG)
                                        )}
                                        icon={backgrounds.currentBG.isSaved ? SavedBgIcon : SaveBgIcon}
                                    />
                                </React.Fragment>
                            )}
                            {nextBg && (
                                <React.Fragment>
                                    {saveBgLocal && (<Divider />)}
                                    <Button
                                        tooltip={t('bg.next')}
                                        className={clsx(
                                            backgrounds.bgState === BG_SHOW_STATE.SEARCH && classes.notActive,
                                        )}
                                        onClick={() => eventToBackground('backgrounds/nextBg')}
                                        icon={() => (
                                            <React.Fragment>
                                                {backgrounds.bgState !== BG_SHOW_STATE.SEARCH && (
                                                    <RefreshIcon />
                                                )}
                                                {backgrounds.bgState === BG_SHOW_STATE.SEARCH && (
                                                    <CircularProgress
                                                        className={classes.loadBGIcon}
                                                        size={20}
                                                    />
                                                )}
                                            </React.Fragment>
                                        )}
                                    />
                                </React.Fragment>
                            )}
                        </Group>
                    </Collapse>
                </Box>
            </MouseDistanceFade>
        </React.Fragment>
    );
}

export default memo(observer(FabMenu));
