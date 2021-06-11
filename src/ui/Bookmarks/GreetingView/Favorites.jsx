import React, { useEffect } from 'react';
import BookmarkEntity from '@/stores/universal/bookmarks/entities/bookmark';
import Link from '@/ui/Desktop/FAP/Link';
import FolderEntity from '@/stores/universal/bookmarks/entities/folder';
import Folder from '@/ui/Desktop/FAP/Folder';
import TagEntity from '@/stores/universal/bookmarks/entities/tag';
import Tag from '@/ui/Desktop/FAP/Tag';
import { Box, Card, Typography } from '@material-ui/core';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import { useLocalObservable, observer } from 'mobx-react-lite';
import asyncAction from '@/utils/asyncAction';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import TagsUniversalService from '@/stores/universal/bookmarks/tags';
import { captureException } from '@sentry/react';
import Image from '@/ui-components/Image';
import { first } from 'lodash';
import { BKMS_VARIANT } from '@/enum';
import { FolderRounded as FolderIcon, LabelRounded as TagIcon } from '@material-ui/icons';
import { fade, makeStyles, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
        '& > *': {
            marginRight: theme.spacing(1.5),
            marginBottom: theme.spacing(1.5),
        },
    },
    favoriteItem: {
        display: 'flex',
        alignItems: 'center',
        minHeight: 38,
        padding: theme.spacing(0.5),
        borderRadius: 'inherit',
    },
    icon: {
        marginRight: theme.spacing(1.25),
        width: 28,
        height: 28,
        flexShrink: 0,
    },
    title: {
        overflow: 'hidden',
        lineHeight: 1.1,
        wordBreak: 'break-word',
        fontFamily: theme.typography.primaryFontFamily,
        fontWeight: 600,
        fontSize: '0.94rem',
        marginRight: theme.spacing(1),
        maxWidth: 360,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    itemBackdrop: { backgroundColor: 'transparent' },
}));

function FavoriteItem(props) {
    const {
        type,
        name,
        icoUrl,
        icoVariant,
        color,
    } = props;
    const classes = useStyles();
    const theme = useTheme();

    return (
        <Card className={classes.favoriteItem} variant="outlined">
            {type === 'bookmark' && (
                <Image
                    src={icoUrl}
                    alternativeIcon={first(name)?.toUpperCase()}
                    variant={icoVariant === BKMS_VARIANT.POSTER ? BKMS_VARIANT.SYMBOL : icoVariant}
                    className={classes.icon}
                    dense
                />
            )}
            {type === 'folder' && (
                <FolderIcon className={classes.icon} style={{ color: fade(theme.palette.text.secondary, 0.23) }} />
            )}
            {type === 'tag' && (
                <TagIcon className={classes.icon} style={{ color }} />
            )}
            <Typography className={classes.title}>
                {name}
            </Typography>
        </Card>
    );
}

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
                        <Link {...a11props}>
                            <FavoriteItem
                                type="bookmark"
                                name={fav.name}
                                icoUrl={fav.icoUrl}
                                icoVariant={fav.icoVariant}
                            />
                        </Link>
                    );
                } else if (fav instanceof FolderEntity) {
                    return (
                        <Folder {...a11props} classes={{ backdrop: classes.itemBackdrop }}>
                            <FavoriteItem
                                type="folder"
                                name={fav.name}
                            />
                        </Folder>
                    );
                } else if (fav instanceof TagEntity) {
                    return (
                        <Tag {...a11props} classes={{ backdrop: classes.itemBackdrop }}>
                            <FavoriteItem
                                type="tag"
                                name={fav.name}
                                color={fav.color}
                            />
                        </Tag>
                    );
                }

                return null;
            })}
        </Box>
    );
}

export default observer(Favorites);
