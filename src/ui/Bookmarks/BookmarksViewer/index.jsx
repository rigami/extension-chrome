import React, { useCallback, useEffect, Fragment } from 'react';
import {
    Box,
    CircularProgress,
    IconButton, ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Tooltip,
} from '@material-ui/core';
import FullScreenStub from '@/ui-components/FullscreenStub';
import { makeStyles } from '@material-ui/core/styles';
import { useLocalObservable, observer } from 'mobx-react-lite';
import { FETCH } from '@/enum';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import stateRender from '@/utils/stateRender';
import BookmarksGrid from '@/ui/Bookmarks/BookmarksGrid';
import { useResizeDetector } from 'react-resize-detector';
import useCoreService from '@/stores/app/BaseStateProvider';
import clsx from 'clsx';
import {
    BookmarkBorderRounded as PinnedFavoriteIcon,
    BookmarkRounded as UnpinnedFavoriteIcon, DeleteRounded as RemoveIcon, EditRounded as EditIcon,
    LabelRounded as LabelIcon,
} from '@material-ui/icons';
import Header from '@/ui/Bookmarks/BookmarksViewer/Header';

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

function BookmarksViewer({ searchRequest }) {
    const classes = useStyles();
    const coreService = useCoreService();
    const store = useLocalObservable(() => ({
        bestBookmarks: null,
        allBookmarks: null,
        existMatches: false,
        requestId: 0,
        loadState: FETCH.WAIT,
    }));
    const onResize = useCallback((width) => {
        coreService.storage.updateTemp({ columnsCount: maxColumnCalc(width) });
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
                        <Fragment>
                            {(searchRequest.usedFields.query || searchRequest.usedFields.tags) && (
                                <Fragment>
                                    <Header title="Best matches" />
                                    {store.bestBookmarks && store.bestBookmarks.length !== 0 ? (
                                        <Box display="flex" className={classes.bookmarks}>
                                            <BookmarksGrid bookmarks={store.bestBookmarks} />
                                        </Box>
                                    ) : (
                                        <Header subtitle="Nothing found" />
                                    )}
                                    <Header title="All matches" />
                                </Fragment>
                            )}
                            <Box display="flex" className={clsx(classes.bookmarks, classes.bottomOffset)}>
                                <BookmarksGrid bookmarks={store.allBookmarks} />
                            </Box>
                        </Fragment>
                    ),
                    (searchRequest.usedFields.query || searchRequest.usedFields.tags) && !store.existMatches && (
                        <FullScreenStub
                            message="Nothing found"
                            classes={{ title: classes.title }}
                        />
                    ),
                    !searchRequest.usedFields.query && !searchRequest.usedFields.tags && !store.existMatches && (
                        <FullScreenStub
                            message="There are no bookmarks here yet"
                            classes={{ title: classes.title }}
                        />
                    ),
                ],
                <FullScreenStub>
                    <CircularProgress />
                </FullScreenStub>,
            )}
        </Box>
    );
}

export default observer(BookmarksViewer);
