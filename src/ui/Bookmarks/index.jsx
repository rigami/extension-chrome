import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Container,
    Typography,
    Fade,
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import ReactResizeDetector from 'react-resize-detector';
import useBookmarksService from '@/stores/BookmarksProvider';
import useAppService from '@/stores/AppStateProvider';
import Categories from '@/ui/Bookmarks/Categories';
import FullScreenStub from '@/ui-components/FullscreenStub';
import Category from './Categories/CtegoryWrapper';
import AddBookmarkButton from './EditBookmarkModal/AddButton';
import CardLink from './CardLink';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100vw',
        backgroundColor: theme.palette.background.paper,
        transform: 'translate3d(0,0,0)',
    },
    chipContainer: { marginBottom: theme.spacing(3) },
    container: { paddingTop: theme.spacing(3) },
}));

const maxColumnCalc = () => Math.min(
    Math.floor((document.getElementById('bookmarks-container').clientWidth + 16 - 48) / 196),
    6,
);

function Bookmarks() {
    const classes = useStyles();
    const theme = useTheme();
    const bookmarksService = useBookmarksService();
    const appService = useAppService();
    const isFirstRun = useRef(true);
    const [columnsCount, setColumnsCount] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [findBookmarks, setFindBookmarks] = useState(null);
    const [searchCategories, setSearchCategories] = useState(null);
    const [lastTruthSearchTimestamp, setLastTruthSearchTimestamp] = useState(bookmarksService.lastTruthSearchTimestamp);

    let columnStabilizer = null;

    const handleSearch = (query = {}) => {
        bookmarksService.bookmarks.query({ ...query }, false)
            .then((searchResult) => {
                setLastTruthSearchTimestamp(bookmarksService.lastTruthSearchTimestamp);
                setFindBookmarks(searchResult);
                setIsSearching(false);
                setSearchCategories(null);
            });
    };

    useEffect(() => {
        setColumnsCount(maxColumnCalc());
    }, []);

    useEffect(() => {
        if (appService.activity === 'bookmarks') {
            if (!findBookmarks) {
                setIsSearching(true);
                handleSearch(bookmarksService.lastSearch);
            }

            setSearchCategories(bookmarksService.lastSearch?.categories?.match || []);
        }
    }, [appService.activity]);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        if (bookmarksService.lastTruthSearchTimestamp !== lastTruthSearchTimestamp && !isSearching) {
            setIsSearching(true);
            handleSearch(bookmarksService.lastSearch);
        }
    }, [bookmarksService.lastTruthSearchTimestamp]);

    return (
        <React.Fragment>
            <Box id="bookmarks-container" className={classes.root}>
                <Container className={classes.container} fixed style={{ maxWidth: columnsCount * 196 - 16 + 48 }}>
                    <Categories
                        className={classes.chipContainer}
                        value={searchCategories}
                        onChange={(categories) => {
                            setSearchCategories(categories);
                            setIsSearching(true);
                        }}
                    />
                    <Fade
                        in={!isSearching}
                        onExited={() => {
                            // setFindBookmarks(null);
                            if (searchCategories) handleSearch({ categories: { match: searchCategories } });
                        }}
                    >
                        <div>
                            {findBookmarks !== null && findBookmarks.length === 0 && (
                                <FullScreenStub message="Ничего не найдено (" />
                            )}
                            {findBookmarks !== null && findBookmarks.map(({ category, bookmarks }) => {
                                columnStabilizer = [...Array.from({ length: columnsCount }, () => 0)];

                                return (
                                    <Category {...category} key={category.id}>
                                        {bookmarks.length === 0 && (
                                            <Typography
                                                variant="body1"
                                                style={{ color: theme.palette.text.secondary }}
                                            >
                                                Нет подходящих элементов
                                            </Typography>
                                        )}
                                        {bookmarks.reduce((acc, curr) => {
                                            let column = 0;
                                            columnStabilizer.forEach((element, index) => {
                                                if (columnStabilizer[column] > element) column = index;
                                            });

                                            columnStabilizer[column] += curr.type === 'extend' ? 0.8 : 0.6;
                                            columnStabilizer[column] += Math.min(
                                                Math.ceil(curr.name.length / 15),
                                                2,
                                            ) * 0.2 || 0.4;
                                            columnStabilizer[column] += (
                                                curr.description
                                                && Math.min(Math.ceil(curr.description.length / 20), 4) * 0.17
                                            ) || 0;
                                            columnStabilizer[column] += 0.12;

                                            if (typeof acc[column] === 'undefined') acc[column] = [];

                                            acc[column].push(curr);

                                            return acc;
                                        }, [])
                                            .map((column, index, arr) => (
                                                <Box
                                                    style={{
                                                        marginRight: theme.spacing(
                                                            arr.length - 1 !== index ? 2 : 0,
                                                        ),
                                                    }}
                                                    key={index}
                                                >
                                                    {column.map((card) => (
                                                        <CardLink
                                                            id={card.id}
                                                            name={card.name}
                                                            url={card.url}
                                                            categories={card.categories}
                                                            icoVariant={card.icoVariant}
                                                            description={card.description}
                                                            imageUrl={card.imageUrl}
                                                            key={card.id}
                                                            style={{ marginBottom: theme.spacing(2) }}
                                                        />
                                                    ))}
                                                </Box>
                                            ))}
                                    </Category>
                                );
                            })}
                        </div>
                    </Fade>
                </Container>
                <ReactResizeDetector handleWidth onResize={() => setColumnsCount(maxColumnCalc())} />
            </Box>
            <AddBookmarkButton />
        </React.Fragment>
    );
}

export default observer(Bookmarks);
