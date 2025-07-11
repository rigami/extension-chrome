import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardHeader,
    CircularProgress,
    IconButton,
    Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
    FavoriteRounded as FavoritesIcon,
    CloseRounded as CloseIcon,
} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { captureException } from '@sentry/react';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import BookmarksUniversalService from '@/stores/universal/workingSpace/bookmarks';
import FoldersUniversalService from '@/stores/universal/workingSpace/folders';
import FolderEntity from '@/stores/universal/workingSpace/entities/folder';
import TagEntity from '@/stores/universal/workingSpace/entities/tag';
import BookmarkEntity from '@/stores/universal/workingSpace/entities/bookmark';
import TagsUniversalService from '@/stores/universal/workingSpace/tags';
import Stub from '@/ui-components/Stub';
import Scrollbar from '@/ui-components/CustomScroll';
import BookmarksGrid from '@/ui/WorkingSpace/BookmarksViewer/BookmarksGrid';
import { useCoreService } from '@/stores/app/core';
import FolderCard from '@/ui/Desktop/FAP/Folder/Card';
import TagCard from '@/ui/Desktop/FAP/Tag/Card';

const useStyles = makeStyles((theme) => ({
    root: {
        width: (theme.shape.dataCard.width + theme.spacing(2)) * 2 + theme.spacing(2) + 1,
        maxWeight: 'inherit',
        borderRadius: 0,
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        transition: theme.transitions.create(['width'], {
            duration: theme.transitions.duration.short,
            easing: theme.transitions.easing.easeInOut,
        }),
    },
    avatar: {
        display: 'flex',
        height: theme.spacing(4),
        alignItems: 'center',
    },
    bookmarks: {
        overflow: 'auto',
        flexGrow: 1,
        width: (theme.shape.dataCard.width + theme.spacing(2)) * 2 + theme.spacing(2) + 1,
    },
    resetOffsetButton: {
        margin: theme.spacing(-1.5),
        marginLeft: theme.spacing(-0.5),
    },
    shrink: {
        width: 72,
        zIndex: 0,
        cursor: 'pointer',
        '&:hover $notActiveFolder': { opacity: 1 },
    },
    folderCard: {
        marginRight: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    action: { marginBottom: theme.spacing(-1) },
}));

function Explorer(props) {
    const {
        offsetLoad,
        openItem,
        shrink,
        className: externalClassName,
        onOpenItem,
        onBack,
    } = props;
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const workingSpaceService = useWorkingSpaceService();
    const coreService = useCoreService();
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (workingSpaceService.favorites.length === 0) {
            setFavorites([]);
            return;
        }

        Promise.allSettled(
            workingSpaceService.favorites.map((fav) => {
                if (fav.itemType === 'bookmark') {
                    return BookmarksUniversalService.get(fav.itemId);
                } else if (fav.itemType === 'folder') {
                    return FoldersUniversalService.get(fav.itemId);
                } else if (fav.itemType === 'tag') {
                    return TagsUniversalService.get(fav.itemId);
                }

                return Promise.reject(new Error(`Unknown favorite item with keys (${Object.keys(fav || {}).join(', ')})`));
            }),
        )
            .then((findFavorites) => {
                setFavorites(
                    findFavorites
                        .filter(({ status }, index) => {
                            if (status !== 'fulfilled') {
                                workingSpaceService.removeFromFavorites(workingSpaceService.favorites[index]?.id);
                                return false;
                            }

                            return true;
                        })
                        .map(({ value }) => value),
                );
                setIsLoading(false);
            })
            .catch((e) => {
                console.error('Failed load favorites', e);
                captureException(e);
                setIsLoading(false);
            });
    }, [workingSpaceService.favorites.length]);

    const bookmarks = [];
    const folders = [];
    const tags = [];

    favorites.slice(offsetLoad)
        .forEach((fav) => {
            if (fav instanceof BookmarkEntity) {
                bookmarks.push(fav);
            } else if (fav instanceof FolderEntity) {
                folders.push(fav);
            } else if (fav instanceof TagEntity) {
                tags.push(fav);
            }
        });

    return (
        <Card
            className={clsx(classes.root, shrink && classes.shrink, externalClassName)}
            onClick={() => {
                if (shrink) onBack();
            }}
            elevation={0}
        >
            <CardHeader
                avatar={(
                    <IconButton
                        disabled={!openItem}
                        onClick={() => onOpenItem(null)}
                        className={classes.resetOffsetButton}
                    >
                        <FavoritesIcon />
                    </IconButton>
                )}
                action={!openItem && (
                    <Tooltip title={t('common:button.close')}>
                        <IconButton
                            onClick={() => {
                                if (coreService.tempStorage.data.closeFapPopper) {
                                    coreService.tempStorage.data.closeFapPopper();
                                }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                )}
                title={t('common:favorites.other')}
                classes={{
                    avatar: classes.avatar,
                    action: classes.action,
                }}
            />
            {isLoading && (
                <Stub>
                    <CircularProgress />
                </Stub>
            )}
            <Box display="flex" className={classes.bookmarks}>
                <Scrollbar>
                    <Box display="flex" flexWrap="wrap" ml={2}>
                        {folders.map((currFolder) => (
                            <FolderCard
                                active={openItem?.itemType === 'folder' && openItem?.itemId === currFolder.id}
                                key={currFolder.id}
                                id={currFolder.id}
                                name={currFolder.name}
                                className={classes.folderCard}
                                onClick={() => onOpenItem({
                                    itemType: 'folder',
                                    itemId: currFolder.id,
                                })}
                            />
                        ))}
                    </Box>
                    <Box display="flex" flexWrap="wrap" ml={2}>
                        {tags.map((currTag) => (
                            <TagCard
                                active={openItem?.itemType === 'tag' && openItem?.itemId === currTag.id}
                                key={currTag.id}
                                id={currTag.id}
                                name={currTag.name}
                                color={currTag.color}
                                className={classes.folderCard}
                                onClick={() => onOpenItem({
                                    itemType: 'tag',
                                    itemId: currTag.id,
                                })}
                            />
                        ))}
                    </Box>
                    <Box display="flex" ml={2}>
                        <BookmarksGrid
                            bookmarks={bookmarks}
                            columns={2}
                        />
                    </Box>
                </Scrollbar>
            </Box>
        </Card>
    );
}

export default Explorer;
