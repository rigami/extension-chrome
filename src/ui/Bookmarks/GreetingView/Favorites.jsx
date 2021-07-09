import React, { useEffect } from 'react';
import BookmarkEntity from '@/stores/universal/bookmarks/entities/bookmark';
import Link from '@/ui/Desktop/FAP/Link';
import FolderEntity from '@/stores/universal/bookmarks/entities/folder';
import Folder from '@/ui/Desktop/FAP/Folder';
import TagEntity from '@/stores/universal/bookmarks/entities/tag';
import Tag from '@/ui/Desktop/FAP/Tag';
import { Box } from '@material-ui/core';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import { useLocalObservable, observer } from 'mobx-react-lite';
import asyncAction from '@/utils/asyncAction';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import TagsUniversalService from '@/stores/universal/bookmarks/tags';
import { captureException } from '@sentry/react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import FavoriteItem from '@/ui-components/FavoriteItem';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        '& > *': {
            marginRight: theme.spacing(1.5),
            marginBottom: theme.spacing(1.5),
        },
    },
    itemBackdrop: { backgroundColor: 'transparent' },
}));

function Favorites({ className: externalClassName }) {
    const classes = useStyles();
    const bookmarksService = useBookmarksService();
    const store = useLocalObservable(() => ({
        favorites: [],
        isLoading: true,
        maxCount: 0,
    }));

    useEffect(() => {
        if (bookmarksService.favorites.length === 0) {
            store.favorites = [];
            return;
        }

        asyncAction(async () => {
            const queue = bookmarksService.favorites.map((fav) => {
                if (fav.itemType === 'bookmark') {
                    return BookmarksUniversalService.get(fav.itemId);
                } else if (fav.itemType === 'folder') {
                    return FoldersUniversalService.get(fav.itemId);
                } else if (fav.itemType === 'tag') {
                    return TagsUniversalService.get(fav.itemId);
                }

                return Promise.reject();
            });

            return Promise.allSettled(queue)
                .then((res) => res
                    .filter(({ status }) => status === 'fulfilled')
                    .map(({ value }) => value))
                .catch((e) => {
                    console.error(e);
                    captureException(e);
                });
        })
            .then((findFavorites) => {
                console.timeEnd('fap load');
                store.favorites = findFavorites;
                store.isLoading = false;
            })
            .catch((e) => {
                console.error('Failed load favorites', e);
                captureException(e);
                store.isLoading = false;
            });
    }, [bookmarksService.favorites.length, bookmarksService.lastTruthSearchTimestamp]);

    return (
        <Box className={clsx(classes.root, externalClassName)}>
            {store.favorites.map((fav) => {
                const a11props = {
                    ...fav,
                    key: `${fav.constructor.name}-${fav.id}`,
                };

                if (fav instanceof BookmarkEntity) {
                    return (
                        <Link {...a11props} dense />
                    );
                } else if (fav instanceof FolderEntity) {
                    return (
                        <Folder {...a11props} classes={{ backdrop: classes.itemBackdrop }} dense />
                    );
                } else if (fav instanceof TagEntity) {
                    return (
                        <Tag {...a11props} classes={{ backdrop: classes.itemBackdrop }} dense />
                    );
                }

                return null;
            })}
        </Box>
    );
}

export default observer(Favorites);
