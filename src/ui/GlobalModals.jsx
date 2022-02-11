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
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import { useCoreService } from '@/stores/app/core';
import EditTagModal from '@/ui/Bookmarks/Tag/EditModal';
import { default as EditBookmarkModal } from '@/ui/Bookmarks/EditBookmarkModal';
import EditFolderModal from '@/ui/Bookmarks/Folders/EditModal';
import MoveDialog from '@/ui/Bookmarks/MoveDialog';
import fetchData from '@/utils/helpers/fetchData';
import Changelog from './Changelog';

function GlobalModals({ children }) {
    const { t } = useTranslation(['folder']);
    const bookmarksStore = useWorkingSpaceService();
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const coreService = useCoreService();
    const [edit, setEdit] = useState(null);

    useEffect(() => {
        const localListeners = [
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
            coreService.localEventBus.on('folder/edit', ({ id, anchorEl, position, options }) => setEdit({
                type: 'folder',
                action: 'edit',
                id,
                anchorEl,
                position,
                options,
            })),
            coreService.localEventBus.on('folder/remove', ({ id }) => setEdit({
                type: 'folder',
                action: 'remove',
                id,
            })),
        ];

        const saveLocalBackup = async (path) => {
            console.log('path:', path);
            const generateFormatter = new Intl.DateTimeFormat('en', {
                weekday: 'long',
                month: 'short',
                day: '2-digit',
                year: 'numeric',
            });

            // FIXME: A terrible solution, first we cache, then download and create a URL, try to change it somehow
            const { response } = await fetchData(path, { responseType: 'blob' });

            const link = document.createElement('a');

            link.href = URL.createObjectURL(response);
            link.download = `Backup rigami from ${generateFormatter.format(new Date())}.rigami`;

            link.click();

            enqueueSnackbar({
                message: t('settingsSync:localBackup.create.state.success'),
                variant: 'success',
            });
            coreService.storage.update({ localBackup: null });
        };

        const globalListeners = [
            coreService.globalEventBus.on('system/backup/local/create/progress', ({ data }) => {
                console.log('coreService.tempStorage.data:', coreService.tempStorage.data);
                if (coreService.tempStorage.data.progressCreateSnackbar) {
                    closeSnackbar(coreService.tempStorage.data.progressCreateSnackbar);
                    coreService.tempStorage.update({ progressCreateSnackbar: null });
                }

                if (data.stage === 'start') {
                    const snackId = enqueueSnackbar({
                        message: t('settingsSync:localBackup.create.state.creating'),
                        variant: 'progress',
                    }, { persist: true });

                    coreService.tempStorage.update({ progressCreateSnackbar: snackId });
                    console.log('coreService.tempStorage.data:', snackId, coreService.tempStorage.data.progressCreateSnackbar);
                } else if (data.stage === 'error') {
                    enqueueSnackbar({
                        message: t('settingsSync:localBackup.create.error.unknown'),
                        variant: 'error',
                    });
                } else if (data.stage === 'done') {
                    saveLocalBackup(data.path);
                }
            }),
            coreService.globalEventBus.on('system/backup/local/restore/progress', ({ data }) => {
                if (coreService.tempStorage.data.progressRestoreSnackbar) {
                    closeSnackbar(coreService.tempStorage.data.progressRestoreSnackbar);
                }

                if (data.result === 'start') {
                    const snackId = enqueueSnackbar({
                        message: t('settingsSync:localBackup.restore.state.restoring'),
                        variant: 'progress',
                    }, { persist: true });

                    coreService.tempStorage.update({ progressRestoreSnackbar: snackId });
                } else if (data.result === 'done') {
                    location.reload();
                } else if (data.result === 'error') {
                    enqueueSnackbar({
                        message: t(`settingsSync:localBackup.restore.error.${data.message}`),
                        variant: data.result,
                    });

                    coreService.storage.update({
                        restoreBackup: null,
                        restoreBackupError: null,
                    });
                }
            }),
        ];

        if (coreService.storage.data.localBackup) {
            if (coreService.storage.data.localBackup === 'creating') {
                const snackId = enqueueSnackbar({
                    message: t('settingsSync:localBackup.create.state.creating'),
                    variant: 'progress',
                }, { persist: true });

                coreService.tempStorage.update({ progressCreateSnackbar: snackId });
            } else if (coreService.storage.data.localBackup === 'error') {
                enqueueSnackbar({
                    message: t('settingsSync:localBackup.create.error.unknown'),
                    variant: 'error',
                });
                coreService.storage.update({ localBackup: null });
            } else if (coreService.storage.data.localBackup === 'done') {
                saveLocalBackup();
            }
        }

        if (coreService.storage.data.restoreBackup) {
            if (coreService.storage.data.restoreBackup === 'restoring') {
                const snackId = enqueueSnackbar({
                    message: t('settingsSync:localBackup.restore.state.restoring'),
                    variant: 'progress',
                }, { persist: true });

                coreService.tempStorage.update({ progressRestoreSnackbar: snackId });
            } else if (coreService.storage.data.restoreBackup === 'error') {
                enqueueSnackbar({
                    message: t(`settingsSync:localBackup.restore.error.${
                        coreService.storage.data.restoreBackupError
                    }`),
                    variant: 'error',
                });
                coreService.storage.update({
                    restoreBackup: null,
                    restoreBackupError: null,
                });
            } else if (coreService.storage.data.restoreBackup === 'done') {
                coreService.storage.update({ restoreBackup: null });
                enqueueSnackbar({
                    message: t('settingsSync:localBackup.restore.state.success'),
                    variant: 'success',
                });
            }
        }

        return () => {
            localListeners.forEach((listenerId) => coreService.localEventBus.removeListener(listenerId));
            globalListeners.forEach((listenerId) => coreService.localEventBus.removeListener(listenerId));
        };
    }, []);

    return (
        <React.Fragment>
            {children}
            <Changelog />
            {BUILD === 'full' && (
                <React.Fragment>
                    <MoveDialog />
                    <EditBookmarkModal />
                    <EditTagModal
                        anchorEl={edit && edit.anchorEl}
                        isOpen={edit && edit.type === 'tag' && edit.action === 'edit'}
                        onSave={() => setEdit(null)}
                        onClose={() => setEdit(null)}
                        editId={edit && edit.id}
                    />
                    <EditFolderModal
                        anchorEl={edit && edit.anchorEl}
                        position={edit && edit.position}
                        isOpen={edit && edit.type === 'folder' && edit.action === 'edit'}
                        onSave={() => setEdit(null)}
                        onClose={() => setEdit(null)}
                        editId={edit && edit.id}
                        simple
                        {...(edit?.options || {})}
                    />
                    {['bookmark', 'tag', 'folder'].map((type) => (
                        <Dialog
                            data-role="dialog"
                            key={type}
                            open={(edit && edit.action === 'remove' && edit.type === type) || false}
                            onClose={() => setEdit(null)}
                            disableEnforceFocus
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
            )}
        </React.Fragment>
    );
}

export default observer(GlobalModals);
