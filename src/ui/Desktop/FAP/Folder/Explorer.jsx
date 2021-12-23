import React, { useEffect, useState } from 'react';
import { Button, CircularProgress, DialogContent, Divider } from '@material-ui/core';
import Folder from './Folder';
import PopperDialog, { PopoverDialogHeader } from '@/ui-components/PopoverDialog';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import Folders from '@/ui/Bookmarks/FoldersPanel/Folders';
import { makeStyles } from '@material-ui/core/styles';
import Stub from '@/ui-components/Stub';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';
import { useTranslation } from 'react-i18next';
import useCoreService from '@/stores/app/BaseStateProvider';
import { ArrowForward as GoToIcon } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
    tree: {
        minHeight: 300,
        minWidth: 400,
        overflow: 'auto',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
    },
    emptyStub: {
        flexGrow: 1,
    },
}));

function Explorer({ id }) {
    const classes = useStyles();
    const bookmarksService = useBookmarksService();
    const coreService = useCoreService();
    const { t } = useTranslation(['folder', 'bookmark']);
    const [folder, setFolder] = useState(null);
    const [isSearching, setIsSearching] = useState(true);
    const [findBookmarks, setFindBookmarks] = useState(null);
    const [folders, setFolders] = useState([]);
    // const [path, setPath] = useState([rootId]);

    // useEffect(() => setPath([rootId]), [rootId]);

    useEffect(() => {
        setIsSearching(true);
        FoldersUniversalService.get(id).then((findFolder) => setFolder(findFolder));
        let load = true;

        /* FoldersUniversalService.getFoldersByParent(id)
            .then((foundFolders) => {
                setFolders(foundFolders);
                setIsSearching(load);
                load = false;
            });

        BookmarksUniversalService.getAllInFolder(id)
            .then((searchResult) => {
                setFindBookmarks(searchResult);
                setIsSearching(load);
                load = false;
            }); */
    }, [bookmarksService.lastTruthSearchTimestamp]);

    return (
        <React.Fragment>
            <PopoverDialogHeader
                title={folder ? folder.name : "Загрузка..."}
                action={(
                    <Button
                        color="primary"
                        endIcon={(<GoToIcon />)}
                        onClick={() => {
                            // store.anchorEl = null;
                            // chrome.sessions.restore(store.openWindowSession?.sessionId);
                        }}
                    >
                        {t('openAsPage')}
                    </Button>
                )}
            />
            <DialogContent className={classes.tree}>
                <Folders
                    rootFolder={id}
                    disableAdd
                    emptyRender={() => (
                        <Stub message={t('bookmark:empty')} className={classes.emptyStub}>
                            <Button
                                onClick={() => coreService.localEventBus.call(
                                    'bookmark/create',
                                    { defaultFolderId: id },
                                )}
                                startIcon={<AddBookmarkIcon />}
                                variant="contained"
                                color="primary"
                            >
                                {t('bookmark:button.add', { context: 'first' })}
                            </Button>
                        </Stub>
                    )}
                    // selectFolder={id}
                    /* onClickFolder={({ id }) => {
                        store.folderId = id;
                    }} */
                />
            </DialogContent>
            {/* path.map((id, index) => (
                <React.Fragment key={id}>
                    <Folder
                        id={id}
                        openFolderId={path[index + 1]}
                        shrink={index < path.length - 2}
                        rootFolder={index === path.length - 1}
                        onOpenFolder={(folderId) => {
                            if (index === path.length - 1) {
                                setPath([...path, folderId]);
                            } else {
                                setPath([...path.slice(0, index + 1), folderId]);
                            }
                        }}
                        onBack={() => {
                            setPath([...path.slice(0, index + 1)]);
                        }}
                    />
                    {index !== path.length - 1 && (
                        <Divider variant="fullWidth" orientation="vertical" flexItem />
                    )}
                </React.Fragment>
            )) */}
        </React.Fragment>
    );
}

export default Explorer;
