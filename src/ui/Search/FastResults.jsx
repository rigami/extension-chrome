import React, { Fragment, useEffect, useState } from 'react';
import {
    Box,
    Button,
    Divider,
    Typography,
} from '@material-ui/core';
import { useLocalObservable, observer } from 'mobx-react-lite';
import { ArrowForward as GoToIcon } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { alpha, makeStyles } from '@material-ui/core/styles';
import {
    map,
    size,
    omit,
    sample,
} from 'lodash';
import stateRender from '@/utils/helpers/stateRender';
import BookmarksUniversalService, { SearchQuery } from '@/stores/universal/bookmarks/bookmarks';
import { FETCH } from '@/enum';
import FolderBreadcrumbs from '@/ui/WorkingSpace/ToolsPanel/FolderBreadcrumbs';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import { useSearchService } from '@/ui/WorkingSpace/searchProvider';
import BookmarksList from '@/ui/WorkingSpace/BookmarksViewer/BookmarksList';
import Stub from '@/ui-components/Stub';

const useStyles = makeStyles((theme) => ({
    root: {
        paddingBottom: theme.spacing(1),
        minHeight: 380,
        display: 'flex',
        flexDirection: 'column',
    },
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
        paddingBottom: 0,
        paddingLeft: theme.spacing(1),
    },
    countResults: {
        color: theme.palette.text.secondary,
        marginLeft: 'auto',
        flexShrink: 0,
    },
    stub: {
        padding: theme.spacing(2),
        paddingTop: theme.spacing(3),
    },
    folderBreadcrumbs: { overflow: 'auto' },
    countOtherResults: {
        padding: theme.spacing(1, 2),
        display: 'block',
        color: theme.palette.text.secondary,
    },
    bookmarksList: { padding: theme.spacing(0, 1) },
    emoticon: {
        fontSize: '5rem',
        color: alpha(theme.palette.text.secondary, 0.06),
        fontWeight: 700,
    },
    message: {
        fontSize: '1.4rem',
        fontWeight: 600,
        marginTop: theme.spacing(5),
        color: theme.palette.text.primary,
    },
}));

const emoticons = [
    '(^_^)b',
    '(；⌣̀_⌣́)',
    '(⇀‸↼‶)',
    '(눈_눈)',
    '(ᗒᗣᗕ)՞',
    '(￢_￢;)',
    'ヾ( ￣O￣)ツ',
    '(╥_╥)',
    '( ╥ω╥ )',
    '¯\\_(ツ)_/¯',
    '┐( ˘ ､ ˘ )┌',
    '╮( ˘_˘ )╭',
    '(⊙_⊙)',
];

function FastResults({ onGoToFolder }) {
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const workingSpaceService = useWorkingSpaceService();
    const [emoticon] = useState(() => sample(emoticons));
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
    }, [workingSpaceService.lastTruthSearchTimestamp, searchService.tempSearchRequest]);

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
                            <BookmarksList
                                bookmarks={store.currentFolder}
                                max={3}
                                classes={{
                                    root: classes.bookmarksList,
                                    bookmarks: classes.bookmarksGrid,
                                }}
                                overloadContent={(renderCount) => (
                                    <Typography
                                        variant="caption"
                                        className={classes.countOtherResults}
                                    >
                                        {t('search.otherResults', { count: store.bookmarks.length - renderCount })}
                                    </Typography>
                                )}
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
                            <BookmarksList
                                bookmarks={bookmarks}
                                max={3}
                                classes={{
                                    root: classes.bookmarksList,
                                    bookmarks: classes.bookmarksGrid,
                                }}
                                overloadContent={(renderCount) => (
                                    <Typography
                                        variant="caption"
                                        className={classes.countOtherResults}
                                    >
                                        {t('search.otherResults', { count: bookmarks.length - renderCount })}
                                    </Typography>
                                )}
                            />
                        </Fragment>
                    ))}
                    {size(store.otherFolders) === 0 && store.currentFolder.length === 0 && (
                        <Stub
                            maxWidth={false}
                            message={emoticon}
                            description={t('search.nothingFound')}
                            classes={{
                                root: classes.stub,
                                title: classes.emoticon,
                                description: classes.message,
                            }}
                        />
                    )}
                </Fragment>,
                <Stub
                    maxWidth={false}
                    description={t('common:search')}
                    classes={{ root: classes.stub }}
                />,
            )}
        </Box>
    );
}

export default observer(FastResults);
