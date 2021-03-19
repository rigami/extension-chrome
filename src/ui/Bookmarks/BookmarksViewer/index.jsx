import React, { useCallback, useEffect, Fragment } from 'react';
import {
    Box,
    Button,
    CircularProgress,
} from '@material-ui/core';
import Stub from '@/ui-components/Stub';
import { makeStyles } from '@material-ui/core/styles';
import { useLocalObservable, observer } from 'mobx-react-lite';
import { FETCH } from '@/enum';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import stateRender from '@/utils/stateRender';
import BookmarksGrid from '@/ui/Bookmarks/BookmarksGrid';
import { useResizeDetector } from 'react-resize-detector';
import useCoreService from '@/stores/app/BaseStateProvider';
import clsx from 'clsx';
import Header from '@/ui/Bookmarks/BookmarksViewer/Header';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    },
    title: { fontSize: '2.25rem' },
    bookmarks: { paddingTop: theme.spacing(3) },
    bottomOffset: { paddingBottom: theme.spacing(38) },
}));

const maxColumnCalc = (width) => Math.min(
    Math.floor((width + 16) / 196),
    7,
);

function BookmarksViewer({ activeFolderId, searchRequest }) {
    const classes = useStyles();
    const coreService = useCoreService();
    const { t } = useTranslation(['bookmark']);
    const store = useLocalObservable(() => ({
        bestBookmarks: null,
        allBookmarks: null,
        existMatches: false,
        requestId: 0,
        loadState: FETCH.WAIT,
        columnsCount: 0,
    }));
    const onResize = useCallback((width) => {
        store.columnsCount = maxColumnCalc(width);
    }, []);

    const { ref } = useResizeDetector({ onResize });

    useEffect(() => {
        store.loadState = FETCH.PENDING;
        store.requestId += 1;
        const currentRequestId = store.requestId;

        BookmarksUniversalService.query(searchRequest)
            .then((result) => {
                if (currentRequestId !== store.requestId) return;

                console.log('query:', result, searchRequest);

                store.bestBookmarks = result.best;
                store.allBookmarks = result.all;
                store.existMatches = ((result.best?.length || 0) + result.all.length) !== 0;
                store.loadState = FETCH.DONE;
            });
    }, [searchRequest]);

    return (
        <Box className={classes.root} ref={ref}>
            {stateRender(
                store.loadState,
                [
                    store.existMatches && (
                        <Fragment key="exist-matches">
                            {(searchRequest.usedFields.query || searchRequest.usedFields.tags) && (
                                <Fragment>
                                    <Header title={t('search.bestMatches')} />
                                    {store.bestBookmarks && store.bestBookmarks.length !== 0 ? (
                                        <Box display="flex" className={classes.bookmarks}>
                                            <BookmarksGrid
                                                bookmarks={store.bestBookmarks}
                                                columns={store.columnsCount}
                                            />
                                        </Box>
                                    ) : (
                                        <Header subtitle={t('search.nothingFound')} />
                                    )}
                                    <Header title={t('search.allMatches')} />
                                </Fragment>
                            )}
                            <Box display="flex" className={clsx(classes.bookmarks, classes.bottomOffset)}>
                                <BookmarksGrid
                                    bookmarks={store.allBookmarks}
                                    columns={store.columnsCount}
                                />
                            </Box>
                        </Fragment>
                    ),
                    (searchRequest.usedFields.query || searchRequest.usedFields.tags) && !store.existMatches && (
                        <Stub
                            key="nothing-found"
                            message={t('search.nothingFound')}
                            description={t('search.nothingFound', { context: 'description' })}
                            classes={{ title: classes.title }}
                        />
                    ),
                    !searchRequest.usedFields.query && !searchRequest.usedFields.tags && !store.existMatches && (
                        <Stub
                            key="empty"
                            message={t('empty')}
                            classes={{ title: classes.title }}
                        >
                            <Button
                                onClick={() => coreService.localEventBus.call(
                                    'bookmark/create',
                                    { defaultFolderId: activeFolderId },
                                )}
                                startIcon={<AddBookmarkIcon />}
                                variant="contained"
                                color="primary"
                            >
                                {t('button.add', { context: 'first' })}
                            </Button>
                        </Stub>
                    ),
                ],
                <Stub>
                    <CircularProgress />
                </Stub>,
            )}
        </Box>
    );
}

export default observer(BookmarksViewer);
