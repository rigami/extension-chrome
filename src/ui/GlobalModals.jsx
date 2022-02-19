import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useCoreService } from '@/stores/app/core';
import fetchData from '@/utils/helpers/fetchData';
import Changelog from './Changelog';

function GlobalModals({ children }) {
    const { t } = useTranslation(['folder']);
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const coreService = useCoreService();

    useEffect(() => {
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
            globalListeners.forEach((listenerId) => coreService.localEventBus.removeListener(listenerId));
        };
    }, []);

    return (
        <React.Fragment>
            {children}
            <Changelog />
        </React.Fragment>
    );
}

export default observer(GlobalModals);
