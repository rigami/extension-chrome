import React, { Fragment, useEffect } from 'react';
import {
    Box, Button, ButtonBase, CircularProgress,
} from '@material-ui/core';
import { FETCH } from '@/enum';
import BookmarksUniversalService, { SearchQuery } from '@/stores/universal/bookmarks/bookmarks';
import { useLocalObservable, observer } from 'mobx-react-lite';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import stateRender from '@/utils/stateRender';
import Header from '@/ui/Bookmarks/BookmarksViewer/Header';
import BookmarksGrid from '@/ui/Bookmarks/BookmarksGrid';
import clsx from 'clsx';
import Stub from '@/ui-components/Stub';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';
import { ArrowForward as GoToIcon } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { map, size, omit } from 'lodash';
import FolderBreadcrumbs from '@/ui/Bookmarks/ToolsPanel/FolderBreadcrumbs';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    },
    title: { fontSize: '2.25rem' },
    bookmarks: { },
    bottomOffset: { paddingBottom: theme.spacing(38) },
    goToButton: {
        width: '100%',
        margin: theme.spacing(0, -2),
        padding: theme.spacing(1, 2),
        borderRadius: 0,
        justifyContent: 'flex-end',
        boxSizing: 'content-box',
        textTransform: 'none',
        minHeight: theme.spacing(6),
    },
    bookmarksGrid: {
        maxHeight: (theme.shape.dataCard.height + theme.spacing(2)) * 3,
        overflow: 'hidden',
        marginBottom: theme.spacing(-2),
        '-webkit-mask': `linear-gradient(to top, transparent, black ${theme.spacing(2)}px)`,
    },
    header: { fontSize: '0.9rem' },
    offsetSection: { marginTop: theme.spacing(6) },
    stub: { padding: theme.spacing(2, 0) },
    breadcrumbs: { marginBottom: theme.spacing(1) },
}));

function FastResults({ searchService: service, onGoToFolder }) {
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const store = useLocalObservable(() => ({
        bookmarks: null,
        currentFolder: [],
        otherFolders: {},
        requestId: 0,
        loadState: FETCH.WAIT,
    }));

    useEffect(() => {
        store.loadState = FETCH.PENDING;
        store.requestId += 1;
        const currentRequestId = store.requestId;
        // let isDoneRequest = false;

        // TODO Wait before re-render. Now BookmarksGrid is slowly render
        /* setTimeout(() => {
            if (currentRequestId !== store.requestId || isDoneRequest) return;

            store.loadState = FETCH.PENDING;
        }, 100); */

        BookmarksUniversalService.query(new SearchQuery({
            query: service.searchRequest.query,
            tags: service.searchRequest.tags,
        }))
            .then((result) => {
                if (currentRequestId !== store.requestId) return;

                // isDoneRequest = true;
                console.log('query:', result, service.searchRequest);

                const bookmarks = result.all || [];
                const byFolders = {};

                bookmarks.forEach((bookmark) => {
                    byFolders[bookmark.folderId] = [...(byFolders[bookmark.folderId] || []), bookmark];
                });

                store.currentFolder = byFolders[service.activeFolderId] || [];
                store.otherFolders = omit(byFolders, [service.activeFolderId]);
                store.loadState = FETCH.DONE;
            });
    }, [service.searchRequest]);

    return (
        <Box p={2} pb={0} pt={0}>
            {stateRender(
                store.loadState,
                <Fragment>
                    <Header title="In current folder" classes={{ title: classes.header }} />
                    {store.currentFolder.length !== 0 && (
                        <Box display="flex" className={classes.bookmarks}>
                            <BookmarksGrid
                                bookmarks={store.currentFolder}
                                columns={3}
                                maxRows={3}
                                classes={{ bookmarks: classes.bookmarksGrid }}
                                overloadContent={(count) => (
                                    <Button
                                        className={classes.goToButton}
                                        color="secondary"
                                        endIcon={(<GoToIcon />)}
                                        onClick={() => {
                                            onGoToFolder(store.currentFolder);
                                        }}
                                    >
                                        {`And other ${count} results`}
                                    </Button>
                                )}
                            />
                        </Box>
                    )}
                    {store.currentFolder.length === 0 && (
                        <Header subtitle={t('search.nothingFound')} />
                    )}
                    <Header
                        title="In other places"
                        classes={{
                            root: classes.offsetSection,
                            title: classes.header,
                        }}
                    />
                    {map(store.otherFolders, (bookmarks, folderId) => (
                        <Fragment>
                            <FolderBreadcrumbs
                                folderId={+folderId}
                                lastClickable
                                className={classes.breadcrumbs}
                                onSelectFolder={onGoToFolder}
                            />
                            <Box display="flex" className={classes.bookmarks}>
                                <BookmarksGrid
                                    bookmarks={bookmarks}
                                    columns={3}
                                    maxRows={3}
                                    classes={{ bookmarks: classes.bookmarksGrid }}
                                    overloadContent={(count) => (
                                        <Button
                                            className={classes.goToButton}
                                            color="secondary"
                                            endIcon={(<GoToIcon />)}
                                            onClick={() => {
                                                onGoToFolder(+folderId);
                                            }}
                                        >
                                            {`And other ${count} results`}
                                        </Button>
                                    )}
                                />
                            </Box>
                        </Fragment>
                    ))}
                    {size(store.otherFolders) === 0 && (
                        <Header subtitle={t('search.nothingFound')} />
                    )}
                </Fragment>,
                <Stub message="Search..." className={classes.stub} />,
            )}
        </Box>
    );
}

export default observer(FastResults);
