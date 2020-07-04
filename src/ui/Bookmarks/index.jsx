import React, { useEffect, useState, useRef } from 'react';

import {
    Box,
    Container,
    Typography,
    Fade,
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import ReactResizeDetector from 'react-resize-detector';
import { useService as useAppService } from '@/stores/app';
import Categories from '@/ui/Bookmarks/Ctegories';
import FullScreenStub from '@/ui-components/FullscreenStub';
import Category from '@/ui/Bookmarks/Ctegory';
import CreateBookmarkButton from './CreateBookmarkButton';
import CardLink from './CardLink';

const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: '100vh',
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
    const bookmarksStore = useBookmarksService();
    const appService = useAppService();
    const isFirstRun = useRef(true);
    const [columnsCount, setColumnsCount] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [findBookmarks, setFindBookmarks] = useState(null);
    const [searchCategories, setSearchCategories] = useState(null);
    const [lastTruthSearchTimestamp, setLastTruthSearchTimestamp] = useState(bookmarksStore.lastTruthSearchTimestamp);

    let columnStabilizer = null;

    const handleSearch = (categories = []) => {
        bookmarksStore.search({ categories })
            .then((searchResult) => {
                setLastTruthSearchTimestamp(bookmarksStore.lastTruthSearchTimestamp);
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
                handleSearch(bookmarksStore.lastSearch?.categories);
            }

            setSearchCategories(bookmarksStore.lastSearch?.categories);
        }
    }, [appService.activity]);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        if (bookmarksStore.lastTruthSearchTimestamp !== lastTruthSearchTimestamp && !isSearching) {
            setIsSearching(true);
            handleSearch(bookmarksStore.lastSearch?.categories);
        }
    }, [bookmarksStore.lastTruthSearchTimestamp]);

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
                            if (searchCategories) handleSearch(searchCategories);
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
            <CreateBookmarkButton />
        </React.Fragment>
    );
}

export default observer(Bookmarks);
