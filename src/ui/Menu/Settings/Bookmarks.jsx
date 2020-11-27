import React, { useEffect, useState } from 'react';
import { useObserver } from 'mobx-react-lite';
import {
    ACTIVITY,
    BKMS_FAP_POSITION,
    BKMS_FAP_STYLE,
    DESTINATION,
} from '@/enum';
import {
    Button,
    Collapse,
    Dialog, DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import useBookmarksService from '@/stores/BookmarksProvider';
import MenuInfo from '@/ui/Menu/MenuInfo';
import SectionHeader from '@/ui/Menu/SectionHeader';
import useCoreService from '@/stores/BaseStateProvider';
import useAppService from '@/stores/AppStateProvider';
import { makeStyles } from '@material-ui/core/styles';
import FolderEditor from '@/ui/Bookmarks/Folders/EditModal';

const headerProps = { title: 'settings.bookmarks.title' };

const useStyles = makeStyles((theme) => ({
    reRunSyncButton: {
        flexShrink: 0,
    },
}));

function BrowserSync() {
    const classes = useStyles();
    const { t } = useTranslation();
    const coreService = useCoreService();
    const bookmarksService = useBookmarksService();
    const [editorAnchor, setEditorAnchor] = useState(null);
    const [syncFolderId, setSyncFolderId] = useState(coreService.storage.persistent.syncBrowserFolder);
    const [syncFolder, setSyncFolder] = useState(null);
    const [foldersRoot, setFoldersRoot] = useState(null);
    const [foldersEditorOpen, setFoldersEditorOpen] = useState(false);

    useEffect(() => {
        bookmarksService.folders.getFoldersByParent().then((rootFolders) => setFoldersRoot(rootFolders));
    }, []);

    useEffect(() => {
        setSyncFolderId(coreService.storage.persistent.syncBrowserFolder);
        bookmarksService.folders.get(coreService.storage.persistent.syncBrowserFolder)
            .then((folder) => setSyncFolder(folder));
    }, [coreService.storage.persistent.syncBrowserFolder]);


    return useObserver(() => (
        <React.Fragment>
            <SectionHeader title={t("settings.bookmarks.systemBookmarks.title")} />
            <MenuRow
                title={t("settings.bookmarks.systemBookmarks.syncSystemBookmarks.title")}
                description={t(
                    "settings.bookmarks.systemBookmarks.syncSystemBookmarks.description",
                    { folderName: syncFolder ? syncFolder.name : 'load...' },
                )}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    value: bookmarksService.settings.syncWithSystem,
                    onChange: (event, value) => {
                        bookmarksService.settings.update({ syncWithSystem: value });
                    },
                }}
            />
            <Collapse in={bookmarksService.settings.syncWithSystem}>
                <MenuRow
                    title={t('settings.bookmarks.systemBookmarks.syncFolder.title')}
                    description={t('settings.bookmarks.systemBookmarks.syncFolder.description')}
                    disabled={foldersRoot === null}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => value === 'new-folder'
                            ? t('settings.bookmarks.systemBookmarks.syncFolder.newFolder')
                            : (foldersRoot ? foldersRoot.find(({ id }) => id === value)?.name : 'load...'),
                        value: syncFolderId,
                        onOpen: (event) => setEditorAnchor(event.target),
                        onChange: (event) => {
                            if (event.target.value === 'new-folder') {
                                setFoldersEditorOpen(true);
                                setSyncFolderId('new-folder');
                            } else {
                                setSyncFolderId(event.target.value);
                                coreService.storage.updatePersistent({ syncBrowserFolder: event.target.value });
                            }
                        },
                        values: [...(foldersRoot ? foldersRoot.map(({ id }) => id) : []), 'new-folder'],
                    }}
                />
                <FolderEditor
                    anchorEl={editorAnchor}
                    isOpen={foldersEditorOpen}
                    editRootFolders
                    addNewFolderByParentId={0}
                    onSave={(folderId) => {
                        bookmarksService.folders.getFoldersByParent()
                            .then((rootFolders) => {
                                setFoldersRoot(rootFolders);
                                setSyncFolderId(folderId);
                                coreService.storage.updatePersistent({ syncBrowserFolder: folderId });
                            });
                        setFoldersEditorOpen(false);
                    }}
                    onClose={() => {
                        setSyncFolderId(coreService.storage.persistent.syncBrowserFolder);
                        setFoldersEditorOpen(false);
                    }}
                />
                <MenuRow
                    title={t('settings.bookmarks.systemBookmarks.reRunSync.title')}
                    description={t('settings.bookmarks.systemBookmarks.reRunSync.description')}
                    action={{
                        type: ROWS_TYPE.CUSTOM,
                        onClick: () => {},
                        component: (
                            <Button
                                variant="contained"
                                component="span"
                                color="primary"
                                className={classes.reRunSyncButton}
                                fullWidth
                                onClick={() => {
                                    coreService.globalEventBus.call('system/parseSystemBookmarks', DESTINATION.BACKGROUND);
                                }}
                            >
                                {t('settings.bookmarks.systemBookmarks.reRunSync.button')}
                            </Button>
                        ),
                    }}
                />
            </Collapse>
        </React.Fragment>
    ));
}

function BookmarksSettings() {
    const bookmarksService = useBookmarksService();
    const appService = useAppService();
    const { t } = useTranslation();

    return useObserver(() => (
        <React.Fragment>
            <SectionHeader title={t('settings.bookmarks.general.title')} />
            <MenuRow
                title={t('settings.bookmarks.general.openOnStartup.title')}
                description={t('settings.bookmarks.general.openOnStartup.description')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    value: appService.settings.defaultActivity === ACTIVITY.BOOKMARKS,
                    onChange: (event, value) => appService.settings
                        .update({ defaultActivity: value ? ACTIVITY.BOOKMARKS : ACTIVITY.DESKTOP }),
                }}
            />
            <SectionHeader title={t('settings.bookmarks.FAP.title')} />
            <MenuRow
                title={t('settings.bookmarks.FAP.useFAP.title')}
                description={t('settings.bookmarks.FAP.useFAP.description')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    value: bookmarksService.settings.fapStyle !== BKMS_FAP_STYLE.HIDDEN,
                    onChange: (event, value) => bookmarksService.settings
                        .update({ fapStyle: value ? BKMS_FAP_STYLE.CONTAINED : BKMS_FAP_STYLE.HIDDEN }),
                }}
            />
            <MenuInfo
                width={750}
                show={(
                    bookmarksService.settings.fapStyle !== BKMS_FAP_STYLE.HIDDEN
                    && bookmarksService.favorites.length === 0
                )}
                message={t('settings.bookmarks.FAP.fapEmptyWarningMessage')}
            />
            <Collapse in={bookmarksService.settings.fapStyle !== BKMS_FAP_STYLE.HIDDEN}>
                <MenuRow
                    title={t('settings.bookmarks.FAP.fapStyle.title')}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => t(`settings.bookmarks.FAP.fapStyle.style.${value}`),
                        value: bookmarksService.settings.fapStyle,
                        onChange: (event) => bookmarksService.settings.update({ fapStyle: event.target.value }),
                        values: [BKMS_FAP_STYLE.CONTAINED, BKMS_FAP_STYLE.TRANSPARENT],
                    }}
                />
                <MenuRow
                    title={t('settings.bookmarks.FAP.fapPosition.title')}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => t(`settings.bookmarks.FAP.fapPosition.position.${value}`),
                        value: bookmarksService.settings.fapPosition,
                        onChange: (event) => bookmarksService.settings.update({ fapPosition: event.target.value }),
                        values: [BKMS_FAP_POSITION.TOP, BKMS_FAP_POSITION.BOTTOM],
                    }}
                />
            </Collapse>
            <BrowserSync />
        </React.Fragment>
    ));
}

export { headerProps as header, BookmarksSettings as content };
