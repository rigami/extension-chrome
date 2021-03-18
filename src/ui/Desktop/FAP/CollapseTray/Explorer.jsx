import React, { useEffect, useState } from 'react';
import { Card } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import FolderEntity from '@/stores/universal/bookmarks/entities/folder';
import TagEntity from '@/stores/universal/bookmarks/entities/tag';
import BookmarkEntity from '@/stores/universal/bookmarks/entities/bookmark';
import Link from '@/ui/Desktop/FAP/Link';
import Folder from '@/ui/Desktop/FAP/Folder';
import Tag from '@/ui/Desktop/FAP/Tag';

const useStyles = makeStyles((theme) => ({
    root: {
        maxWidth: 464,
        padding: theme.spacing(2),
        paddingBottom: 0,
        paddingRight: 0,
        display: 'flex',
        flexWrap: 'wrap',
    },
    link: {
        marginRight: theme.spacing(2),
        marginBottom: theme.spacing(2),
        padding: 0,
        display: 'block',
    },
}));

function Explorer({ offsetLoad }) {
    const classes = useStyles();
    const bookmarksService = useBookmarksService();
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (bookmarksService.favorites.length === 0) {
            setFavorites([]);
            return;
        }

        Promise.allSettled(
            bookmarksService.favorites.map((fav) => {
                if (fav.itemType === 'bookmark') {
                    return BookmarksUniversalService.get(fav.itemId);
                } else if (fav.itemType === 'folder') {
                    return FoldersUniversalService.get(fav.itemId);
                } else if (fav.itemType === 'tag') {
                    return bookmarksService.tags.get(fav.itemId);
                }

                return Promise.reject();
            }),
        )
            .then((findFavorites) => {
                setFavorites(
                    findFavorites
                        .filter(({ status }, index) => {
                            if (status !== 'fulfilled') {
                                bookmarksService.removeFromFavorites(bookmarksService.favorites[index]?.id);
                                return false;
                            } else {
                                return true;
                            }
                        })
                        .map(({ value }) => value),
                );
                setIsLoading(false);
            })
            .catch((e) => {
                console.error('Failed load favorites', e);
                setIsLoading(false);
            });
    }, [bookmarksService.favorites.length]);

    return (
        <Card className={classes.root} elevation={16}>
            {!isLoading && favorites.slice(offsetLoad).map((fav) => {
                let a11props = {
                    ...fav,
                    key: `${fav.type}-${fav.id}`,
                };

                if (fav instanceof FolderEntity || fav instanceof TagEntity) {
                    a11props = {
                        ...a11props,
                        classes: { root: classes.link },
                    };
                }

                if (fav instanceof BookmarkEntity) {
                    return (<Link {...a11props} className={classes.link} />);
                } else if (fav instanceof FolderEntity) {
                    return (<Folder {...a11props} />);
                } else if (fav instanceof TagEntity) {
                    return (<Tag {...a11props} />);
                }

                return null;
            })}
        </Card>
    );
}

export default Explorer;
