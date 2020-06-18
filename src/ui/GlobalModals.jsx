import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
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
            })),
            bookmarksStore.eventBus.on('editbookmark', ({ id }) => setEdit({
                type: 'bookmark',
                id,
            })),
            bookmarksStore.eventBus.on('editcategory', ({ id, anchorEl }) => setEdit({
                type: 'category',
                id,
                anchorEl,
            })),
        ];

        return () => {
            listeners.forEach((listenerId) => bookmarksStore.eventBus.removeListener(listenerId));
        }
    }, []);

    return (
        <React.Fragment>
            <EditBookmarkModal
                isOpen={edit && edit.type === 'bookmark'}
                editBookmarkId={edit && edit.id}
                onClose={() => setEdit(null)}
            />
            <EditCategoryModal
                anchorEl={edit && edit.anchorEl}
                isOpen={edit && edit.type === 'category'}
                onSave={() => setEdit(null)}
                onClose={() => setEdit(null)}
                editCategoryId={edit && edit.id}
            />
        </React.Fragment>
    );
}

export default observer(GlobalModals);
