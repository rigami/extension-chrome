import React, {
    useEffect,
    Fragment,
    useState,
    memo,
} from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useLocalObservable, observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { Trans, useTranslation } from 'react-i18next';
import { BKMS_DISPLAY_VARIANT, BKMS_SORTING, FETCH } from '@/enum';
import BookmarksUniversalService, { SearchQuery } from '@/stores/universal/bookmarks/bookmarks';
import stateRender from '@/utils/helpers/stateRender';
import BookmarksGrid from '@/ui/WorkingSpace/BookmarksViewer/BookmarksGrid';
import Header from '@/ui/WorkingSpace/BookmarksViewer/Header';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import { useSearchService } from '@/ui/WorkingSpace/searchProvider';
import BookmarksList from '@/ui/WorkingSpace/BookmarksViewer/BookmarksList';
import Collapser from '@/ui/WorkingSpace/Tag/Collapser';
import Tag from '@/ui/WorkingSpace/Tag';
import db from '@/utils/db';

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
    listBookmarks: {
        width: '100%',
        margin: theme.spacing(0, -1),
    },
    tagsWrapper: {
        display: 'inline-flex',
        alignItems: 'center',
        marginRight: theme.spacing(0.5),
        marginLeft: theme.spacing(-0.5),
        verticalAlign: 'middle',
    },
    tag: { marginLeft: theme.spacing(1) },
    query: { fontStyle: 'italic' },
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

function Tags({ tags }) {
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);

    if (tags.length === 0) return null;

    return (
        <span>
            {t('search.withTags')}
            {' '}
            <span className={classes.tagsWrapper}>
                {tags.map((tag) => tag && (
                    <Tag
                        key={tag.id}
                        id={tag.id}
                        name={tag.name}
                        colorKey={tag.colorKey}
                        dense
                        className={classes.tag}
                    />
                ))}
            </span>
        </span>
    );
}

function Query({ query }) {
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);

    if (!query) return null;

    return (
        <span>
            {t('search.byQuery')}
            {' '}
            <Typography component="span" className={classes.query}>
                "
                {query}
                "
            </Typography>
        </span>
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
    const workingSpaceService = useWorkingSpaceService();
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
        queryTagsFull: [],
        favoriteCheckCache: {},
    }));

    const checkIsFavorite = (bookmark) => {
        if (bookmark.id in store.favoriteCheckCache) return store.favoriteCheckCache[bookmark.id];

        const isFavorite = workingSpaceService.findFavorite({
            itemId: bookmark.id,
            itemType: 'bookmark',
        });

        store.favoriteCheckCache[bookmark.id] = isFavorite;

        return isFavorite;
    };

    const sortByRelative = (list) => list.sort((bookmarkA, bookmarkB) => {
        const isFavoriteA = checkIsFavorite(bookmarkA);
        const isFavoriteB = checkIsFavorite(bookmarkB);

        if (isFavoriteA && !isFavoriteB) return -1;
        else if (!isFavoriteA && isFavoriteB) return 1;

        if (bookmarkA.name < bookmarkB.name) return -1;
        else if (bookmarkA.name > bookmarkB.name) return 1;

        return 0;
    });

    const sortByNewest = (list) => list.sort((bookmarkA, bookmarkB) => {
        if (bookmarkA.createTimestamp > bookmarkB.createTimestamp) return -1;
        else if (bookmarkA.createTimestamp < bookmarkB.createTimestamp) return 1;

        return 0;
    });

    const sortByOldest = (list) => list.sort((bookmarkA, bookmarkB) => {
        if (bookmarkA.createTimestamp < bookmarkB.createTimestamp) return -1;
        else if (bookmarkA.createTimestamp > bookmarkB.createTimestamp) return 1;

        return 0;
    });

    const sorting = {
        [BKMS_SORTING.BY_RELATIVE]: sortByRelative,
        [BKMS_SORTING.OLDEST_FIRST]: sortByOldest,
        [BKMS_SORTING.NEWEST_FIRST]: sortByNewest,
    };

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

        const sort = sorting[workingSpaceService.settings.sorting];

        BookmarksUniversalService.query(new SearchQuery(({
            query: searchService.searchRequest.query,
            tags: searchService.searchRequest.tags,
            folderId,
        })))
            .then(async (result) => {
                const allTags = {};

                (await db().getAll('tags')).forEach((tag) => {
                    allTags[tag.id] = tag;
                });

                return {
                    result,
                    allTags,
                };
            })
            .then(({ result, allTags }) => {
                if (currentRequestId !== store.requestId) return;

                // isDoneRequest = true;
                console.log('query:', result, {
                    ...searchService.searchRequest,
                    folderId,
                });

                store.favoriteCheckCache = {};
                store.bestBookmarks = (result.best && sort(result.best)) || [];
                store.partBookmarks = (result.part && sort(result.part)) || [];
                store.indirectlyBookmarks = (result.indirectly && sort(result.indirectly)) || [];
                store.allBookmarks = (result.all && sort(result.all)) || [];
                store.existMatches = (result.best.length + result.all.length) !== 0;
                store.usedFields = { ...searchService.searchRequest.usedFields };
                store.queryTagsFull = searchService.searchRequest.tags.map((tagId) => allTags[tagId]);
                store.loadState = FETCH.DONE;

                console.log('store.usedFields', store.usedFields);
            });
    }, [
        searchService.searchRequestId,
        folderId,
        workingSpaceService.lastTruthSearchTimestamp,
        workingSpaceService.settings.sorting,
    ]);

    return stateRender(
        /* FETCH.PENDING, */ store.loadState,
        [
            store.existMatches && (
                <Box key="exist-matches" className={clsx(classes.root, externalClassName)} style={externalStyle}>
                    {(store.usedFields.query || store.usedFields.tags) && (
                        <Fragment>
                            {store.bestBookmarks.length !== 0 ? (
                                <Fragment>
                                    <Header
                                        title={(
                                            <Trans t={t} i18nKey="search.bestMatches">
                                                <Query query={searchService.searchRequest.query} />
                                                <Tags tags={store.queryTagsFull} />
                                            </Trans>
                                        )}
                                    />
                                    <Box display="flex">
                                        {workingSpaceService.settings.displayVariant === BKMS_DISPLAY_VARIANT.CARDS && (
                                            <BookmarksGrid
                                                bookmarks={store.bestBookmarks}
                                                columns={columns}
                                            />
                                        )}
                                        {workingSpaceService.settings.displayVariant === BKMS_DISPLAY_VARIANT.ROWS && (
                                            <BookmarksList
                                                bookmarks={store.bestBookmarks}
                                                className={classes.listBookmarks}
                                            />
                                        )}
                                    </Box>
                                </Fragment>
                            ) : (
                                <Header
                                    title={(
                                        <Trans t={t} i18nKey="search.nothingFoundBestMatches">
                                            <Query query={searchService.searchRequest.query} />
                                            <Tags tags={store.queryTagsFull} />
                                        </Trans>
                                    )}
                                />
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
                                                {workingSpaceService.settings.displayVariant === BKMS_DISPLAY_VARIANT.CARDS && (
                                                    <BookmarksGrid
                                                        bookmarks={store.partBookmarks}
                                                        columns={columns}
                                                    />
                                                )}
                                                {workingSpaceService.settings.displayVariant === BKMS_DISPLAY_VARIANT.ROWS && (
                                                    <BookmarksList
                                                        bookmarks={store.bestBookmarks}
                                                        className={classes.listBookmarks}
                                                    />
                                                )}
                                            </Box>
                                        </Fragment>
                                    ) : (
                                        <Header subtitle={t('search.nothingFoundPartMatches')} />
                                    )}
                                    {store.indirectlyBookmarks.length !== 0 ? (
                                        <Fragment>
                                            <Header subtitle={t('search.indirectlyMatches')} />
                                            <Box display="flex">
                                                {workingSpaceService.settings.displayVariant === BKMS_DISPLAY_VARIANT.CARDS && (
                                                    <BookmarksGrid
                                                        bookmarks={store.indirectlyBookmarks}
                                                        columns={columns}
                                                    />
                                                )}
                                                {workingSpaceService.settings.displayVariant === BKMS_DISPLAY_VARIANT.ROWS && (
                                                    <BookmarksList
                                                        bookmarks={store.bestBookmarks}
                                                        className={classes.listBookmarks}
                                                    />
                                                )}
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
                            {workingSpaceService.settings.displayVariant === BKMS_DISPLAY_VARIANT.CARDS && (
                                <BookmarksGrid
                                    bookmarks={store.allBookmarks}
                                    columns={columns}
                                />
                            )}
                            {workingSpaceService.settings.displayVariant === BKMS_DISPLAY_VARIANT.ROWS && (
                                <BookmarksList
                                    bookmarks={store.bestBookmarks}
                                    className={classes.listBookmarks}
                                />
                            )}
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

export default memo(observer(BookmarksViewer));
