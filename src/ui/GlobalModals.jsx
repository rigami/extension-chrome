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
import useBookmarksService from '@/stores/BookmarksProvider';
import useCoreService from '@/stores/BaseStateProvider';
import EditCategoryModal from '@/ui/Bookmarks/Categories/EditModal';
import { useTranslation } from 'react-i18next';
import EditBookmarkModal from '@/ui/Bookmarks/EditBookmarkModal';
import ContextMenu from '@/ui/ContextMenu';
import { useSnackbar } from 'notistack';
import FSConnector from '@/utils/fsConnector';

function GlobalModals({ children }) {
    const { t } = useTranslation();
    const bookmarksStore = useBookmarksService();
    const { enqueueSnackbar } = useSnackbar();
    const coreService = useCoreService();
    const [edit, setEdit] = useState(null);
    const [contextMenuPosition, setContextMenuPosition] = useState(null);
    const [contextMenuActions, setContextMenuActions] = useState([]);

    useEffect(() => {
        const localListeners = [
            coreService.localEventBus.on('system/contextMenu', ({ actions, position }) => {
                setContextMenuPosition(position);
                setContextMenuActions(actions);
            }),
            coreService.localEventBus.on('bookmark/create', () => setEdit({
                type: 'bookmark',
                action: 'create',
            })),
            coreService.localEventBus.on('bookmark/edit', ({ id }) => setEdit({
                type: 'bookmark',
                action: 'edit',
                id,
            })),
            coreService.localEventBus.on('bookmark/remove', ({ id }) => setEdit({
                type: 'bookmark',
                action: 'remove',
                id,
            })),
            coreService.localEventBus.on('category/edit', ({ id, anchorEl }) => setEdit({
                type: 'category',
                action: 'edit',
                id,
                anchorEl,
            })),
            coreService.localEventBus.on('category/remove', ({ id }) => setEdit({
                type: 'category',
                action: 'remove',
                id,
            })),
        ];

        const globalListeners = [
            coreService.globalEventBus.on('system/backup/local/create/progress', (data) => {
                console.log('system/backup/local/progress', data);

                console.log(FSConnector.getURL(data.path));

                const link = document.createElement('a');
                link.href = FSConnector.getURL(data.path);
                link.download = 'Rigmai backup';

                link.click();

                enqueueSnackbar({
                    message: t('settings.backup.localBackup.noty.success'),
                    variant: 'success',
                });
            }),
            coreService.globalEventBus.on('system/backup/local/restore/progress', (data) => {
                enqueueSnackbar({
                    message: t(data.message || 'settings.backup.localBackup.noty.success'),
                    variant: data.result,
                });
            }),
        ];

        if (coreService.storage.temp.newVersion) {
            enqueueSnackbar({
                message: t('newVersion.title', { version: coreService.storage.persistent.lastUsageVersion }),
            });
            coreService.storage.updateTemp({ newVersion: false });
        }

        return () => {
            localListeners.forEach((listenerId) => coreService.localEventBus.removeListener(listenerId));
            globalListeners.forEach((listenerId) => coreService.localEventBus.removeListener(listenerId));
        };
    }, []);

    return (
        <React.Fragment>
            {children}
            <ContextMenu
                isOpen={contextMenuPosition !== null}
                position={contextMenuPosition}
                actions={contextMenuActions}
                onClose={() => setContextMenuPosition(null)}
            />
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
                    {t('bookmark.remove.title')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('bookmark.remove.description')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEdit(null)} color="primary">
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={() => {
                            bookmarksStore.bookmarks.remove(edit.id);
                            setEdit(null);
                        }}
                        color="primary"
                        autoFocus
                    >
                        {t('remove')}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={(edit && edit.action === 'remove' && edit.type === 'category') || false}
                onClose={() => setEdit(null)}
            >
                <DialogTitle>
                    {t('category.remove.title')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('category.remove.description')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEdit(null)} color="primary">
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={() => {
                            bookmarksStore.categories.remove(edit.id);
                            setEdit(null);
                        }}
                        color="primary"
                        autoFocus
                    >
                        {t('remove')}
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}

export default observer(GlobalModals);
