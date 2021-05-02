import React, { useEffect, Fragment, useRef } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { observer, useLocalObservable } from 'mobx-react-lite';
import {
    RefreshRounded as RefreshIcon,
    AddPhotoAlternateRounded as UploadFromComputerIcon,
    FavoriteBorder as SaveBgIcon,
    Favorite as SavedBgIcon,
    OpenInNewRounded as OpenSourceIcon,
    CloseRounded as CloseIcon,
    ArrowUpwardRounded as ExpandDesktopIcon,
    HomeRounded as DesktopIcon,
    BookmarksRounded as BookmarksIcon,
    PauseRounded as PauseIcon, PlayArrowRounded as PlayIcon,
} from '@material-ui/icons';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';
import {
    Box,
    CircularProgress,
    Backdrop,
    Grow, Divider, Fade,
} from '@material-ui/core';
import useCoreService from '@/stores/app/BaseStateProvider';
import { useTranslation } from 'react-i18next';
import { eventToBackground } from '@/stores/server/bus';
import {
    ACTIVITY,
    BG_SELECT_MODE, BG_SHOW_MODE,
    BG_SHOW_STATE,
    BG_SOURCE, BG_TYPE,
    FETCH,
    THEME,
} from '@/enum';
import useAppService from '@/stores/app/AppStateProvider';
import { ContextMenuItem, ContextMenuDivider } from '@/stores/app/entities/contextMenu';
import FAP from '@/ui/Desktop/FAP';
import clsx from 'clsx';
import { ExtendButton, ExtendButtonGroup } from '@/ui-components/ExtendButton';
import useContextMenu from '@/stores/app/ContextMenuProvider';
import ShowFavorites from '@/ui/Bookmarks/ToolsPanel/ShowFavorites';
import MouseDistanceFade from '@/ui-components/MouseDistanceFade';
import Background from './Background';
import Widgets from './Widgets';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'absolute',
        zIndex: 2,
        transform: 'translateY(-100vh)',
        transition: theme.transitions.create(['transform'], {
            duration: theme.transitions.duration.short,
            easing: theme.transitions.easing.easeIn,
        }),
    },
    favoritesActivity: {
        transform: 'translateY(calc(-100vh + 188px))',
        boxShadow: theme.shadows[20],
        transition: theme.transitions.create(['transform'], {
            duration: theme.transitions.duration.long,
            easing: theme.transitions.easing.shiftEaseInOut,
        }),
    },
    desktopActivity: {
        transform: 'translateY(0)',
        transition: theme.transitions.create(['transform'], {
            duration: theme.transitions.duration.long,
            easing: theme.transitions.easing.shiftEaseInOut,
        }),
    },
    loadBGIcon: { color: theme.palette.text.primary },
    loadBGIconWhite: {
        position: 'absolute',
        top: theme.spacing(3.5) - 1,
        right: theme.spacing(3.5) - 1,
        zIndex: 1,
        color: theme.palette.common.white,
    },
    backdrop: { zIndex: 1 },
    closeFavorites: {
        position: 'absolute',
        zIndex: 100,
        top: theme.spacing(2),
        right: theme.spacing(2),
    },
    expandDesktop: {
        position: 'absolute',
        zIndex: 100,
        top: theme.spacing(2),
        right: theme.spacing(2) * 2 + 42,
    },
    showBookmarks: {
        position: 'absolute',
        zIndex: 100,
        bottom: theme.spacing(6) + theme.spacing(2.5) + 40,
        right: theme.spacing(2) * 2 + 42,
    },
    desktopBackdrop: {
        backgroundColor: theme.palette.common.black,
        position: 'absolute',
        zIndex: 0,
        top: 0,
        right: 0,
        width: '100vw',
        height: '100vh',
    },
    desktopBackdropLight: { backgroundColor: theme.palette.common.white },
    wrapperTools: {
        flexShrink: 0,
        display: 'grid',
        gridAutoFlow: 'column',
        gridGap: theme.spacing(2),
        position: 'absolute',
        top: theme.spacing(2),
        right: theme.spacing(2),
        zIndex: 1000,
        pointerEvents: 'none',
    },
    toolStub: {
        visibility: 'hidden',
        width: 42,
    },
    group: { flexDirection: 'row' },
    button: { pointerEvents: 'auto' },
}));

function Desktop() {
    const { t } = useTranslation(['bookmark', 'background']);
    const classes = useStyles();
    const theme = useTheme();
    const appService = useAppService();
    const { widgets, backgrounds } = appService;
    const coreService = useCoreService();
    const rootRef = useRef();
    const store = useLocalObservable(() => ({
        isRender: appService.activity !== ACTIVITY.BOOKMARKS,
        stickWidgetsToBottom: appService.activity !== ACTIVITY.DESKTOP,
    }));
    const contextMenu = useContextMenu(() => [
        new ContextMenuItem({
            title: t('bookmark:button.add'),
            icon: AddBookmarkIcon,
            onClick: () => {
                coreService.localEventBus.call('bookmark/create');
            },
        }),
        new ContextMenuDivider(),
        ...(backgrounds.settings.selectionMethod !== BG_SELECT_MODE.SPECIFIC ? [
            new ContextMenuItem({
                title: backgrounds.bgState === BG_SHOW_STATE.SEARCH
                    ? t('background:fetchingNextBG')
                    : t('background:button.next'),
                disabled: backgrounds.bgState === BG_SHOW_STATE.SEARCH,
                icon: backgrounds.bgState === BG_SHOW_STATE.SEARCH ? CircularProgress : RefreshIcon,
                iconProps: backgrounds.bgState === BG_SHOW_STATE.SEARCH ? {
                    size: 20,
                    className: classes.loadBGIcon,
                } : {},
                onClick: () => eventToBackground('backgrounds/nextBg'),
            }),
        ] : []),
        new ContextMenuItem({
            title: t('background:button.add'),
            icon: UploadFromComputerIcon,
            onClick: () => {
                const shadowInput = document.createElement('input');
                shadowInput.setAttribute('multiple', 'true');
                shadowInput.setAttribute('type', 'file');
                shadowInput.setAttribute('accept', 'video/*,image/*');
                shadowInput.onchange = (event) => {
                    const form = event.target;
                    if (form.files.length === 0) return;

                    backgrounds.addToUploadQueue(form.files)
                        .finally(() => {
                            form.value = '';
                        });
                };
                shadowInput.click();
            },
        }),
        ...(backgrounds.currentBG?.source !== BG_SOURCE.USER ? [
            new ContextMenuItem({
                title: (
                    (coreService.storage.temp.addingBgToLibrary === FETCH.PENDING && t('background:liked'))
                    || (backgrounds.currentBG?.isSaved && t('background:liked'))
                    || t('background:button.like')
                ),
                disabled: (
                    coreService.storage.temp.addingBgToLibrary === FETCH.PENDING
                    || backgrounds.currentBG?.isSaved
                ),
                icon: (
                    (coreService.storage.temp.addingBgToLibrary === FETCH.PENDING && SavedBgIcon)
                    || (backgrounds.currentBG?.isSaved && SavedBgIcon)
                    || SaveBgIcon
                ),
                onClick: () => backgrounds.addToLibrary(backgrounds.currentBG),
            }),
            new ContextMenuItem({
                title: t('background:button.openSource'),
                icon: OpenSourceIcon,
                onClick: () => window.open(backgrounds.currentBG?.sourceLink, '_blank'),
            }),
        ] : []),
    ], { reactions: [() => backgrounds.bgState, () => coreService.storage.temp.addingBgToLibrary] });

    const wheelHandler = (event) => {
        if (!event.path.includes(rootRef.current)) return;

        if (coreService.storage.temp.shakeFapPopper) {
            coreService.storage.temp.shakeFapPopper();
        } else if (event.deltaY > 0) appService.setActivity(ACTIVITY.BOOKMARKS);
        else appService.setActivity(ACTIVITY.DESKTOP);
    };

    useEffect(() => {
        if (appService.activity !== ACTIVITY.BOOKMARKS) {
            addEventListener('wheel', wheelHandler, true);
            store.isRender = true;
        }

        if (appService.activity !== ACTIVITY.DESKTOP) {
            setTimeout(() => {
                if (appService.activity !== ACTIVITY.DESKTOP) { store.stickWidgetsToBottom = true; }
            }, theme.transitions.duration.short);
        } else {
            store.stickWidgetsToBottom = false;
        }

        return () => {
            if (appService.activity !== ACTIVITY.BOOKMARKS) removeEventListener('wheel', wheelHandler);
        };
    }, [appService.activity]);

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
        <Fragment>
            <Box className={classes.wrapperTools}>
                <Grow in={appService.activity === ACTIVITY.FAVORITES}>
                    <ExtendButtonGroup className={classes.button}>
                        <ExtendButton
                            tooltip={t('desktop:button.open')}
                            data-ui-path="button.desktop-expand"
                            onClick={() => appService.setActivity(ACTIVITY.DESKTOP)}
                            icon={ExpandDesktopIcon}
                            label={t('desktop:button.expand')}
                        />
                    </ExtendButtonGroup>
                </Grow>
                {appService.activity === ACTIVITY.FAVORITES && (
                    <ExtendButtonGroup className={classes.button}>
                        <ExtendButton
                            tooltip={t('common:button.close')}
                            data-ui-path="button.favorites-close"
                            onClick={() => appService.setActivity(ACTIVITY.BOOKMARKS)}
                            icon={CloseIcon}
                        />
                    </ExtendButtonGroup>
                )}
                <ExtendButtonGroup className={classes.toolStub} />
                <ExtendButtonGroup className={classes.toolStub} />
            </Box>
            <Box className={classes.wrapperTools}>
                <Grow in={appService.activity === ACTIVITY.DESKTOP && (bgShowMode || saveBgLocal || nextBg)}>
                    <span>
                        <MouseDistanceFade
                            unionKey="desktop-fab"
                            distanceMax={750}
                            distanceMin={300}
                        >
                            <ExtendButtonGroup
                                className={clsx(
                                    classes.group,
                                    appService.activity === ACTIVITY.DESKTOP
                                && (bgShowMode || saveBgLocal || nextBg)
                                && classes.button,
                                )}
                                style={{ minHeight: 42 }}
                            >
                                {saveBgLocal && (
                                    <React.Fragment>
                                        {coreService.storage.temp.addingBgToLibrary === FETCH.PENDING && (
                                            <ExtendButton
                                                tooltip={t('background:liked')}
                                                className={classes.notClickable}
                                                disableRipple
                                                icon={SavedBgIcon}
                                            />
                                        )}
                                        {coreService.storage.temp.addingBgToLibrary !== FETCH.PENDING && (
                                            <ExtendButton
                                                tooltip={
                                                    backgrounds.currentBG.isSaved
                                                        ? t('background:liked')
                                                        : t('background:button.like')
                                                }
                                                data-ui-path={
                                                    backgrounds.currentBG.isSaved
                                                        ? 'bg.liked'
                                                        : 'bg.like'
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
                                        {saveBgLocal && (<Divider orientation="vertical" flexItem />)}
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
                                {nextBg && (
                                    <React.Fragment>
                                        {(bgShowMode || saveBgLocal) && (<Divider orientation="vertical" flexItem />)}
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
                            </ExtendButtonGroup>
                        </MouseDistanceFade>
                    </span>
                </Grow>
                <Grow in={appService.activity === ACTIVITY.DESKTOP}>
                    <span>
                        <MouseDistanceFade
                            unionKey="desktop-fab"
                            distanceMax={750}
                            distanceMin={300}
                        >
                            <ExtendButtonGroup className={classes.button}>
                                <ExtendButton
                                    tooltip={t('bookmark:button.open')}
                                    data-ui-path="bookmark.open"
                                    onClick={() => appService.setActivity(ACTIVITY.BOOKMARKS)}
                                    icon={BookmarksIcon}
                                />
                            </ExtendButtonGroup>
                        </MouseDistanceFade>
                    </span>
                </Grow>
                <ExtendButtonGroup className={classes.toolStub} />
            </Box>
            <Box
                ref={rootRef}
                className={clsx(
                    classes.root,
                    appService.activity === ACTIVITY.FAVORITES && classes.favoritesActivity,
                    appService.activity === ACTIVITY.DESKTOP && classes.desktopActivity,
                )}
                onContextMenu={contextMenu}
            >
                {store.isRender && (
                    <React.Fragment>
                        <Background />
                        {widgets.settings.useWidgets && (
                            <Widgets stickToBottom={store.stickWidgetsToBottom} />
                        )}
                        <FAP />
                        {backgrounds.bgState === BG_SHOW_STATE.SEARCH && (
                            <CircularProgress
                                className={classes.loadBGIconWhite}
                                size={20}
                            />
                        )}
                        <Box
                            className={clsx(
                                classes.desktopBackdrop,
                                appService.settings.backdropTheme === THEME.LIGHT && classes.desktopBackdropLight,
                            )}
                        />
                    </React.Fragment>
                )}
            </Box>
            <Backdrop
                invisible
                className={classes.backdrop}
                open={appService.activity !== ACTIVITY.BOOKMARKS}
                onClick={() => {
                    if (coreService.storage.temp.closeFapPopper) {
                        coreService.storage.temp.shakeFapPopper();
                    } else {
                        appService.setActivity(ACTIVITY.BOOKMARKS);
                    }
                }}
            />
        </Fragment>
    );
}

export default observer(Desktop);
