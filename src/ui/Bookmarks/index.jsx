import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Container,
    Typography,
    Fade,
} from '@material-ui/core';
import { FindReplaceRounded as ReFoundIcon } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import ReactResizeDetector from 'react-resize-detector';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import useAppService from '@/stores/app/AppStateProvider';
import Categories from '@/ui/Bookmarks/Categories';
import FullScreenStub from '@/ui-components/FullscreenStub';
import { useTranslation } from 'react-i18next';
import useCoreService from '@/stores/app/BaseStateProvider';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import { ACTIVITY, BKMS_FAP_POSITION, BKMS_FAP_STYLE } from '@/enum';
import Category from './Categories/CtegoryWrapper';
import Folder from './Folders/FolderWrapper';
import BookmarksGrid from './BookmarksGrid';

const useStyles = makeStyles((theme) => ({
    chipContainer: { },
    container: {
        paddingTop: theme.spacing(3),
        height: '100%',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    fadeWrapper: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing(3),
    },
}));

const maxColumnCalc = () => Math.min(
    Math.floor((document.documentElement.clientWidth + 16 - 48) / 196),
    6,
);

const SEARCH_STATUS = {
    WAIT: 'WAIT',
    NOTHING_FOUND: 'NOTHING_FOUND',
    NO_BOOKMARKS: 'NO_BOOKMARKS',
    DONE_SEARCH: 'DONE_SEARCH',
};

function Bookmarks() {
    const { t } = useTranslation();
    const classes = useStyles();
    const theme = useTheme();
    const coreService = useCoreService();
    const bookmarksService = useBookmarksService();
    const appService = useAppService();
    const isFirstRun = useRef(true);
    const [isSearching, setIsSearching] = useState(false);
    const [findBookmarks, setFindBookmarks] = useState(null);
    const [statusSearch, setStatusSearch] = useState(SEARCH_STATUS.WAIT);
    const [searchCategories, setSearchCategories] = useState(null);
    const [lastTruthSearchTimestamp, setLastTruthSearchTimestamp] = useState(bookmarksService.lastTruthSearchTimestamp);
    const [folders, setFolders] = useState([]);
    const [selectFolderId, setSelectFolderId] = useState(undefined);

    const handleLoadFolders = (folderId) => {
        if (folderId) {
            FoldersUniversalService.get(folderId)
                .then((foundFolder) => {
                    setFolders([foundFolder]);
                });
        } else {
            FoldersUniversalService.getFoldersByParent()
                .then((foundFolders) => {
                    setFolders(foundFolders);
                });
        }
    };

    const handleSearch = (query = {}) => {
        bookmarksService.bookmarks.query({ ...query }, false)
            .then((searchResult) => {
                setLastTruthSearchTimestamp(bookmarksService.lastTruthSearchTimestamp);
                setFindBookmarks(searchResult);
                setIsSearching(false);
                setSearchCategories(null);
                if (searchResult.length === 0) {
                    setStatusSearch(SEARCH_STATUS.NOTHING_FOUND);
                } else if (
                    searchResult.length === 1
                    && searchResult[0].category.id === 'all'
                    && searchResult[0].bookmarks.length === 0
                ) {
                    setStatusSearch(SEARCH_STATUS.NO_BOOKMARKS);
                } else if (
                    searchResult.length === 1
                    && searchResult[0].category.id === 'all'
                ) {
                    setFolders([]);
                    setSelectFolderId(undefined);
                    handleLoadFolders();
                    setStatusSearch(SEARCH_STATUS.WAIT);
                } else {
                    setStatusSearch(SEARCH_STATUS.DONE_SEARCH);
                }
            });
    };

    useEffect(() => {
        coreService.storage.updateTemp({ columnsCount: maxColumnCalc() });
    }, []);

    useEffect(() => {
        if (appService.activity === ACTIVITY.BOOKMARKS) {
            if (!findBookmarks) {
                setIsSearching(true);
                handleSearch(bookmarksService.lastSearch);
            }

            setSearchCategories(bookmarksService.lastSearch?.categories?.match || []);
        }
    }, [appService.activity]);

    useEffect(() => {
        if (isFirstRun.current) {
            return;
        }

        if (bookmarksService.lastTruthSearchTimestamp !== lastTruthSearchTimestamp && !isSearching) {
            setIsSearching(true);
            handleSearch(bookmarksService.lastSearch);
        }
    }, [bookmarksService.lastTruthSearchTimestamp]);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        handleLoadFolders(selectFolderId);
    }, [selectFolderId]);

    let fapPositionStyle;

    if (bookmarksService.settings.fapPosition === BKMS_FAP_POSITION.BOTTOM) {
        fapPositionStyle = 'paddingBottom';
    } else {
        fapPositionStyle = 'paddingTop';
    }

    let fapSizeStyle;

    if (bookmarksService.settings.fapStyle === BKMS_FAP_STYLE.CONTAINED) {
        fapSizeStyle = theme.spacing(9) + 40;
    } else if (bookmarksService.settings.fapStyle === BKMS_FAP_STYLE.TRANSPARENT) {
        fapSizeStyle = theme.spacing(3) + 40;
    } else {
        fapSizeStyle = 0;
    }

    return (
        <React.Fragment>
            <Container
                className={classes.container}
                fixed
                style={{
                    maxWidth: coreService.storage.temp.columnsCount * 196 - 16 + 48,
                    [fapPositionStyle]: fapSizeStyle,
                }}
            >
                <Box className={classes.header}>
                    <Categories
                        className={classes.chipContainer}
                        value={searchCategories}
                        onChange={(categories) => {
                            setSearchCategories(categories);
                            setIsSearching(true);
                        }}
                    />
                </Box>
                <Fade
                    in={!isSearching}
                    onExited={() => {
                        // setFindBookmarks(null);
                        if (searchCategories) handleSearch({ categories: { match: searchCategories } });
                    }}
                >
                    <div className={classes.fadeWrapper}>
                        {statusSearch === SEARCH_STATUS.NOTHING_FOUND && (
                            <FullScreenStub
                                icon={ReFoundIcon}
                                message={t('bookmark.nothingFound.title')}
                                description={t('bookmark.nothingFound.description')}
                            />
                        )}
                        {statusSearch === SEARCH_STATUS.NO_BOOKMARKS && (
                            <FullScreenStub
                                message={t('bookmark.noBookmarks.title')}
                                description={t('bookmark.noBookmarks.description')}
                            />
                        )}
                        {statusSearch === SEARCH_STATUS.WAIT && folders.map((folder) => (
                            <Folder
                                key={folder.id}
                                folder={folder}
                                onSelect={(nextFolderId) => setSelectFolderId(nextFolderId)}
                            />
                        ))}
                        {
                            statusSearch === SEARCH_STATUS.DONE_SEARCH
                            && findBookmarks.map(({ category, bookmarks }) => (
                                <Category {...category} key={category.id}>
                                    {bookmarks.length === 0 && (
                                        <Typography
                                            variant="body1"
                                            style={{ color: theme.palette.text.secondary }}
                                        >
                                            {t('bookmark.noMatchingItems')}
                                        </Typography>
                                    )}
                                    <BookmarksGrid bookmarks={bookmarks} />
                                </Category>
                            ))
                        }
                    </div>
                </Fade>
            </Container>
            <ReactResizeDetector
                handleWidth
                onResize={() => {
                    coreService.storage.updateTemp({ columnsCount: maxColumnCalc() });
                }}
            />
        </React.Fragment>
    );
}

export default observer(Bookmarks);
