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
import useBookmarksService from '@/stores/app/BookmarksProvider';
import useCoreService from '@/stores/app/BaseStateProvider';
import EditTagModal from '@/ui/Bookmarks/Tags/EditModal';
import { useTranslation } from 'react-i18next';
import EditBookmarkModal from '@/ui/Bookmarks/EditBookmarkModal';
import EditFolderModal from '@/ui/Bookmarks/Folders/EditModal';
import ContextMenu from '@/ui/ContextMenu';
import { useSnackbar } from 'notistack';
import { getUrl } from '@/utils/fs';

function GlobalModals({ children }) {
    const { t } = useTranslation();
    const bookmarksStore = useBookmarksService();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const coreService = useCoreService();
    const [edit, setEdit] = useState(null);

    useEffect(() => {
        const localListeners = [
            coreService.localEventBus.on('bookmark/create', (options = {}) => setEdit({
                type: 'bookmark',
                action: 'create',
                options,
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
            coreService.localEventBus.on('tag/edit', ({ id, anchorEl }) => setEdit({
                type: 'tag',
                action: 'edit',
                id,
                anchorEl,
            })),
            coreService.localEventBus.on('tag/remove', ({ id }) => setEdit({
                type: 'tag',
                action: 'remove',
                id,
            })),
            coreService.localEventBus.on('folder/edit', ({ id, anchorEl, options }) => {
                console.log('folder/edit', {
                    id,
                    anchorEl,
                    options,
                });

                setEdit({
                    type: 'folder',
                    action: 'edit',
                    id,
                    anchorEl,
                    options,
                });
            }),
            coreService.localEventBus.on('folder/remove', ({ id }) => setEdit({
                type: 'folder',
                action: 'remove',
                id,
            })),
        ];

        const saveLocalBackup = () => {
            const generateFormatter = new Intl.DateTimeFormat('en', {
                weekday: 'long',
                month: 'short',
                day: '2-digit',
                year: 'numeric',
            });

            const link = document.createElement('a');
            link.href = getUrl('/temp/backup.zip');
            link.download = `Backup rigami from ${generateFormatter.format(new Date())}.rigami`;

            link.click();

            enqueueSnackbar({
                message: t('settingsBackup:createLocalBackup.state.success'),
                variant: 'success',
            });
            coreService.storage.updatePersistent({ localBackup: null });
        };

        const globalListeners = [
            coreService.globalEventBus.on('system/backup/local/create/progress', (data) => {
                if (coreService.storage.temp.progressCreateSnackbar) {
                    closeSnackbar(coreService.storage.temp.progressCreateSnackbar);
                    coreService.storage.updateTemp({ progressCreateSnackbar: null });
                }

                if (data.stage === 'start') {
                    const snackId = enqueueSnackbar({
                        message: t('settingsBackup:createLocalBackup.state.creating'),
                        variant: 'progress',
                    }, { persist: true });

                    coreService.storage.updateTemp({ progressCreateSnackbar: snackId });
                } else if (data.stage === 'error') {
                    enqueueSnackbar({
                        message: t('settingsBackup:createLocalBackup.error.unknown'),
                        variant: 'error',
                    });
                } else if (data.stage === 'done') {
                    saveLocalBackup();
                }
            }),
            coreService.globalEventBus.on('system/backup/local/restore/progress', (data) => {
                if (coreService.storage.temp.progressRestoreSnackbar) {
                    closeSnackbar(coreService.storage.temp.progressRestoreSnackbar);
                }

                if (data.result === 'start') {
                    const snackId = enqueueSnackbar({
                        message: t('settingsBackup:restoreLocalBackup.state.restoring'),
                        variant: 'progress',
                    }, { persist: true });

                    coreService.storage.updateTemp({ progressRestoreSnackbar: snackId });
                } else if (data.result === 'done') {
                    location.reload();
                } else if (data.result === 'error') {
                    enqueueSnackbar({
                        message: t(`settingsBackup:restoreLocalBackup.error.${data.message}`),
                        variant: data.result,
                    });

                    coreService.storage.updatePersistent({
                        restoreBackup: null,
                        restoreBackupError: null,
                    });
                }
            }),
        ];

        if (coreService.storage.persistent.localBackup) {
            if (coreService.storage.persistent.localBackup === 'creating') {
                const snackId = enqueueSnackbar({
                    message: t('settingsBackup:createLocalBackup.state.creating'),
                    variant: 'progress',
                }, { persist: true });

                coreService.storage.updateTemp({ progressCreateSnackbar: snackId });
            } else if (coreService.storage.persistent.localBackup === 'error') {
                enqueueSnackbar({
                    message: t('settingsBackup:createLocalBackup.error.unknown'),
                    variant: 'error',
                });
                coreService.storage.updatePersistent({ localBackup: null });
            } else if (coreService.storage.persistent.localBackup === 'done') {
                saveLocalBackup();
            }
        }

        if (coreService.storage.persistent.restoreBackup) {
            if (coreService.storage.persistent.restoreBackup === 'restoring') {
                const snackId = enqueueSnackbar({
                    message: t('settingsBackup:restoreLocalBackup.state.restoring'),
                    variant: 'progress',
                }, { persist: true });

                coreService.storage.updateTemp({ progressRestoreSnackbar: snackId });
            } else if (coreService.storage.persistent.restoreBackup === 'error') {
                enqueueSnackbar({
                    message: t(`settingsBackup:restoreLocalBackup.error.${coreService.storage.persistent.restoreBackupError}`),
                    variant: 'error',
                });
                coreService.storage.updatePersistent({
                    restoreBackup: null,
                    restoreBackupError: null,
                });
            } else if (coreService.storage.persistent.restoreBackup === 'done') {
                coreService.storage.updatePersistent({ restoreBackup: null });
                enqueueSnackbar({
                    message: t('settingsBackup:restoreLocalBackup.state.success'),
                    variant: 'success',
                });
            }
        }

        if (coreService.storage.temp.newVersion) {
            const snackbar = enqueueSnackbar({
                message: t('newVersion:title', { version: coreService.storage.persistent.lastUsageVersion }),
                description: t('newVersion:description'),
                buttons: [
                    {
                        title: t('newVersion:button.ok'),
                        onClick: () => {
                            closeSnackbar(snackbar);
                        },
                    },
                    /* { title: t('newVersion.changelog'), onClick: () => {
                            setEdit({ type: 'changelog', action: 'open', });
                        } }, */
                ],
            }, { autoHideDuration: 18000 });
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
            {/* <InterrogationRequest /> */}
            <ContextMenu />
            <EditBookmarkModal
                isOpen={edit && edit.type === 'bookmark' && edit.action !== 'remove'}
                editBookmarkId={edit && edit.id}
                onClose={() => setEdit(null)}
                {...((edit && edit.options) || {})}
            />
            <EditTagModal
                anchorEl={edit && edit.anchorEl}
                isOpen={edit && edit.type === 'tag' && edit.action !== 'remove'}
                onSave={() => setEdit(null)}
                onClose={() => setEdit(null)}
                editId={edit && edit.id}
            />
            <EditFolderModal
                anchorEl={edit && edit.anchorEl}
                isOpen={edit && edit.type === 'folder' && edit.action !== 'remove'}
                onSave={() => setEdit(null)}
                onClose={() => setEdit(null)}
                editId={edit && edit.id}
                simple
                {...(edit?.options || {})}
            />
            {/* <Changelog
                open={edit && edit.type === 'changelog' && edit.action === 'open'}
                onClose={() => setEdit(null)}
            /> */}
            {['bookmark', 'tag', 'folder'].map((type) => (
                <Dialog
                    key={type}
                    open={(edit && edit.action === 'remove' && edit.type === type) || false}
                    onClose={() => setEdit(null)}
                >
                    <DialogTitle>
                        {t(`${type}:remove.confirm`)}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {t(`${type}:remove.confirm`, { context: 'description' })}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            data-ui-path={`dialog.${type}.cancelRemove`}
                            onClick={() => setEdit(null)}
                            color="primary"
                        >
                            {t('common:button.cancel')}
                        </Button>
                        <Button
                            data-ui-path={`dialog.${type}.remove`}
                            onClick={() => {
                                if (type === 'bookmark') {
                                    bookmarksStore.bookmarks.remove(edit.id);
                                } else if (type === 'tag') {
                                    bookmarksStore.tags.remove(edit.id);
                                } else if (type === 'folder') {
                                    bookmarksStore.folders.remove(edit.id);
                                }
                                setEdit(null);
                            }}
                            color="primary"
                            autoFocus
                        >
                            {t('common:button.remove')}
                        </Button>
                    </DialogActions>
                </Dialog>
            ))}
        </React.Fragment>
    );
}

export default observer(GlobalModals);
