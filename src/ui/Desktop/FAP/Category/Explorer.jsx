import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CircularProgress,
    Box,
} from '@material-ui/core';
import { LabelRounded as LabelIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import Scrollbar from '@/ui-components/CustomScroll';
import Stub from '@/ui-components/Stub';
import { useTranslation } from 'react-i18next';
import BookmarksUniversalService, { SearchQuery } from '@/stores/universal/bookmarks/bookmarks';
import BookmarksGrid from '@/ui/Bookmarks/BookmarksGrid';

const useStyles = makeStyles((theme) => ({
    root: {
        width: 409,
        height: 620,
        maxHeight: 'inherit',
        maxWeight: 'inherit',
        display: 'flex',
        flexDirection: 'column',
    },
    avatar: {
        display: 'flex',
        height: theme.spacing(4),
        alignItems: 'center',
    },
    bookmarks: {
        flexGrow: 1,
        overflow: 'auto',
    },
}));

function Folder({ id }) {
    const classes = useStyles();
    const bookmarksService = useBookmarksService();
    const { t } = useTranslation();

    const [category] = useState(bookmarksService.categories.get(id));
    const [isSearching, setIsSearching] = useState(true);
    const [findBookmarks, setFindBookmarks] = useState(null);

    useEffect(() => {
        BookmarksUniversalService.query(new SearchQuery({ tags: [id] }))
            .then(({ all }) => {
                setFindBookmarks(all);
                setIsSearching(false);
            });
    }, []);

    return (
        <Card className={classes.root} elevation={16}>
            <CardHeader
                avatar={(
                    <LabelIcon style={{ color: category.color }} />
                )}
                title={category.name}
                classes={{ avatar: classes.avatar }}
            />
            {isSearching && (
                <Stub>
                    <CircularProgress />
                </Stub>
            )}
            {!isSearching && findBookmarks.length === 0 && (
                <Stub
                    message={t('fap.category.emptyTitle')}
                    description={t('fap.category.emptyDescription')}
                />
            )}
            {findBookmarks && findBookmarks.length !== 0 && (
                <Box display="flex" className={classes.bookmarks}>
                    <Scrollbar>
                        <Box display="flex" ml={2}>
                            <BookmarksGrid
                                bookmarks={findBookmarks}
                                columns={2}
                            />
                        </Box>
                    </Scrollbar>
                </Box>
            )}
        </Card>
    );
}

export default Folder;
