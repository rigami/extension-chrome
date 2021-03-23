import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { observer, useLocalObservable } from 'mobx-react-lite';
import {
    RefreshRounded as RefreshIcon,
    AddPhotoAlternateRounded as UploadFromComputerIcon,
    SaveAltRounded as SaveBgIcon,
    CheckRounded as SavedBgIcon,
    OpenInNewRounded as OpenSourceIcon,
} from '@material-ui/icons';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';
import { Box, CircularProgress } from '@material-ui/core';
import useCoreService from '@/stores/app/BaseStateProvider';
import { useTranslation } from 'react-i18next';
import { eventToBackground } from '@/stores/server/bus';
import { BG_SELECT_MODE, BG_SHOW_STATE, BG_SOURCE } from '@/enum';
import BackgroundsUniversalService from '@/stores/universal/backgrounds/service';
import useAppService from '@/stores/app/AppStateProvider';
import { ContextMenuItem, ContextMenuDivider } from '@/stores/app/entities/contextMenu';
import FAP from '@/ui/Desktop/FAP';
import { DIRECTION } from '@/ui/GlobalScroll';
import { SearchQuery } from '@/stores/universal/bookmarks/searchQuery';
import Background from './Background';
import Widgets from './Widgets';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
    },
    loadBGIcon: { color: theme.palette.text.primary },
    loadBGIconWhite: {
        position: 'absolute',
        bottom: theme.spacing(4.5),
        right: theme.spacing(4.5),
        zIndex: 1,
        color: theme.palette.common.white,
    },
}));

function Desktop({ active, onScroll, onTryScrollCallback }) {
    const { t } = useTranslation(['bookmark', 'background']);
    const classes = useStyles();
    const appService = useAppService();
    const { widgets, backgrounds } = appService;
    const coreService = useCoreService();
    const store = useLocalObservable(() => ({ isRender: active }));

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
                title: backgrounds.currentBG?.isSaved
                    ? t('background:addedToLibrary')
                    : t('background:button.addToLibrary'),
                disabled: backgrounds.currentBG?.isSaved,
                icon: backgrounds.currentBG?.isSaved ? SavedBgIcon : SaveBgIcon,
                onClick: () => BackgroundsUniversalService.addToLibrary(backgrounds.currentBG),
            }),
            new ContextMenuItem({
                title: t('background:button.openSource'),
                icon: OpenSourceIcon,
                onClick: () => window.open(backgrounds.currentBG?.sourceLink, '_blank'),
            }),
        ] : []),
    ];

    useEffect(() => {
        if (coreService.storage.temp.closeFapPopper && active) {
            onScroll({ blockBottom: true });
            onTryScrollCallback((scrollDirection) => {
                if (scrollDirection === DIRECTION.DOWN && coreService.storage.temp.shakeFapPopper) {
                    coreService.storage.temp.shakeFapPopper();
                }
            });
        } else {
            onScroll({ blockBottom: false });
            onTryScrollCallback(null);
        }
    }, [coreService.storage.temp.closeFapPopper]);

    useEffect(() => {
        if (active) store.isRender = true;
    }, [active]);

    if (!store.isRender) {
        return null;
    }

    return (
        <Box className={classes.root}>
            <Box onContextMenu={appService.contextMenu(contextMenu, { reactions: [() => backgrounds.bgState] })}>
                <Background />
                {widgets.settings.useWidgets && (
                    <Widgets />
                )}
            </Box>
            <FAP />
            {backgrounds.bgState === BG_SHOW_STATE.SEARCH && (
                <CircularProgress
                    className={classes.loadBGIconWhite}
                    size={20}
                />
            )}
        </Box>
    );
}

export default observer(Desktop);
