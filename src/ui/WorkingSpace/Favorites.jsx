import React, { useEffect } from 'react';
import { Box, Typography } from '@material-ui/core';
import { useLocalObservable, observer } from 'mobx-react-lite';
import { captureException } from '@sentry/react';
import { makeStyles } from '@material-ui/core/styles';
import { StarRounded as CheckIcon } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import BookmarkEntity from '@/stores/universal/workingSpace/entities/bookmark';
import Link from '@/ui/Desktop/FAP/Link';
import FolderEntity from '@/stores/universal/workingSpace/entities/folder';
import Folder from '@/ui/Desktop/FAP/Folder';
import TagEntity from '@/stores/universal/workingSpace/entities/tag';
import Tag from '@/ui/Desktop/FAP/Tag';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import asyncAction from '@/utils/helpers/asyncAction';
import BookmarksUniversalService from '@/stores/universal/workingSpace/bookmarks';
import FoldersUniversalService from '@/stores/universal/workingSpace/folders';
import TagsUniversalService from '@/stores/universal/workingSpace/tags';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
        maxWidth: 4 * (theme.shape.dataCard.width + 16) + 24 + 8,
    },
    item: { boxShadow: `inset 0px 0px 0px 1px ${theme.palette.divider}` },
    favoritesContainer: {
        maxWidth: 1000,
        display: 'flex',
        flexWrap: 'wrap',
        '& > *': {
            marginRight: theme.spacing(1.5),
            marginBottom: theme.spacing(1.5),
        },
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    icon: {
        color: theme.palette.favorite.main,
        width: 22,
        height: 22,
        marginRight: theme.spacing(1),
    },
}));

function Favorites() {
    const classes = useStyles();
    const { t } = useTranslation();
    const workingSpaceService = useWorkingSpaceService();
    const store = useLocalObservable(() => ({
        favorites: [],
        isLoading: true,
        maxCount: 0,
    }));

    useEffect(() => {
        if (workingSpaceService.favorites.length === 0) {
            store.favorites = [];
            return;
        }

        asyncAction(async () => {
            const queue = workingSpaceService.favorites.map((fav) => {
                if (fav.itemType === 'bookmark') {
                    return BookmarksUniversalService.get(fav.itemId);
                } else if (fav.itemType === 'folder') {
                    return FoldersUniversalService.get(fav.itemId);
                } else if (fav.itemType === 'tag') {
                    return TagsUniversalService.get(fav.itemId);
                }

                return Promise.reject(new Error(`Unknown favorite item with keys (${Object.keys(fav || {}).join(', ')})`));
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
    }, [workingSpaceService.favorites.length, workingSpaceService.lastTruthSearchTimestamp]);

    if (workingSpaceService.favorites.length === 0) {
        return (
            <Box style={{ height: 36 }} />
        );
    }

    return (
        <Box pl={2} mb={4}>
            <Box className={classes.header}>
                <CheckIcon className={classes.icon} />
                <Typography>{t('bookmark:button.favorites')}</Typography>
            </Box>
            <Box className={classes.favoritesContainer}>
                {store.favorites.map((fav) => {
                    if (!fav) return;

                    const a11props = {
                        ...fav,
                        key: `${fav.constructor.name}-${fav.id}`,
                    };

                    if (fav instanceof BookmarkEntity) {
                        return (
                            <Link {...a11props} className={classes.item} dense />
                        );
                    } else if (fav instanceof FolderEntity) {
                        return (
                            <Folder {...a11props} className={classes.item} dense />
                        );
                    } else if (fav instanceof TagEntity) {
                        return (
                            <Tag {...a11props} className={classes.item} dense />
                        );
                    }

                    return null;
                })}
            </Box>
        </Box>
    );
}

export default observer(Favorites);
