import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import {
    Refresh as RefreshIcon,
    AddPhotoAlternateRounded as UploadFromComputerIcon,
    Add as AddBookmarkIcon,
} from '@material-ui/icons';
import { Box } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import useBackgroundsService from '@/stores/BackgroundsStateProvider';
import useCoreService from '@/stores/BaseStateProvider';
import Menu from '@/ui/Menu';
import { useTranslation } from 'react-i18next';
import useAppStateService from '@/stores/AppStateProvider';
import Widgets from '../Widgets';
import Background from './Background';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
    },
}));

function Desktop() {
    const { t } = useTranslation();
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();
    const backgroundsStore = useBackgroundsService();
    const { widgets } = useAppStateService();
    const coreService = useCoreService();

    const openMenu = (position) => {
        coreService.localEventBus.call('system/contextMenu', {
            actions: [
                {
                    type: 'button',
                    title: t('bg.next'),
                    icon: RefreshIcon,
                    onClick: () => backgroundsStore.nextBG(),
                },
                {
                    type: 'button',
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

                            backgroundsStore.addToUploadQueue(form.files)
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
                },
                {
                    type: 'button',
                    title: t('bookmark.addShort'),
                    icon: AddBookmarkIcon,
                    onClick: () => {
                        coreService.localEventBus.call('bookmark/create');
                    },
                },
            ],
            position,
        });
    };

    const handlerContextMenu = (event) => {
        event.preventDefault();
        openMenu({
            top: event.nativeEvent.clientY,
            left: event.nativeEvent.clientX,
        });
    };

    return (
        <Box className={classes.root} onContextMenu={handlerContextMenu}>
            <Background />
            {widgets.settings.useWidgets && (
                <Widgets />
            )}
            <Menu />
        </Box>
    );
}

export default observer(Desktop);
