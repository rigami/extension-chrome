import React from 'react';
import {
    Menu,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@material-ui/core';
import { useSnackbar } from 'notistack';
import {
    Refresh as RefreshIcon,
    AddPhotoAlternateRounded as UploadFromComputerIcon,
    Add as AddBookmarkIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import { observer } from 'mobx-react-lite';
import {useService as useBackgroundsService} from "@/stores/backgrounds";
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(() => ({ menu: { width: 230 } }));

function ContextMenu({ className: externalClassName, isOpen, onClose, position }) {
    const classes = useStyles();
    const bookmarksStore = useBookmarksService();
    const backgroundsStore = useBackgroundsService();
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslation();

    const handleNextBG = () => {
        backgroundsStore.nextBG();
        onClose();
    };

    const handleAddBG = () => {
        const shadowInput = document.createElement("input");
        shadowInput.setAttribute('multiple', 'true');
        shadowInput.setAttribute('type', 'file');
        shadowInput.setAttribute('accept', 'video/*,image/*');
        shadowInput.onchange = (event) => {
            console.log("EVENT", event)
            const form = event.target;
            if (form.files.length === 0) return;

            backgroundsStore.addToUploadQueue(form.files)
                .catch((e) => enqueueSnackbar({
                    ...t("locale.settings.backgrounds.general.library[e]"),
                    variant: 'error',
                }))
                .finally(() => {
                    form.value = '';
                });
        };
        shadowInput.click();

        onClose();
    }
    const handleAddBookmark = () => {
        bookmarksStore.eventBus.dispatch(`createbookmark`, );
        onClose();
    }

    return (
        <React.Fragment>
            <Menu
                open={isOpen}
                onClose={onClose}
                anchorReference="anchorPosition"
                anchorPosition={position}
                classes={{ list: classes.menu }}
            >
                <ListItem button dense onClick={handleNextBG}>
                    <ListItemIcon>
                        <RefreshIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("bg.next")} />
                </ListItem>
                <ListItem button dense onClick={handleAddBG}>
                    <ListItemIcon>
                        <UploadFromComputerIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("bg.addShort")} />
                </ListItem>
                <ListItem button dense onClick={handleAddBookmark}>
                    <ListItemIcon>
                        <AddBookmarkIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("bookmark.addShort")} />
                </ListItem>
            </Menu>
        </React.Fragment>
    );
}

export default observer(ContextMenu);
