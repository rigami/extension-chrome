import React, { useEffect, Fragment, useState } from 'react';
import { Box, CircularProgress } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
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

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
    },
    topOffset: { marginTop: theme.spacing(6) },
    fakeColumn: { marginLeft: theme.spacing(2) },
    fakeCard: {
        backgroundColor: theme.palette.background.default,
        borderRadius: theme.shape.borderRadius,
        marginBottom: theme.spacing(2),
    },
    skeleton: {
        transition: theme.transitions.create(['opacity'], {
            duration: theme.transitions.duration.enteringScreen,
            easing: theme.transitions.easing.easeInOut,
        }),
        opacity: 1,
    },
    hideSkeleton: { opacity: 0 },
}));

function Skeleton() {
    const theme = useTheme();
    const classes = useStyles();
    const [hide, setHide] = useState(true);

    useEffect(() => {
        setTimeout(() => setHide(false), 10);
    }, []);

    return (
        <Box display="flex" className={clsx(classes.skeleton, hide && classes.hideSkeleton)}>
            <Box
                width={theme.shape.dataCard.width}
                height={theme.shape.dataCard.height * 3 + theme.spacing(2) * 2}
                className={classes.fakeCard}
            />
            <Box className={classes.fakeColumn}>
                <Box
                    width={theme.shape.dataCard.width}
                    height={theme.shape.dataCard.height}
                    className={classes.fakeCard}
                />
                <Box
                    width={theme.shape.dataCard.width}
                    height={theme.shape.dataCard.height * 2 + theme.spacing(2)}
                    className={classes.fakeCard}
                />
            </Box>
            <Box className={classes.fakeColumn}>
                <Box
                    width={theme.shape.dataCard.width}
                    height={theme.shape.dataCard.height * 2 + theme.spacing(2)}
                    className={classes.fakeCard}
                />
            </Box>
        </Box>
    );
}

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
        partBookmarks: null,
        indirectlyBookmarks: null,
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
        console.log(`[BookmarksViewer] existMatches: ${store.existMatches}`);
        if (!store.existMatches) store.loadState = FETCH.PENDING;
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

                store.bestBookmarks = (result.best && sortByFavorites(result.best)) || [];
                store.partBookmarks = (result.part && sortByFavorites(result.part)) || [];
                store.indirectlyBookmarks = (result.indirectly && sortByFavorites(result.indirectly)) || [];
                store.allBookmarks = (result.all && sortByFavorites(result.all)) || [];
                store.existMatches = (result.best.length + result.all.length) !== 0;
                store.usedFields = { ...searchService.searchRequest.usedFields };
                store.loadState = FETCH.DONE;

                console.log('store.usedFields', store.usedFields);
            });
    }, [searchService.searchRequestId, folderId, bookmarksService.lastTruthSearchTimestamp]);

    return stateRender(
        /* FETCH.PENDING, */ store.loadState,
        [
            store.existMatches && (
                <Box key="exist-matches" className={clsx(classes.root, externalClassName)} style={externalStyle}>
                    {(store.usedFields.query || store.usedFields.tags) && (
                        <Fragment>
                            {store.bestBookmarks.length !== 0 ? (
                                <Fragment>
                                    <Header title={t('search.bestMatches')} />
                                    <Box display="flex">
                                        <BookmarksGrid
                                            bookmarks={store.bestBookmarks}
                                            columns={columns}
                                        />
                                    </Box>
                                </Fragment>
                            ) : (
                                <Header title={t('search.nothingFoundBestMatches')} />
                            )}
                            {(store.partBookmarks.length !== 0 || store.indirectlyBookmarks !== 0) && (
                                <Fragment>
                                    {store.bestBookmarks.length !== 0 && (
                                        <Header className={classes.topOffset} title={t('search.otherMatches')} />
                                    )}
                                    {store.bestBookmarks.length === 0 && (
                                        <Header className={classes.topOffset} title={t('search.otherMatchesOnly')} />
                                    )}
                                    {store.partBookmarks.length !== 0 ? (
                                        <Fragment>
                                            <Header subtitle={t('search.partMatches')} />
                                            <Box display="flex">
                                                <BookmarksGrid
                                                    bookmarks={store.partBookmarks}
                                                    columns={columns}
                                                />
                                            </Box>
                                        </Fragment>
                                    ) : (
                                        <Header subtitle={t('search.nothingFoundPartMatches')} />
                                    )}
                                    {store.indirectlyBookmarks.length !== 0 ? (
                                        <Fragment>
                                            <Header subtitle={t('search.indirectlyMatches')} />
                                            <Box display="flex">
                                                <BookmarksGrid
                                                    bookmarks={store.indirectlyBookmarks}
                                                    columns={columns}
                                                />
                                            </Box>
                                        </Fragment>
                                    ) : (
                                        <Header subtitle={t('search.nothingFoundIndirectlyMatches')} />
                                    )}
                                </Fragment>
                            )}
                            {(store.partBookmarks.length === 0 && store.indirectlyBookmarks === 0) && (
                                <Header className={classes.topOffset} title={t('search.nothingFoundOtherMatches')} />
                            )}
                        </Fragment>
                    )}
                    {(!store.usedFields.query && !store.usedFields.tags) && (
                        <Box display="flex">
                            <BookmarksGrid
                                bookmarks={store.allBookmarks}
                                columns={columns}
                            />
                        </Box>
                    )}
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
        (<Skeleton />),
    );
}

export default observer(BookmarksViewer);
