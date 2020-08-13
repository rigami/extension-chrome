import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from '@material-ui/core';
import { useService as useBookmarksService } from '@/stores/bookmarks'
import EditCategoryModal from "@/ui/Bookmarks/EditCategoryModal";
import { useTranslation } from 'react-i18next';
import EditBookmarkModal from "@/ui/Bookmarks/EditBookmarkModal";

function GlobalModals () {
    const { t } = useTranslation();
    const bookmarksStore = useBookmarksService();
    const [edit, setEdit] = useState(null)

    useEffect(() => {
        const listeners = [
            bookmarksStore.eventBus.on('createbookmark', () => setEdit({
                type: 'bookmark',
                action: 'create',
            })),
            bookmarksStore.eventBus.on('editbookmark', ({ id }) => setEdit({
                type: 'bookmark',
                action: 'edit',
                id,
            })),
            bookmarksStore.eventBus.on('removebookmark', ({ id }) => setEdit({
                type: 'bookmark',
                action: 'remove',
                id,
            })),
            bookmarksStore.eventBus.on('editcategory', ({ id, anchorEl }) => setEdit({
                type: 'category',
                action: 'edit',
                id,
                anchorEl,
            })),
            bookmarksStore.eventBus.on('removecategory', ({ id }) => setEdit({
                type: 'category',
                action: 'remove',
                id,
            })),
        ];

        return () => {
            listeners.forEach((listenerId) => bookmarksStore.eventBus.removeListener(listenerId));
        }
    }, []);

    return (
        <React.Fragment>
            <EditBookmarkModal
                isOpen={edit && edit.type === 'bookmark' && edit.action !== 'remove'}
                editBookmarkId={edit && edit.id}
                onClose={() => setEdit(null)}
            />
            <EditCategoryModal
                anchorEl={edit && edit.anchorEl}
                isOpen={edit && edit.type === 'category' && edit.action !== 'remove'}
                onSave={() => setEdit(null)}
                onClose={() => setEdit(null)}
                editCategoryId={edit && edit.id}
            />
            <Dialog
                open={(edit && edit.action === 'remove' && edit.type === 'bookmark') || false}
                onClose={() => setEdit(null)}
            >
                <DialogTitle>
                    {t("bookmark.remove.title")}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t("bookmark.remove.description")}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEdit(null)} color="primary">
                        {t("cancel")}
                    </Button>
                    <Button
                        onClick={() => {
                            bookmarksStore.removeBookmark(edit.id);
                            setEdit(null);
                        }}
                        color="primary"
                        autoFocus
                    >
                        {t("remove")}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={(edit && edit.action === 'remove' && edit.type === 'category') || false}
                onClose={() => setEdit(null)}
            >
                <DialogTitle>
                    {t("category.remove.title")}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t("category.remove.description")}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEdit(null)} color="primary">
                        {t("cancel")}
                    </Button>
                    <Button
                        onClick={() => {
                            bookmarksStore.removeCategory(edit.id);
                            setEdit(null);
                        }}
                        color="primary"
                        autoFocus
                    >
                        {t("remove")}
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}

export default observer(GlobalModals);
