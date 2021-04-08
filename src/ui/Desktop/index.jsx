import React, { useEffect, Fragment } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { observer, useLocalObservable } from 'mobx-react-lite';
import {
    RefreshRounded as RefreshIcon,
    AddPhotoAlternateRounded as UploadFromComputerIcon,
    SaveAltRounded as SaveBgIcon,
    CheckRounded as SavedBgIcon,
    OpenInNewRounded as OpenSourceIcon,
    CloseRounded as CloseIcon,
    ArrowUpwardRounded as ExpandDesktopIcon,
} from '@material-ui/icons';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';
import { Box, CircularProgress, Backdrop } from '@material-ui/core';
import useCoreService from '@/stores/app/BaseStateProvider';
import { useTranslation } from 'react-i18next';
import { eventToBackground } from '@/stores/server/bus';
import {
    ACTIVITY,
    BG_SELECT_MODE,
    BG_SHOW_STATE,
    BG_SOURCE,
    FETCH,
    THEME,
} from '@/enum';
import useAppService from '@/stores/app/AppStateProvider';
import { ContextMenuItem, ContextMenuDivider } from '@/stores/app/entities/contextMenu';
import FAP from '@/ui/Desktop/FAP';
import clsx from 'clsx';
import { ExtendButton, ExtendButtonGroup } from '@/ui-components/ExtendButton';
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
}));

function Desktop() {
    const { t } = useTranslation(['bookmark', 'background']);
    const classes = useStyles();
    const theme = useTheme();
    const appService = useAppService();
    const { widgets, backgrounds } = appService;
    const coreService = useCoreService();
    const store = useLocalObservable(() => ({
        isRender: appService.activity !== ACTIVITY.BOOKMARKS,
        stickWidgetsToBottom: appService.activity !== ACTIVITY.DESKTOP,
    }));

    const contextMenu = () => [
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
                    (coreService.storage.temp.addingBgToLibrary === FETCH.PENDING && t('background:addingToLibrary'))
                    || (backgrounds.currentBG?.isSaved && t('background:addedToLibrary'))
                    || t('background:button.addToLibrary')
                ),
                disabled: (
                    coreService.storage.temp.addingBgToLibrary === FETCH.PENDING
                    || backgrounds.currentBG?.isSaved
                ),
                icon: (
                    (coreService.storage.temp.addingBgToLibrary === FETCH.PENDING && CircularProgress)
                    || (backgrounds.currentBG?.isSaved && SavedBgIcon)
                    || SaveBgIcon
                ),
                iconProps: coreService.storage.temp.addingBgToLibrary === FETCH.PENDING ? {
                    size: 20,
                    className: classes.loadBGIcon,
                } : {},
                onClick: () => backgrounds.addToLibrary(backgrounds.currentBG),
            }),
            new ContextMenuItem({
                title: t('background:button.openSource'),
                icon: OpenSourceIcon,
                onClick: () => window.open(backgrounds.currentBG?.sourceLink, '_blank'),
            }),
        ] : []),
    ];

    const wheelHandler = (event) => {

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

    return (
        <Fragment>
            {appService.activity === ACTIVITY.FAVORITES && (
                <Fragment>
                    <ExtendButtonGroup className={classes.expandDesktop}>
                        <ExtendButton
                            tooltip={t('desktop:button.expand')}
                            data-ui-path="button.desktop-expand"
                            onClick={() => appService.setActivity(ACTIVITY.DESKTOP)}
                            icon={() => <ExpandDesktopIcon className={classes.icon} />}
                            label={t('desktop:button.expand')}
                        />
                    </ExtendButtonGroup>
                    <ExtendButtonGroup className={classes.closeFavorites}>
                        <ExtendButton
                            tooltip={t('common:button.close')}
                            data-ui-path="button.favorites-close"
                            onClick={() => appService.setActivity(ACTIVITY.BOOKMARKS)}
                            icon={() => <CloseIcon className={classes.icon} />}
                        />
                    </ExtendButtonGroup>
                </Fragment>
            )}
            <Box
                className={clsx(
                    classes.root,
                    appService.activity === ACTIVITY.FAVORITES && classes.favoritesActivity,
                    appService.activity === ACTIVITY.DESKTOP && classes.desktopActivity,
                )}
                onContextMenu={appService.contextMenu(
                    contextMenu,
                    { reactions: [() => backgrounds.bgState, () => coreService.storage.temp.addingBgToLibrary] },
                )}
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
                onClick={() => appService.setActivity(ACTIVITY.BOOKMARKS)}
            />
        </Fragment>
    );
}

export default observer(Desktop);
