import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import {
    RefreshRounded as RefreshIcon,
    AddPhotoAlternateRounded as UploadFromComputerIcon,
    SaveAltRounded as SaveBgIcon,
    CheckRounded as SavedBgIcon,
    OpenInNewRounded as OpenSourceIcon,
    BookmarkRounded as UnpinnedFavoriteIcon,
    BookmarkBorderRounded as PinnedFavoriteIcon, EditRounded as EditIcon, DeleteRounded as RemoveIcon,
} from '@material-ui/icons';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';
import { Box, CircularProgress } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import useCoreService from '@/stores/app/BaseStateProvider';
import { useTranslation } from 'react-i18next';
import useAppStateService from '@/stores/app/AppStateProvider';
import { eventToBackground } from '@/stores/server/bus';
import { BG_SELECT_MODE, BG_SHOW_STATE, BG_SOURCE } from '@/enum';
import BackgroundsUniversalService from '@/stores/universal/backgrounds/service';
import useAppService from '@/stores/app/AppStateProvider';
import { ContextMenuItem, ContextMenuDivider } from '@/stores/app/entities/contextMenu';
import Favorite from '@/stores/universal/bookmarks/entities/favorite';
import GlobalScroll from '@/ui/GlobalScroll';
import FAP from '@/ui/Desktop/FAP';
import Nest from '@/utils/Nest';
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

function Desktop() {
    const { t } = useTranslation();
    const classes = useStyles();
    const appService = useAppService();
    const { enqueueSnackbar } = useSnackbar();
    const { widgets, backgrounds } = useAppStateService();
    const coreService = useCoreService();

    const contextMenu = () => [
        new ContextMenuItem({
            title: t('bookmark.addShort'),
            icon: AddBookmarkIcon,
            onClick: () => {
                coreService.localEventBus.call('bookmark/create');
            },
        }),
        new ContextMenuDivider(),
        ...(backgrounds.settings.selectionMethod !== BG_SELECT_MODE.SPECIFIC ? [
            new ContextMenuItem({
                title: backgrounds.bgState === BG_SHOW_STATE.SEARCH ? t('bg.fetchingNextBG') : t('bg.next'),
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
            title: t('bg.addShort'),
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
                        .catch(() => enqueueSnackbar({
                            ...t('locale.settings.backgrounds.general.library[e]'),
                            variant: 'error',
                        }))
                        .finally(() => {
                            form.value = '';
                        });
                };
                shadowInput.click();
            },
        }),
        ...(backgrounds.currentBG?.source !== BG_SOURCE.USER ? [
            new ContextMenuItem({
                title: backgrounds.currentBG?.isSaved ? t('bg.addedToLibrary') : t('bg.addToLibrary'),
                disabled: backgrounds.currentBG?.isSaved,
                icon: backgrounds.currentBG?.isSaved ? SavedBgIcon : SaveBgIcon,
                onClick: () => BackgroundsUniversalService.addToLibrary(backgrounds.currentBG),
            }),
            new ContextMenuItem({
                title: t('bg.openSource'),
                icon: OpenSourceIcon,
                onClick: () => window.open(backgrounds.currentBG?.sourceLink, '_blank'),
            }),
        ] : []),
    ];

    return (
        <Box
            className={classes.root}
            onContextMenu={appService.contextMenu(contextMenu, { reactions: [() => backgrounds.bgState] })}
        >
            <Background />
            {widgets.settings.useWidgets && (
                <Widgets />
            )}
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
