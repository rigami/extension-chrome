import React, { memo } from 'react';
import {
    Divider,
    Box,
    CircularProgress,
    Fade,
} from '@material-ui/core';
import {
    RefreshRounded as RefreshIcon,
    SettingsRounded as SettingsIcon,
    PauseRounded as PauseIcon,
    PlayArrowRounded as PlayIcon,
    SaveAltRounded as SaveBgIcon,
    CheckRounded as SavedBgIcon,
    BookmarksRounded as BookmarksIcon,
    HomeRounded as DesktopIcon,
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
    FETCH,
} from '@/enum';
import MouseDistanceFade from '@/ui-components/MouseDistanceFade';
import { eventToBackground } from '@/stores/server/bus';
import useCoreService from '@/stores/app/BaseStateProvider';
import useAppService from '@/stores/app/AppStateProvider';
import { ExtendButton, ExtendButtonGroup } from '@/ui-components/ExtendButton';

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'absolute',
        top: theme.spacing(2),
        right: theme.spacing(2),
        zIndex: 2,
        display: 'grid',
        gridGap: theme.spacing(2),
        pointerEvents: 'none',
    },
    button: { pointerEvents: 'all' },
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
    notClickable: { cursor: 'default' },
    divider: {
        backgroundColor: fade(theme.palette.common.white, 0.12),
        marginTop: theme.spacing(0.5),
        marginBottom: theme.spacing(0.5),
    },
}));

function FabMenu() {
    const classes = useStyles();
    const coreService = useCoreService();
    const appService = useAppService();
    const { backgrounds } = appService;
    const { t } = useTranslation(['bookmark', 'settings', 'background']);

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
                    <Fade
                        in={appService.activity === ACTIVITY.DESKTOP && (bgShowMode || saveBgLocal || nextBg)}
                    >
                        <ExtendButtonGroup
                            className={clsx(
                                appService.activity === ACTIVITY.DESKTOP
                                && (bgShowMode || saveBgLocal || nextBg)
                                && classes.button,
                            )}
                        >
                            {nextBg && (
                                <React.Fragment>
                                    {(saveBgLocal || bgShowMode) && (<Divider />)}
                                    <ExtendButton
                                        tooltip={
                                            backgrounds.bgState === BG_SHOW_STATE.SEARCH
                                                ? t('background:fetchingNextBG')
                                                : t('background:button.next')
                                        }
                                        data-ui-path="bg.next"
                                        className={clsx(
                                            backgrounds.bgState === BG_SHOW_STATE.SEARCH && classes.notClickable,
                                        )}
                                        disableRipple={backgrounds.bgState === BG_SHOW_STATE.SEARCH}
                                        onClick={() => (
                                            backgrounds.bgState !== BG_SHOW_STATE.SEARCH
                                            && eventToBackground('backgrounds/nextBg')
                                        )}
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
                            {saveBgLocal && (
                                <React.Fragment>
                                    {nextBg && (<Divider />)}
                                    {coreService.storage.temp.addingBgToLibrary === FETCH.PENDING && (
                                        <ExtendButton
                                            tooltip={t('background:addingToLibrary')}
                                            className={classes.notClickable}
                                            disableRipple
                                            icon={() => (
                                                <CircularProgress
                                                    className={classes.loadBGIcon}
                                                    size={20}
                                                />
                                            )}
                                        />
                                    )}
                                    {coreService.storage.temp.addingBgToLibrary !== FETCH.PENDING && (
                                        <ExtendButton
                                            tooltip={
                                                backgrounds.currentBG.isSaved
                                                    ? t('background:addedToLibrary')
                                                    : t('background:button.addToLibrary')
                                            }
                                            data-ui-path={
                                                backgrounds.currentBG.isSaved
                                                    ? 'bg.addedToLibrary'
                                                    : 'bg.addToLibrary'
                                            }
                                            className={clsx(
                                                backgrounds.currentBG.isSaved && classes.notClickable,
                                            )}
                                            disableRipple={backgrounds.currentBG.isSaved}
                                            onClick={() => {
                                                if (!backgrounds.currentBG.isSaved) {
                                                    backgrounds.addToLibrary(backgrounds.currentBG);
                                                }
                                            }}
                                            icon={backgrounds.currentBG.isSaved ? SavedBgIcon : SaveBgIcon}
                                        />
                                    )}
                                </React.Fragment>
                            )}
                            {bgShowMode && (
                                <React.Fragment>
                                    {(saveBgLocal || nextBg) && (<Divider />)}
                                    <ExtendButton
                                        tooltip={
                                            backgrounds.bgShowMode === BG_SHOW_MODE.LIVE
                                                ? t('background:button.pause')
                                                : t('background:button.play')
                                        }
                                        data-ui-path={
                                            backgrounds.bgShowMode === BG_SHOW_MODE.LIVE
                                                ? 'bg.pauseVideo'
                                                : 'bg.playVideo'
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
                                </React.Fragment>
                            )}
                        </ExtendButtonGroup>
                    </Fade>
                    <ExtendButtonGroup className={classes.button}>
                        <ExtendButton
                            tooltip={t('settings:title')}
                            data-ui-path="settings.open"
                            onClick={() => coreService.localEventBus.call('settings/open')}
                            icon={SettingsIcon}
                        />
                    </ExtendButtonGroup>
                    {appService.activity !== ACTIVITY.DESKTOP && (
                        <ExtendButtonGroup className={classes.button}>
                            <ExtendButton
                                tooltip={t('desktop:button.open')}
                                data-ui-path="desktop.open"
                                onClick={() => appService.setActivity(ACTIVITY.DESKTOP)}
                                icon={DesktopIcon}
                            />
                        </ExtendButtonGroup>
                    )}
                    {appService.activity === ACTIVITY.DESKTOP && (
                        <ExtendButtonGroup className={classes.button}>
                            <ExtendButton
                                tooltip={t('bookmark:button.open')}
                                data-ui-path="bookmark.open"
                                onClick={() => appService.setActivity(ACTIVITY.BOOKMARKS)}
                                icon={BookmarksIcon}
                            />
                        </ExtendButtonGroup>
                    )}
                    <ExtendButtonGroup className={classes.button}>
                        <ExtendButton
                            tooltip={t('bookmark:button.add', { context: 'short' })}
                            data-ui-path="bookmark.add"
                            onClick={() => coreService.localEventBus.call('bookmark/create')}
                            icon={AddBookmarkIcon}
                        />
                    </ExtendButtonGroup>
                </Box>
            </MouseDistanceFade>
        </React.Fragment>
    );
}

export default memo(observer(FabMenu));
