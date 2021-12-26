import React, { Fragment, useEffect } from 'react';
import {
    Box,
    Button,
    Divider,
    Typography,
} from '@material-ui/core';
import { useLocalObservable, observer } from 'mobx-react-lite';
import { ArrowForward as GoToIcon } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { map, size, omit } from 'lodash';
import BookmarksGrid from '@/ui/Bookmarks/BookmarksGrid';
import stateRender from '@/utils/helpers/stateRender';
import BookmarksUniversalService, { SearchQuery } from '@/stores/universal/bookmarks/bookmarks';
import { FETCH } from '@/enum';
import FolderBreadcrumbs from '@/ui/Bookmarks/ToolsPanel/FolderBreadcrumbs';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import { useSearchService } from '@/ui/Bookmarks/searchProvider';

const useStyles = makeStyles((theme) => ({
    goToButton: {
        textTransform: 'none',
        color: theme.palette.secondary.main,
        fontWeight: 800,
    },
    bookmarksGrid: {
        margin: theme.spacing(0, 2),
        marginBottom: theme.spacing(2),
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
        flexShrink: 0,
    },
    stub: { padding: theme.spacing(2) },
    folderBreadcrumbs: { overflow: 'auto' },
}));

function FastResults({ columns, onGoToFolder }) {
    const theme = useTheme();
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const bookmarksService = useBookmarksService();
    const searchService = useSearchService();
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
            query: searchService.tempSearchRequest.query,
            tags: searchService.tempSearchRequest.tags,
        }))
            .then((result) => {
                if (currentRequestId !== store.requestId) return;
                const byFolders = {};

                [...(result.best || []), ...(result.part || [])].forEach((bookmark) => {
                    byFolders[bookmark.folderId] = [...(byFolders[bookmark.folderId] || []), bookmark];
                });

                store.currentFolder = byFolders[searchService.selectFolderId] || [];
                store.otherFolders = map(
                    omit(byFolders, [searchService.selectFolderId]),
                    (bookmarks, folderId) => ({
                        bookmarks,
                        folderId,
                    }),
                );
                store.loadState = FETCH.DONE;
            });
    }, [bookmarksService.lastTruthSearchTimestamp, searchService.tempSearchRequest]);

    return (
        <Box style={{ width: (theme.shape.dataCard.width + theme.spacing(2)) * columns + theme.spacing(2) }}>
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
                                        onGoToFolder(searchService.selectFolderId, true);
                                    }}
                                >
                                    {t('search.currentFolderMatches')}
                                </Button>
                                <Typography
                                    variant="caption"
                                    className={classes.countResults}
                                >
                                    {t('search.results', { count: store.currentFolder.length })}
                                </Typography>
                            </Box>
                            <BookmarksGrid
                                bookmarks={store.currentFolder}
                                columns={columns}
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
                                    folderId={folderId}
                                    lastClickable
                                    classes={{
                                        root: classes.folderBreadcrumbs,
                                        last: classes.goToButton,
                                    }}
                                    onSelectFolder={(selectFolderId) => {
                                        onGoToFolder(selectFolderId, selectFolderId === folderId);
                                    }}
                                />
                                <Typography
                                    variant="caption"
                                    className={classes.countResults}
                                >
                                    {t('search.results', { count: bookmarks.length })}
                                </Typography>
                            </Box>
                            <BookmarksGrid
                                bookmarks={bookmarks}
                                columns={columns}
                                maxRows={3}
                                classes={{ bookmarks: classes.bookmarksGrid }}
                            />
                        </Fragment>
                    ))}
                    {size(store.otherFolders) === 0 && store.currentFolder.length === 0 && (
                        <Typography variant="body1" className={classes.stub}>{t('search.nothingFound')}</Typography>
                    )}
                </Fragment>,
                <Typography variant="body1" className={classes.stub}>
                    {t('common:search')}
                </Typography>,
            )}
        </Box>
    );
}

export default observer(FastResults);
