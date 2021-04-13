import React, { Fragment, useEffect } from 'react';
import {
    Box,
    Button,
    Divider,
    Typography,
} from '@material-ui/core';
import { FETCH } from '@/enum';
import BookmarksUniversalService, { SearchQuery } from '@/stores/universal/bookmarks/bookmarks';
import { useLocalObservable, observer } from 'mobx-react-lite';
import stateRender from '@/utils/stateRender';
import Header from '@/ui/Bookmarks/BookmarksViewer/Header';
import BookmarksGrid from '@/ui/Bookmarks/BookmarksGrid';
import { ArrowForward as GoToIcon } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { map, size, omit } from 'lodash';
import FolderBreadcrumbs from '@/ui/Bookmarks/ToolsPanel/FolderBreadcrumbs';

const useStyles = makeStyles((theme) => ({
    root: { width: (theme.shape.dataCard.width + theme.spacing(2)) * 3 + theme.spacing(2) },
    goToButton: {
        textTransform: 'none',
        color: theme.palette.secondary.main,
        fontWeight: 800,
    },
    bookmarksGrid: {
        padding: theme.spacing(0, 2),
        maxHeight: (theme.shape.dataCard.height + theme.spacing(2)) * 3,
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1, 2),
    },
    countResults: {
        color: theme.palette.text.secondary,
        marginLeft: 'auto',
    },
    stub: { padding: theme.spacing(2) },
}));

function FastResults({ searchService: service, onGoToFolder }) {
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const store = useLocalObservable(() => ({
        bookmarks: null,
        currentFolder: [],
        otherFolders: [],
        requestId: 0,
        loadState: FETCH.WAIT,
    }));

    useEffect(() => {
        store.loadState = FETCH.PENDING;
        store.requestId += 1;
        const currentRequestId = store.requestId;

        BookmarksUniversalService.query(new SearchQuery({
            query: service.tempSearchRequest.query,
            tags: service.tempSearchRequest.tags,
        }))
            .then((result) => {
                if (currentRequestId !== store.requestId) return;
                const byFolders = {};

                (result.all || []).forEach((bookmark) => {
                    byFolders[bookmark.folderId] = [...(byFolders[bookmark.folderId] || []), bookmark];
                });

                store.currentFolder = byFolders[service.activeFolderId] || [];
                store.otherFolders = map(
                    omit(byFolders, [service.activeFolderId]),
                    (bookmarks, folderId) => ({
                        bookmarks,
                        folderId,
                    }),
                );
                store.loadState = FETCH.DONE;
            });
    }, [service.tempSearchRequest]);

    return (
        <Box className={classes.root}>
            {stateRender(
                store.loadState,
                <Fragment>
                    {store.currentFolder.length !== 0 && (
                        <Fragment>
                            <Box className={classes.header}>
                                <Button
                                    endIcon={(<GoToIcon />)}
                                    className={classes.goToButton}
                                    onClick={() => {
                                        onGoToFolder(store.currentFolder, true);
                                    }}
                                >
                                    In the current folder
                                </Button>
                                <Typography
                                    variant="caption"
                                    className={classes.countResults}
                                >
                                    {`${store.currentFolder.length} results`}
                                </Typography>
                            </Box>
                            <BookmarksGrid
                                bookmarks={store.currentFolder}
                                columns={3}
                                maxRows={3}
                                classes={{ bookmarks: classes.bookmarksGrid }}
                            />
                        </Fragment>
                    )}
                    {store.otherFolders.map(({ bookmarks, folderId }, index) => (
                        <Fragment key={folderId}>
                            {(index !== 0 || (index === 0 && store.currentFolder.length !== 0)) && (<Divider />)}
                            <Box className={classes.header}>
                                <FolderBreadcrumbs
                                    folderId={+folderId}
                                    lastClickable
                                    classes={{ last: classes.goToButton }}
                                    onSelectFolder={(selectFolderId) => {
                                        onGoToFolder(selectFolderId, selectFolderId === +folderId);
                                    }}
                                />
                                <Typography
                                    variant="caption"
                                    className={classes.countResults}
                                >
                                    {`${bookmarks.length} results`}
                                </Typography>
                            </Box>
                            <BookmarksGrid
                                bookmarks={bookmarks}
                                columns={3}
                                maxRows={3}
                                classes={{ bookmarks: classes.bookmarksGrid }}
                            />
                        </Fragment>
                    ))}
                    {size(store.otherFolders) === 0 && store.currentFolder.length === 0 && (
                        <Typography variant="body1" className={classes.stub}>{t('search.nothingFound')}</Typography>
                    )}
                </Fragment>,
                <Typography variant="body1" className={classes.stub}>Search...</Typography>,
            )}
        </Box>
    );
}

export default observer(FastResults);
