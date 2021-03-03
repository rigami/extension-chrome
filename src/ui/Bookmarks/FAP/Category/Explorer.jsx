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
    BookmarkBorderRounded as PinnedFavoriteIcon,
    BookmarkRounded as UnpinnedFavoriteIcon,
    EditRounded as EditIcon,
    DeleteRounded as RemoveIcon,
    MoreVertRounded as MoreIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import useCoreService from '@/stores/app/BaseStateProvider';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import Scrollbar from '@/ui-components/CustomScroll';
import FullScreenStub from '@/ui-components/FullscreenStub';
import { useTranslation } from 'react-i18next';
import Link from '@/ui/Bookmarks/FAP/Link';
import Favorite from '@/stores/universal/bookmarks/entities/favorite';

const useStyles = makeStyles((theme) => ({
    root: {
        width: 310,
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        backdropFilter: 'blur(15px) brightness(130%)',
        backgroundColor: fade(theme.palette.background.default, 0.70),
    },
    avatar: { display: 'flex' },
    list: {
        height: 300,
        overflow: 'auto',
    },
}));

function Folder({ id }) {
    const classes = useStyles();
    const bookmarksService = useBookmarksService();
    const coreService = useCoreService();
    const { t } = useTranslation();

    const [category] = useState(bookmarksService.categories.get(id));
    const [isSearching, setIsSearching] = useState(true);
    const [findBookmarks, setFindBookmarks] = useState(null);
    const buttonRef = useRef(null);

    const isPin = () => bookmarksService.findFavorite({
        itemType: 'category',
        itemId: id,
    });

    const handlerContextMenu = (anchorEl) => {
        const { top, left } = buttonRef.current.getBoundingClientRect();
        coreService.localEventBus.call('system/contextMenu', {
            actions: [
                {
                    type: 'button',
                    title: isPin() ? t('fap.unpin') : t('fap.pin'),
                    icon: isPin() ? UnpinnedFavoriteIcon : PinnedFavoriteIcon,
                    onClick: () => {
                        if (isPin()) {
                            bookmarksService.removeFromFavorites(bookmarksService.findFavorite({
                                itemType: 'category',
                                itemId: id,
                            })?.id);
                        } else {
                            bookmarksService.addToFavorites(new Favorite({
                                itemType: 'category',
                                itemId: id,
                            }));
                        }
                    },
                },
                {
                    type: 'button',
                    title: t('edit'),
                    icon: EditIcon,
                    onClick: () => {
                        coreService.localEventBus.call('category/edit', {
                            id,
                            anchorEl,
                        });
                    },
                },
                {
                    type: 'button',
                    title: t('remove'),
                    icon: RemoveIcon,
                    onClick: () => {
                        coreService.localEventBus.call('category/remove', { id });
                    },
                },
            ],
            position: {
                top,
                left,
            },
        });
    };

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
                        onClick={(event) => handlerContextMenu(event.currentTarget)}
                        ref={buttonRef}
                    >
                        <MoreIcon />
                    </IconButton>
                )}
            />
            <List disablePadding className={classes.list}>
                <Scrollbar>
                    {isSearching && (
                        <FullScreenStub style={{ height: 300 }}>
                            <CircularProgress />
                        </FullScreenStub>
                    )}
                    {!isSearching && findBookmarks.length === 0 && (
                        <FullScreenStub
                            style={{ height: 300 }}
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
