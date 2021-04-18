import React, {
    Fragment,
    useState,
    useRef,
    // useEffect,
} from 'react';
import {
    Popper,
    Button,
    Grow,
    Paper,
    ClickAwayListener,
    MenuList,
    MenuItem,
    Checkbox,
    ListItemText,
    ListItemIcon,
    // Collapse,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import { SaveAltRounded as SaveIcon } from '@material-ui/icons';
import { eventToApp, eventToBackground } from '@/stores/server/bus';
import { observer } from 'mobx-react-lite';
import fs from '@/utils/fs';
/* import useCoreService from '@/stores/app/BaseStateProvider';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import SectionHeader from '@/ui/Menu/SectionHeader';
import FolderEditor from '@/ui/Bookmarks/Folders/EditModal';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders'; */

const useStyles = makeStyles((theme) => ({
    backupButton: { flexShrink: 0 },
    fullWidth: { width: '100%' },
    saveIcon: { marginLeft: 10 },
    paper: {
        margin: theme.spacing(1),
        width: 252,
    },
    optionLabel: {
        wordBreak: 'break-word',
        whiteSpace: 'break-spaces',
    },
    popper: { zIndex: theme.zIndex.modal },
    input: { display: 'none' },
    reRunSyncButton: { flexShrink: 0 },
    fixOverflow: { whiteSpace: 'normal' },
    alignTop: { alignSelf: 'flex-start' },
}));

const headerProps = { title: 'settings:backup' };
const pageProps = { width: 750 };

/* function BrowserSync() {
    const classes = useStyles();
    const { t } = useTranslation();
    const coreService = useCoreService();
    const bookmarksService = useBookmarksService();
    const [editorAnchor, setEditorAnchor] = useState(null);
    const [syncFolderId, setSyncFolderId] = useState(coreService.storage.persistent.syncBrowserFolder);
    const [syncFolderName, setSyncFolderName] = useState(null);
    const [foldersRoot, setFoldersRoot] = useState(null);
    const [foldersEditorOpen, setFoldersEditorOpen] = useState(false);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        FoldersUniversalService.getFoldersByParent().then((rootFolders) => setFoldersRoot(rootFolders));
    }, []);

    useEffect(() => {
        setSyncFolderId(coreService.storage.persistent.syncBrowserFolder);
        FoldersUniversalService.get(coreService.storage.persistent.syncBrowserFolder)
            .then((folder) => setSyncFolderName(folder.name));
    }, [coreService.storage.persistent.syncBrowserFolder]);

    return (
        <React.Fragment>
            <SectionHeader title={t('systemBookmarks.title')} />
            <MenuRow
                title={t('systemBookmarks.syncSystemBookmarks.title')}
                description={t(
                    'systemBookmarks.syncSystemBookmarks.description',
                    { folderName: syncFolderName || 'load...' },
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
                    title={t('systemBookmarks.syncFolder.title')}
                    description={t('systemBookmarks.syncFolder.description')}
                    disabled={foldersRoot === null}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => (value === 'new-folder'
                            ? t('systemBookmarks.syncFolder.newFolder')
                            : (foldersRoot ? foldersRoot.find(({ id }) => id === value)?.name : 'load...')),
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
                        FoldersUniversalService.getFoldersByParent()
                            .then((rootFolders) => {
                                setFoldersRoot(rootFolders);
                            });
                        setSyncFolderId(folderId);
                        coreService.storage.updatePersistent({ syncBrowserFolder: folderId });
                        setFoldersEditorOpen(false);
                    }}
                    onClose={() => {
                        setSyncFolderId(coreService.storage.persistent.syncBrowserFolder);
                        setFoldersEditorOpen(false);
                    }}
                />
                <MenuRow
                    title={t('systemBookmarks.reRunSync.title')}
                    description={t('systemBookmarks.reRunSync.description')}
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
                                disabled={syncing}
                                onClick={() => {
                                    setSyncing(true);
                                    eventToBackground('system/parseSystemBookmarks', {}, () => {
                                        console.log('FINISH SYNC!');
                                        setSyncing(false);
                                    });
                                }}
                            >
                                {
                                    syncing
                                        ? t('systemBookmarks.reRunSync.progress')
                                        : t('systemBookmarks.reRunSync.button')
                                }
                            </Button>
                        ),
                    }}
                />
            </Collapse>
        </React.Fragment>
    );
} */

function LocalBackup() {
    const classes = useStyles();
    const { t } = useTranslation(['settingsBackup']);
    const anchorRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [saveItems, setSaveItems] = useState({
        settings: true,
        bookmarks: true,
        backgrounds: false,
    });

    const handleChange = (key, value) => {
        setSaveItems({
            ...saveItems,
            [key]: value,
        });
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target)) {
            return;
        }

        setOpen(false);
    };

    const handleSave = () => {
        setOpen(false);

        eventToBackground('system/backup/local/create', saveItems);
    };

    return (
        <Fragment>
            <Button
                data-ui-path="localBackup.create"
                ref={anchorRef}
                onClick={handleToggle}
                color="primary"
                variant="contained"
                fullWidth
                className={classes.backupButton}
            >
                {t('createLocalBackup.button.create')}
            </Button>
            <Popper
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                className={classes.popper}
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin: placement === 'bottom'
                                ? 'center top'
                                : 'center bottom',
                        }}
                    >
                        <Paper className={classes.paper} elevation={8}>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList disablePadding>
                                    <MenuItem
                                        onClick={() => handleChange('settings', !saveItems.settings)}
                                    >
                                        <ListItemIcon className={classes.alignTop}>
                                            <Checkbox
                                                color="primary"
                                                checked={saveItems.settings}
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            classes={{ primary: classes.optionLabel }}
                                            primary={t('syncItem.settings')}
                                        />
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => handleChange('bookmarks', !saveItems.bookmarks)}
                                    >
                                        <ListItemIcon className={classes.alignTop}>
                                            <Checkbox
                                                color="primary"
                                                checked={saveItems.bookmarks}
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            classes={{ primary: classes.optionLabel }}
                                            primary={t('syncItem.bookmarks')}
                                        />
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => handleChange('backgrounds', !saveItems.backgrounds)}
                                        divider
                                    >
                                        <ListItemIcon className={classes.alignTop}>
                                            <Checkbox
                                                color="primary"
                                                checked={saveItems.backgrounds}
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            classes={{
                                                primary: classes.optionLabel,
                                                secondary: classes.fixOverflow,
                                            }}
                                            primary={t('syncItem.backgrounds')}
                                            secondary={t('syncItem.backgrounds', { context: 'description' })}
                                        />
                                    </MenuItem>
                                    <MenuItem
                                        onClick={handleSave}
                                        color="primary"
                                        disabled={!saveItems.settings && !saveItems.bookmarks}
                                    >
                                        <ListItemIcon>
                                            <SaveIcon className={classes.saveIcon} />
                                        </ListItemIcon>
                                        <ListItemText
                                            classes={{ primary: classes.optionLabel }}
                                            primary={t('createLocalBackup.button.create')}
                                        />
                                    </MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </Fragment>
    );
}

// const ObserverBrowserSync = observer(BrowserSync);

function BackupSettings() {
    const classes = useStyles();
    const { t } = useTranslation(['settingsBackup']);

    const handleLocalRestore = async (event) => {
        const form = event.target;
        if (form.files.length === 0) return;

        try {
            eventToApp('system/backup/local/restore/progress', { result: 'start' });
            const file = form.files[0];
            const type = file.name.substring(file.name.lastIndexOf('.') + 1);

            fs().save(`/temp/restore-backup.${type}`, file).then(() => {
                eventToBackground('system/backup/local/restore', { type });
            });
        } catch (e) {
            eventToApp('system/backup/local/restore/progress', { result: 'brokenFile' });
        }
    };

    return (
        <React.Fragment>
            {/* <ObserverBrowserSync />
            <SectionHeader title={t('localBackup.title')} /> */}
            <MenuRow
                title={t('createLocalBackup.title')}
                description={t('createLocalBackup.description')}
                action={{
                    type: ROWS_TYPE.CUSTOM,
                    onClick: () => {},
                    component: (<LocalBackup />),
                }}
            />
            <MenuRow
                action={{
                    type: ROWS_TYPE.CUSTOM,
                    onClick: () => {},
                    component: (
                        <React.Fragment>
                            <input
                                className={classes.input}
                                id="upload-from-system"
                                type="file"
                                accept=".json,.ctbup,.rigami"
                                onChange={handleLocalRestore}
                            />
                            <label htmlFor="upload-from-system" className={classes.fullWidth}>
                                <Button
                                    data-ui-path="localBackup.restore"
                                    variant="contained"
                                    component="span"
                                    color="primary"
                                    fullWidth
                                    className={classes.backupButton}
                                >
                                    {t('restoreLocalBackup.button.restore')}
                                </Button>
                            </label>
                        </React.Fragment>
                    ),
                }}
            />
        </React.Fragment>
    );
}

const ObserverBackupSettings = observer(BackupSettings);

export {
    headerProps as header,
    ObserverBackupSettings as content,
    pageProps as props,
};

export default {
    header: headerProps,
    content: ObserverBackupSettings,
    props: pageProps,
};
