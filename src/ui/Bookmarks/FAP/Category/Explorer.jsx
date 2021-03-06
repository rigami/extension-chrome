import React, { useState, useEffect, useRef } from 'react';
import {
    Card,
    CardHeader,
    List,
    CircularProgress,
    IconButton,
} from '@material-ui/core';
import {
    LabelRounded as LabelIcon,
    MoreVertRounded as MoreIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import useCoreService from '@/stores/app/BaseStateProvider';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import Scrollbar from '@/ui-components/CustomScroll';
import FullScreenStub from '@/ui-components/FullscreenStub';
import { useTranslation } from 'react-i18next';
import Link from '@/ui/Bookmarks/FAP/Link';
import useAppService from '@/stores/app/AppStateProvider';
import pin from '@/utils/contextMenu/pin';
import edit from '@/utils/contextMenu/edit';
import remove from '@/utils/contextMenu/remove';

const useStyles = makeStyles(() => ({
    root: { width: 450 },
    avatar: { display: 'flex' },
    list: {
        height: 550,
        overflow: 'auto',
    },
}));

function Folder({ id }) {
    const classes = useStyles();
    const appService = useAppService();
    const bookmarksService = useBookmarksService();
    const coreService = useCoreService();
    const { t } = useTranslation();

    const [category] = useState(bookmarksService.categories.get(id));
    const [isSearching, setIsSearching] = useState(true);
    const [findBookmarks, setFindBookmarks] = useState(null);
    const buttonRef = useRef(null);

    const contextMenu = (event) => [
        pin({
            itemId: id,
            itemType: 'category',
            t,
            bookmarksService,
        }),
        edit({
            itemId: id,
            itemType: 'category',
            t,
            coreService,
            anchorEl: event.currentTarget,
        }),
        remove({
            itemId: id,
            itemType: 'category',
            t,
            coreService,
        }),
    ];

    useEffect(() => {
        bookmarksService.bookmarks.query({ categories: { match: [id] } })
            .then((searchResult) => {
                setFindBookmarks(searchResult[0]?.bookmarks || []);
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
                action={(
                    <IconButton
                        data-ui-path="category.explorer.menu"
                        onClick={appService.contextMenu(contextMenu, { useAnchorEl: true })}
                        ref={buttonRef}
                    >
                        <MoreIcon />
                    </IconButton>
                )}
            />
            <List disablePadding className={classes.list}>
                <Scrollbar>
                    {isSearching && (
                        <FullScreenStub style={{ height: 550 }}>
                            <CircularProgress />
                        </FullScreenStub>
                    )}
                    {!isSearching && findBookmarks.length === 0 && (
                        <FullScreenStub
                            style={{ height: 550 }}
                            message={t('fap.category.emptyTitle')}
                            description={t('fap.category.emptyDescription')}
                        />
                    )}
                    {findBookmarks && findBookmarks.map((bookmark, index) => (
                        <Link
                            key={bookmark.id}
                            {...bookmark}
                            variant="row"
                            divider={index !== findBookmarks.length - 1}
                        />
                    ))}
                </Scrollbar>
            </List>
        </Card>
    );
}

export default Folder;
