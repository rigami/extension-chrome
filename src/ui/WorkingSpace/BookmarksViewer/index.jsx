import React, { useEffect, useState, memo } from 'react';
import { Box } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useLocalObservable, observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { BKMS_DISPLAY_VARIANT, BKMS_SORTING, FETCH } from '@/enum';
import stateRender from '@/utils/helpers/stateRender';
import BookmarksGrid from '@/ui/WorkingSpace/BookmarksViewer/BookmarksGrid';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import BookmarksList from '@/ui/WorkingSpace/BookmarksViewer/BookmarksList';
import { search, SearchQuery } from '@/stores/universal/workingSpace/search';
import sorting from './utils/sort';

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
    const store = useLocalObservable(() => ({
        allBookmarks: null,
        existMatches: false,
        requestId: 0,
        loadState: FETCH.WAIT,
    }));

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

        const sort = sorting[workingSpaceService.settings.sorting](workingSpaceService);

        search(new SearchQuery(({ folderId })))
            .then((result) => {
                console.log('folder result:', result);
                if (currentRequestId !== store.requestId) return;

                store.allBookmarks = (result.all && sort(result.all)) || [];
                store.existMatches = (result.best.length + result.all.length) !== 0;
                store.loadState = FETCH.DONE;
            });
    }, [folderId, workingSpaceService.lastTruthSearchTimestamp, workingSpaceService.settings.sorting]);

    return stateRender(
        store.loadState,
        [
            store.existMatches && (
                <Box key="exist-matches" className={clsx(classes.root, externalClassName)} style={externalStyle}>
                    <Box display="flex">
                        {workingSpaceService.settings.displayVariant === BKMS_DISPLAY_VARIANT.CARDS && (
                            <BookmarksGrid
                                bookmarks={store.allBookmarks}
                                columns={columns}
                            />
                        )}
                        {workingSpaceService.settings.displayVariant === BKMS_DISPLAY_VARIANT.ROWS && (
                            <BookmarksList
                                bookmarks={store.allBookmarks}
                                className={classes.listBookmarks}
                            />
                        )}
                    </Box>
                </Box>
            ),
            !store.existMatches
            && nothingFoundRender
            && nothingFoundRender(),
            !store.existMatches
            && emptyRender
            && emptyRender(),
        ],
        (<Skeleton />),
    );
}

export default memo(observer(BookmarksViewer));
