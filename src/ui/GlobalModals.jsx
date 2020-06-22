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
import EditBookmarkModal from '@/ui/Bookmarks/EditBookmarkModal'
import EditCategoryModal from "@/ui/Bookmarks/EditCategoryModal";

function GlobalModals () {
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
                    Удалить закладку?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Она пропадет безвозратно. Вы уверены?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEdit(null)} color="primary">
                        Отмена
                    </Button>
                    <Button
                        onClick={() => {
                            bookmarksStore.removeBookmark(edit.id);
                            setEdit(null);
                        }}
                        color="primary"
                        autoFocus
                    >
                        Удалить?
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={(edit && edit.action === 'remove' && edit.type === 'category') || false}
                onClose={() => setEdit(null)}
            >
                <DialogTitle>
                    Удалить категорию?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Она удалится из всех закладок где указана и пропадет безвозратно. Вы уверены?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEdit(null)} color="primary">
                        Отмена
                    </Button>
                    <Button
                        onClick={() => {
                            bookmarksStore.removeCategory(edit.id);
                            setEdit(null);
                        }}
                        color="primary"
                        autoFocus
                    >
                        Удалить?
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}

export default observer(GlobalModals);
