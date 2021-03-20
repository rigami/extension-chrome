import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CircularProgress,
    Box,
    Button,
} from '@material-ui/core';
import { LabelRounded as LabelIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import Scrollbar from '@/ui-components/CustomScroll';
import Stub from '@/ui-components/Stub';
import { useTranslation } from 'react-i18next';
import BookmarksUniversalService, { SearchQuery } from '@/stores/universal/bookmarks/bookmarks';
import BookmarksGrid from '@/ui/Bookmarks/BookmarksGrid';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';
import useCoreService from '@/stores/app/BaseStateProvider';
import { observer } from 'mobx-react-lite';
import useAppService from '@/stores/app/AppStateProvider';
import { ContextMenuItem } from '@/stores/app/entities/contextMenu';

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
    const { t } = useTranslation(['bookmark']);
    const appService = useAppService();
    const bookmarksService = useBookmarksService();
    const coreService = useCoreService();
    const [tag] = useState(bookmarksService.tags.get(id));
    const [isSearching, setIsSearching] = useState(true);
    const [findBookmarks, setFindBookmarks] = useState(null);

    const contextMenu = () => [
        new ContextMenuItem({
            title: t('bookmark:button.add'),
            icon: AddBookmarkIcon,
            onClick: () => {
                coreService.localEventBus.call('bookmark/create', { defaultTagsIds: [id] });
            },
        }),
    ];

    useEffect(() => {
        setIsSearching(true);
        BookmarksUniversalService.query(new SearchQuery({ tags: [id] }))
            .then(({ all }) => {
                setFindBookmarks(all);
                setIsSearching(false);
            });
    }, [bookmarksService.lastTruthSearchTimestamp]);

    return (
        <Card
            className={classes.root} elevation={16}
            onContextMenu={appService.contextMenu(contextMenu)}
        >
            <CardHeader
                avatar={(
                    <LabelIcon style={{ color: tag.color }} />
                )}
                title={tag.name}
                classes={{ avatar: classes.avatar }}
            />
            {isSearching && (
                <Stub>
                    <CircularProgress />
                </Stub>
            )}
            {!isSearching && findBookmarks.length === 0 && (
                <Stub message={t('bookmark:empty')}>
                    <Button
                        onClick={() => coreService.localEventBus.call(
                            'bookmark/create',
                            { defaultTagsIds: [id] },
                        )}
                        startIcon={<AddBookmarkIcon />}
                        variant="contained"
                        color="primary"
                    >
                        {t('bookmark:button.add', { context: 'first' })}
                    </Button>
                </Stub>
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

export default observer(Folder);
