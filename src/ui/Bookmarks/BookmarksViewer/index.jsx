import React, { useEffect, Fragment } from 'react';
import { Box, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useLocalObservable, observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import Stub from '@/ui-components/Stub';
import { FETCH } from '@/enum';
import BookmarksUniversalService, { SearchQuery } from '@/stores/universal/bookmarks/bookmarks';
import stateRender from '@/utils/helpers/stateRender';
import BookmarksGrid from '@/ui/Bookmarks/BookmarksGrid';
import Header from '@/ui/Bookmarks/BookmarksViewer/Header';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import { useSearchService } from '@/ui/Bookmarks/searchProvider';

const useStyles = makeStyles(() => ({
    root: {
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
    },
}));

function BookmarksViewer(props) {
    const {
        folderId,
        columns,
        emptyRender,
        nothingFoundRender,
        className: externalClassName,
        style: externalStyle,
    } = props;
    const classes = useStyles();
    const bookmarksService = useBookmarksService();
    const searchService = useSearchService();
    const { t } = useTranslation(['bookmark']);
    const store = useLocalObservable(() => ({
        bestBookmarks: null,
        allBookmarks: null,
        existMatches: false,
        requestId: 0,
        loadState: FETCH.WAIT,
        usedFields: {},
    }));

    const sortByFavorites = (list) => list.sort((bookmarkA, bookmarkB) => {
        const isFavoriteA = bookmarksService.findFavorite({
            itemId: bookmarkA.id,
            itemType: 'bookmark',
        });
        const isFavoriteB = bookmarksService.findFavorite({
            itemId: bookmarkB.id,
            itemType: 'bookmark',
        });

        if (isFavoriteA && !isFavoriteB) return -1;
        else if (!isFavoriteA && isFavoriteB) return 1;

        return 0;
    });

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

        BookmarksUniversalService.query(new SearchQuery(({
            query: searchService.searchRequest.query,
            tags: searchService.searchRequest.tags,
            folderId,
        })))
            .then((result) => {
                if (currentRequestId !== store.requestId) return;

                // isDoneRequest = true;
                console.log('query:', result, {
                    ...searchService.searchRequest,
                    folderId,
                });

                store.bestBookmarks = result.best && sortByFavorites(result.best);
                store.allBookmarks = result.all && sortByFavorites(result.all);
                store.existMatches = ((result.best?.length || 0) + result.all.length) !== 0;
                store.usedFields = { ...searchService.searchRequest.usedFields };
                store.loadState = FETCH.DONE;

                console.log('store.usedFields', store.usedFields);
            });
    }, [searchService.searchRequestId, folderId, bookmarksService.lastTruthSearchTimestamp]);

    return stateRender(
        store.loadState,
        [
            store.existMatches && (
                <Box key="exist-matches" className={clsx(classes.root, externalClassName)} style={externalStyle}>
                    {(store.usedFields.query || store.usedFields.tags) && (
                        <Fragment>
                            <Header title={t('search.bestMatches')} />
                            {store.bestBookmarks && store.bestBookmarks.length !== 0 ? (
                                <Box display="flex" className={classes.bookmarks}>
                                    <BookmarksGrid
                                        bookmarks={store.bestBookmarks}
                                        columns={columns}
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
                            columns={columns}
                        />
                    </Box>
                </Box>
            ),
            (store.usedFields.query || store.usedFields.tags)
            && !store.existMatches
            && nothingFoundRender
            && nothingFoundRender(),
            !store.usedFields.query
            && !store.usedFields.tags
            && !store.existMatches
            && emptyRender
            && emptyRender(),
        ],
        <Stub>
            <CircularProgress />
        </Stub>,
    );
}

export default observer(BookmarksViewer);
