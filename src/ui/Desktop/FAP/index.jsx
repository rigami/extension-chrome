import React, {
    useState,
    useEffect,
    useCallback,
} from 'react';
import {
    Card,
    Fade,
    Box,
} from '@material-ui/core';
import { useResizeDetector } from 'react-resize-detector';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { fade } from '@material-ui/core/styles/colorManipulator';
import clsx from 'clsx';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import {
    ACTIVITY,
    BKMS_FAP_ALIGN,
    BKMS_FAP_POSITION,
    BKMS_FAP_STYLE,
} from '@/enum';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import BookmarkEntity from '@/stores/universal/bookmarks/entities/bookmark';
import FolderEntity from '@/stores/universal/bookmarks/entities/folder';
import CategoryEntity from '@/stores/universal/bookmarks/entities/category';
import useAppService from '@/stores/app/AppStateProvider';
import Folder from './Folder';
import Category from './Category';
import Link from './Link';
import CollapseTray from './CollapseTray';

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(11),
        paddingTop: 0,
        paddingBottom: 0,
        width: '100%',
        zIndex: theme.zIndex.speedDial,
        display: 'flex',
        pointerEvents: 'none',
        justifyContent: 'center',
        position: 'absolute',
        boxSizing: 'border-box',
        top: 0,
        height: theme.spacing(6) + 40,
    },
    stickyRoot: {
        top: 'auto',
        bottom: 0,
    },
    contained: { height: theme.spacing(6) + theme.spacing(2.5) + 40 },
    card: {
        margin: 'auto',
        pointerEvents: 'auto',
        borderRadius: 8,
        overflow: 'unset',
        display: 'flex',
        background: 'none',
        marginBottom: theme.spacing(1.75),
        padding: theme.spacing(1.25),
        transition: theme.transitions.create(['background-color'], {
            duration: theme.transitions.duration.short,
            easing: theme.transitions.easing.easeInOut,
        }),
    },
    leftAlign: { marginLeft: 0 },
    backdrop: {
        backdropFilter: 'blur(40px) brightness(110%)  contrast(1.2) invert(0.06)',
        backgroundColor: fade(theme.palette.background.default, 0.12),
        marginBottom: theme.spacing(3),
    },
    link: {
        marginRight: theme.spacing(2),
        padding: 0,
        '&:last-child': { marginRight: 0 },
    },
    linkBackdrop: { backgroundColor: theme.palette.background.default },
    linkBackdropBlur: {
        backdropFilter: 'blur(10px) brightness(200%)',
        backgroundColor: fade(theme.palette.background.default, 0.82),
    },
    overload: {
        width: 40,
        height: 40,
        borderRadius: theme.shape.borderRadiusBold,
    },
    contrastBackdrop: { backgroundColor: fade(theme.palette.background.backdrop, 0.95) },
}));

function FAP() {
    const classes = useStyles();
    const appService = useAppService();
    const bookmarksService = useBookmarksService();
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [maxCount, setMaxCount] = useState(0);
    const fapSettings = bookmarksService.settings;

    const onResize = useCallback((width) => {
        setMaxCount(Math.max(Math.floor((width + 16) / 56) - 1, 0));
    }, []);

    const { ref } = useResizeDetector({ onResize });

    useEffect(() => {
        if (bookmarksService.favorites.length === 0) {
            setFavorites([]);
            return;
        }

        if (favorites.length >= maxCount) {
            setFavorites(favorites.slice(0, maxCount));

            return;
        }

        Promise.allSettled(
            bookmarksService.favorites.slice(favorites.length, maxCount).map((fav) => {
                if (fav.itemType === 'bookmark') {
                    return BookmarksUniversalService.get(fav.itemId);
                } else if (fav.itemType === 'folder') {
                    return FoldersUniversalService.get(fav.itemId);
                } else if (fav.itemType === 'category') {
                    return bookmarksService.categories.get(fav.itemId);
                }

                return Promise.reject();
            }),
        )
            .then((findFavorites) => {
                setFavorites([
                    ...favorites,
                    ...findFavorites
                        .filter(({ status }, index) => {
                            if (status !== 'fulfilled') {
                                bookmarksService.removeFromFavorites(bookmarksService.favorites[index]?.id);
                                return false;
                            } else {
                                return true;
                            }
                        })
                        .map(({ value }) => value),
                ]);
                setIsLoading(false);
            })
            .catch((e) => {
                console.error('Failed load favorites', e);
                setIsLoading(false);
            });
    }, [bookmarksService.favorites.length, maxCount]);

    const overload = maxCount < bookmarksService.favorites.length;

    return (
        <Fade in={!isLoading}>
            <Box
                ref={ref}
                className={clsx(
                    classes.root,
                    fapSettings.fapPosition === BKMS_FAP_POSITION.BOTTOM && classes.stickyRoot,
                    fapSettings.fapStyle === BKMS_FAP_STYLE.CONTAINED && classes.contained,
                )}
            >
                <Card
                    elevation={0}
                    className={clsx(
                        classes.card,
                        fapSettings.fapStyle === BKMS_FAP_STYLE.CONTAINED && classes.backdrop,
                        fapSettings.fapAlign === BKMS_FAP_ALIGN.LEFT && classes.leftAlign,
                        appService.activity === ACTIVITY.BOOKMARKS && classes.contrastBackdrop,
                    )}
                >
                    {maxCount.length !== 0 && favorites.slice(0, maxCount).map((fav) => {
                        let a11props = {
                            ...fav,
                            key: `${fav.type}-${fav.id}`,
                            isBlurBackdrop: fapSettings.fapStyle === BKMS_FAP_STYLE.TRANSPARENT,
                        };

                        if (fav instanceof FolderEntity || fav instanceof CategoryEntity) {
                            a11props = {
                                ...a11props,
                                classes: {
                                    root: classes.link,
                                    backdrop: clsx(
                                        fapSettings.fapStyle === BKMS_FAP_STYLE.TRANSPARENT && classes.linkBackdropBlur,
                                        fapSettings.fapStyle === BKMS_FAP_STYLE.CONTAINED && classes.linkBackdrop,
                                    ),
                                },
                            };
                        }

                        if (fav instanceof BookmarkEntity) {
                            return (<Link {...a11props} className={classes.link} />);
                        } else if (fav instanceof FolderEntity) {
                            return (<Folder {...a11props} />);
                        } else if (fav instanceof CategoryEntity) {
                            return (<Category {...a11props} />);
                        }

                        return null;
                    })}
                    {overload && (
                        <CollapseTray
                            offsetLoad={maxCount}
                            classes={{
                                backdrop: clsx(
                                    classes.overload,
                                    fapSettings.fapStyle === BKMS_FAP_STYLE.TRANSPARENT && classes.linkBackdropBlur,
                                    fapSettings.fapStyle === BKMS_FAP_STYLE.CONTAINED && classes.linkBackdrop,
                                ),
                            }}
                        />
                    )}
                </Card>
            </Box>
        </Fade>
    );
}

const ObserverFAP = observer(FAP);

function FAPWrapper() {
    const bookmarksService = useBookmarksService();

    if (bookmarksService.settings.fapStyle === BKMS_FAP_STYLE.HIDDEN) return null;

    return (<ObserverFAP />);
}

export default observer(FAPWrapper);
