import React, { useEffect, Fragment, useRef } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { observer, useLocalObservable } from 'mobx-react-lite';
import {
    RefreshRounded as RefreshIcon,
    AddPhotoAlternateRounded as UploadFromComputerIcon,
    OpenInNewRounded as OpenSourceIcon,
    CloseRounded as CloseIcon,
    ArrowUpwardRounded as ExpandDesktopIcon,
    BookmarksRounded as BookmarksIcon,
    PauseRounded as PauseIcon,
    PlayArrowRounded as PlayIcon,
    ThumbUp as LikedIcon,
    ThumbDown as DislikedIcon,
    ThumbUpOutlined as LikeIcon,
    ThumbDownOutlined as DislikeIcon,
} from '@material-ui/icons';
import {
    Box,
    CircularProgress,
    Backdrop,
    Grow,
    Divider,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useSnackbar } from 'notistack';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';
import { eventToBackground } from '@/stores/universal/serviceBus';
import {
    ACTIVITY, BG_CHANGE_INTERVAL, BG_RATE,
    BG_SELECT_MODE, BG_SHOW_MODE,
    BG_SHOW_STATE,
    BG_SOURCE, BG_TYPE,
    THEME,
} from '@/enum';
import { useAppStateService } from '@/stores/app/appState';
import { ContextMenuItem } from '@/stores/app/contextMenu/entities';
import FAP from '@/ui/Desktop/FAP';
import { ExtendButton, ExtendButtonGroup } from '@/ui-components/ExtendButton';
import { useContextMenuService } from '@/stores/app/contextMenu';
import MouseDistanceFade from '@/ui-components/MouseDistanceFade';
import { useCoreService } from '@/stores/app/core';
import Wallpaper from './Wallpaper';
import Widgets from './Widgets';
import WallpaperSwitchService from '@/ui/Desktop/wallpaperSwitchService';
import { useContextPopoverDispatcher } from '@/stores/app/contextPopover';
import SimpleEditor from '@/ui/Bookmarks/Folders/EditModal/EditorSimple';
import { PopoverDialogHeader } from '@/ui-components/PopoverDialog';
import Editor from '@/ui/Bookmarks/EditBookmarkModal/Editor';
import { useContextEdit } from '@/stores/app/contextActions';

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
        right: theme.spacing(2) * 2 + 36,
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
        gridGap: theme.spacing(1),
        position: 'absolute',
        top: theme.spacing(2),
        right: theme.spacing(2),
        zIndex: 1000,
        pointerEvents: 'none',
    },
    toolStub: {
        visibility: 'hidden',
        width: 36,
    },
    group: { flexDirection: 'row' },
    button: { pointerEvents: 'auto' },
    buttonOffset: { marginRight: theme.spacing(1) },
}));

function Desktop() {
    const { t } = useTranslation(['bookmark', 'background']);
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const appStateService = useAppStateService();
    const { wallpapersService, desktopService } = appStateService;
    const coreService = useCoreService();
    const rootRef = useRef();
    const store = useLocalObservable(() => ({
        isRender: appStateService.activity !== ACTIVITY.BOOKMARKS,
        stickWidgetsToBottom: appStateService.activity !== ACTIVITY.DESKTOP,
    }));
    const wallpaperSwitchService = useLocalObservable(() => new WallpaperSwitchService({
        coreService,
        wallpapersSettings: wallpapersService,
    }));
    const { dispatchEdit } = useContextEdit();
    const { dispatchContextMenu } = useContextMenuService((event, position, next) => [
        BUILD === 'full' && new ContextMenuItem({
            title: t('bookmark:button.add'),
            icon: AddBookmarkIcon,
            onClick: () => dispatchEdit({ itemType: 'bookmark' }, event, position, next),
        }),
        wallpapersService.settings.kind !== BG_SELECT_MODE.SPECIFIC && [
            new ContextMenuItem({
                title: wallpaperSwitchService.state === BG_SHOW_STATE.SEARCH
                    ? t('background:fetchingNextBG')
                    : t('background:button.next'),
                disabled: wallpaperSwitchService.state === BG_SHOW_STATE.SEARCH,
                icon: wallpaperSwitchService.state === BG_SHOW_STATE.SEARCH ? CircularProgress : RefreshIcon,
                iconProps: wallpaperSwitchService.state === BG_SHOW_STATE.SEARCH ? {
                    size: 20,
                    className: classes.loadBGIcon,
                } : {},
                onClick: () => eventToBackground('wallpapers/next'),
            }),
        ],
        wallpaperSwitchService.currentDisplayed?.source !== BG_SOURCE.USER && [
            new ContextMenuItem({
                title: (
                    !wallpaperSwitchService.currentDisplayed?.isLiked ? t('background:liked') : t('background:button.like')
                ),
                icon: (
                    !wallpaperSwitchService.currentDisplayed?.isLiked ? LikedIcon : LikeIcon
                ),
                onClick: () => {
                    wallpapersService.rate(wallpaperSwitchService.currentDisplayed, BG_RATE.LIKE);
                },
            }),
            new ContextMenuItem({
                title: t('background:button.dislike'),
                icon: DislikeIcon,
                onClick: () => {
                    wallpapersService.rate(wallpaperSwitchService.currentDisplayed, BG_RATE.DISLIKE);

                    enqueueSnackbar({
                        message: t('background:dislike.noty'),
                        variant: 'success',
                    });
                },
            }),
            new ContextMenuItem({
                title: t('background:button.openSource'),
                icon: OpenSourceIcon,
                onClick: () => window.open(wallpaperSwitchService.currentDisplayed?.sourceLink, '_blank'),
            }),
        ],
        new ContextMenuItem({
            title: t('background:button.add'),
            icon: UploadFromComputerIcon,
            onClick: () => {
                const shadowInput = document.createElement('input');
                shadowInput.setAttribute('multiple', 'true');
                shadowInput.setAttribute('type', 'file');
                shadowInput.setAttribute('accept', 'video/*,image/*');
                shadowInput.onchange = (uploadEvent) => {
                    const form = uploadEvent.target;
                    if (form.files.length === 0) return;

                    wallpapersService.addToUploadQueue(form.files)
                        .finally(() => {
                            form.value = '';
                        });
                };
                shadowInput.click();
            },
        }),
    ], { reactions: [() => wallpaperSwitchService.state, () => coreService.tempStorage.data.addingBgToLibrary] });

    const wheelHandler = (event) => {
        if (!event.path.includes(rootRef.current)) return;

        if (coreService.tempStorage.data.shakeFapPopper) {
            coreService.tempStorage.data.shakeFapPopper();
        } else if (event.deltaY > 0) appStateService.setActivity(ACTIVITY.BOOKMARKS);
        else appStateService.setActivity(ACTIVITY.DESKTOP);
    };

    useEffect(() => {
        if (BUILD !== 'full') return () => {};

        if (appStateService.activity !== ACTIVITY.BOOKMARKS) {
            addEventListener('wheel', wheelHandler, true);
            store.isRender = true;
        }

        if (appStateService.activity !== ACTIVITY.DESKTOP) {
            setTimeout(() => {
                if (appStateService.activity !== ACTIVITY.DESKTOP) { store.stickWidgetsToBottom = true; }
            }, theme.transitions.duration.short);
        } else {
            store.stickWidgetsToBottom = false;
        }

        return () => {
            if (appStateService.activity !== ACTIVITY.BOOKMARKS) removeEventListener('wheel', wheelHandler);
        };
    }, [appStateService.activity]);

    const bgShowMode = wallpaperSwitchService.currentDisplayed?.type === BG_TYPE.VIDEO;
    const saveBgLocal = (
        wallpapersService.settings.kind === BG_SELECT_MODE.STREAM
        && wallpaperSwitchService.currentDisplayed?.source !== BG_SOURCE.USER
    );
    const nextBg = wallpapersService.settings.changeInterval !== BG_CHANGE_INTERVAL.NEVER;

    return (
        <Fragment>
            {BUILD === 'full' && (
                <Box className={classes.wrapperTools}>
                    <Grow in={appStateService.activity === ACTIVITY.FAVORITES}>
                        <ExtendButtonGroup variant="blurBackdrop" className={classes.button}>
                            <ExtendButton
                                tooltip={t('desktop:button.open')}
                                data-ui-path="button.desktop-expand"
                                onClick={() => appStateService.setActivity(ACTIVITY.DESKTOP)}
                                icon={ExpandDesktopIcon}
                                label={t('desktop:button.expand')}
                            />
                        </ExtendButtonGroup>
                    </Grow>
                    <Grow in={appStateService.activity === ACTIVITY.FAVORITES}>
                        <ExtendButtonGroup
                            variant="blurBackdrop"
                            className={clsx(classes.button, classes.buttonOffset)}
                        >
                            <ExtendButton
                                tooltip={t('common:button.close')}
                                data-ui-path="button.favorites-close"
                                onClick={() => appStateService.setActivity(ACTIVITY.BOOKMARKS)}
                                icon={CloseIcon}
                                label={t('common:button.close')}
                            />
                        </ExtendButtonGroup>
                    </Grow>
                    <ExtendButtonGroup className={classes.toolStub} />
                    <ExtendButtonGroup className={classes.toolStub} />
                </Box>
            )}
            <Box className={classes.wrapperTools}>
                <Grow in={appStateService.activity === ACTIVITY.DESKTOP && (bgShowMode || saveBgLocal || nextBg)}>
                    <span>
                        <MouseDistanceFade
                            unionKey="desktop-fab"
                            distanceMax={750}
                            distanceMin={300}
                        >
                            <ExtendButtonGroup
                                className={clsx(
                                    classes.group,
                                    appStateService.activity === ACTIVITY.DESKTOP
                                && (bgShowMode || saveBgLocal || nextBg)
                                && classes.button,
                                )}
                                variant="blurBackdrop"
                                style={{ minHeight: 36 }}
                            >
                                {bgShowMode && (
                                    <React.Fragment>
                                        <ExtendButton
                                            tooltip={
                                                wallpapersService.bgShowMode === BG_SHOW_MODE.LIVE
                                                    ? t('background:button.pause')
                                                    : t('background:button.play')
                                            }
                                            data-ui-path={
                                                wallpapersService.bgShowMode === BG_SHOW_MODE.LIVE
                                                    ? 'bg.pauseVideo'
                                                    : 'bg.playVideo'
                                            }
                                            onClick={() => {
                                                if (wallpapersService.bgShowMode === BG_SHOW_MODE.LIVE) {
                                                    coreService.localEventBus.call('background/pause');
                                                } else {
                                                    coreService.localEventBus.call('background/play');
                                                }
                                            }}
                                            icon={wallpapersService.bgShowMode === BG_SHOW_MODE.LIVE ? PauseIcon : PlayIcon}
                                        />
                                    </React.Fragment>
                                )}
                                {saveBgLocal && (
                                    <React.Fragment>
                                        {bgShowMode && (<Divider orientation="vertical" flexItem />)}
                                        <ExtendButton
                                            tooltip={
                                                !wallpaperSwitchService.currentDisplayed?.isLiked
                                                    ? t('background:button.like')
                                                    : t('background:liked')
                                            }
                                            data-ui-path={
                                                wallpaperSwitchService.currentDisplayed?.isLiked
                                                    ? 'bg.liked'
                                                    : 'bg.like'
                                            }
                                            onClick={() => {
                                                wallpapersService.rate(wallpaperSwitchService.currentDisplayed, BG_RATE.LIKE);
                                            }}
                                            icon={
                                                wallpaperSwitchService.currentDisplayed?.isLiked
                                                    ? LikedIcon
                                                    : LikeIcon
                                            }
                                        />
                                        <Divider orientation="vertical" flexItem />
                                        <ExtendButton
                                            tooltip={t('background:button.dislike')}
                                            data-ui-path="bg.dislike"
                                            onClick={() => {
                                                wallpapersService.rate(wallpaperSwitchService.currentDisplayed, BG_RATE.DISLIKE);

                                                enqueueSnackbar({
                                                    message: t('background:dislike.noty'),
                                                    variant: 'success',
                                                });
                                            }}
                                            icon={
                                                wallpaperSwitchService.currentDisplayed?.isDisliked
                                                    ? DislikedIcon
                                                    : DislikeIcon
                                            }
                                        />
                                    </React.Fragment>
                                )}
                                {nextBg && (
                                    <React.Fragment>
                                        {(bgShowMode || saveBgLocal) && (<Divider orientation="vertical" flexItem />)}
                                        <ExtendButton
                                            tooltip={
                                                wallpaperSwitchService.state === BG_SHOW_STATE.SEARCH
                                                    ? t('background:fetchingNextBG')
                                                    : t('background:button.next')
                                            }
                                            data-ui-path="bg.next"
                                            className={clsx(
                                                wallpaperSwitchService.state === BG_SHOW_STATE.SEARCH && classes.notClickable,
                                            )}
                                            disableRipple={wallpaperSwitchService.state === BG_SHOW_STATE.SEARCH}
                                            onClick={() => (
                                                wallpaperSwitchService.state !== BG_SHOW_STATE.SEARCH
                                            && eventToBackground('wallpapers/next')
                                            )}
                                            icon={() => (
                                                <React.Fragment>
                                                    {wallpaperSwitchService.state !== BG_SHOW_STATE.SEARCH && (
                                                        <RefreshIcon />
                                                    )}
                                                    {wallpaperSwitchService.state === BG_SHOW_STATE.SEARCH && (
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
                {BUILD === 'full' && (
                    <Grow in={appStateService.activity === ACTIVITY.DESKTOP}>
                        <span>
                            <MouseDistanceFade
                                unionKey="desktop-fab"
                                distanceMax={750}
                                distanceMin={300}
                            >
                                <ExtendButtonGroup variant="blurBackdrop" className={classes.button}>
                                    <ExtendButton
                                        tooltip={t('bookmark:button.open', { context: 'tooltip' })}
                                        data-ui-path="bookmark.open"
                                        onClick={() => appStateService.setActivity(ACTIVITY.BOOKMARKS)}
                                        icon={BookmarksIcon}
                                        label={t('bookmark:button.open')}
                                    />
                                </ExtendButtonGroup>
                            </MouseDistanceFade>
                        </span>
                    </Grow>
                )}
                <ExtendButtonGroup className={classes.toolStub} />
            </Box>
            <Box
                ref={rootRef}
                className={clsx(
                    classes.root,
                    appStateService.activity === ACTIVITY.FAVORITES && classes.favoritesActivity,
                    appStateService.activity === ACTIVITY.DESKTOP && classes.desktopActivity,
                )}
                style={{
                    transform: appStateService.activity === ACTIVITY.FAVORITES
                        ? `translateY(calc(-100vh + ${
                            Math.max(coreService.tempStorage.data.desktopWidgetsHeight, 72)
                        + coreService.tempStorage.data.desktopFapHeight
                        }px))`
                        : '',
                }}
                onContextMenu={dispatchContextMenu}
            >
                {store.isRender && (
                    <React.Fragment>
                        <Wallpaper service={wallpaperSwitchService} />
                        {desktopService.settings.useWidgets && (
                            <Widgets
                                color={wallpaperSwitchService.contrastColor}
                                stickToBottom={store.stickWidgetsToBottom}
                            />
                        )}
                        {BUILD === 'full' && (<FAP />)}
                        {wallpaperSwitchService.state === BG_SHOW_STATE.SEARCH && (
                            <CircularProgress
                                className={classes.loadBGIconWhite}
                                size={20}
                            />
                        )}
                        <Box
                            className={clsx(
                                classes.desktopBackdrop,
                                appStateService.settings.backdropTheme === THEME.LIGHT && classes.desktopBackdropLight,
                            )}
                        />
                    </React.Fragment>
                )}
            </Box>
            <Backdrop
                invisible
                className={classes.backdrop}
                open={appStateService.activity !== ACTIVITY.BOOKMARKS}
                onClick={() => {
                    if (coreService.tempStorage.data.closeFapPopper) {
                        coreService.tempStorage.data.shakeFapPopper();
                    } else {
                        appStateService.setActivity(ACTIVITY.BOOKMARKS);
                    }
                }}
            />
        </Fragment>
    );
}

export default observer(Desktop);
