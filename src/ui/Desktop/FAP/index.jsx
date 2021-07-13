import React, { useCallback, useEffect } from 'react';
import { Box, Card, Fade } from '@material-ui/core';
import { useResizeDetector } from 'react-resize-detector';
import { makeStyles } from '@material-ui/core/styles';
import { observer, useLocalObservable } from 'mobx-react-lite';
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
import TagEntity from '@/stores/universal/bookmarks/entities/tag';
import useAppService from '@/stores/app/AppStateProvider';
import TagsUniversalService from '@/stores/universal/bookmarks/tags';
import asyncAction from '@/utils/asyncAction';
import { captureException } from '@sentry/react';
import FAP_STYLE from '@/enum/BKMS/FAP_STYLE';
import Folder from './Folder';
import Tag from './Tag';
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
        minWidth: (40 + theme.spacing(2)) * 6 + 40 + theme.spacing(1.25) * 2,
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
        backgroundColor: fade(theme.palette.background.backdrop, 0.22),
        marginBottom: theme.spacing(3),
        minHeight: 60,
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
    disableLeftPadding: {
        paddingLeft: 0,
        paddingRight: 0,
        minWidth: 'unset',
    },
}));

function FAP() {
    const classes = useStyles();
    const appService = useAppService();
    const bookmarksService = useBookmarksService();
    const store = useLocalObservable(() => ({
        favorites: [],
        isLoading: true,
        maxCount: 0,
    }));
    const fapSettings = bookmarksService.settings;

    const onResize = useCallback((width) => {
        store.maxCount = Math.max(Math.floor((width + 16) / 56) - 1, 0);
    }, []);

    const { ref } = useResizeDetector({ onResize });

    useEffect(() => {
        if (bookmarksService.favorites.length === 0) {
            store.favorites = [];
            return;
        }

        /* if (store.favorites.length >= store.maxCount) {
            store.favorites = store.favorites.slice(0, store.maxCount);

            return;
        } */

        console.log('start fap load');
        console.time('fap load');

        asyncAction(async () => {
            const queue = bookmarksService.favorites.slice(0, store.maxCount).map((fav) => {
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
    }, [bookmarksService.favorites.length, store.maxCount, bookmarksService.lastTruthSearchTimestamp]);

    const overload = store.maxCount < bookmarksService.favorites.length;

    const isContained = (fapSettings.fapStyle === BKMS_FAP_STYLE.CONTAINED || appService.activity === ACTIVITY.FAVORITES)
    && fapSettings.fapStyle !== BKMS_FAP_STYLE.PRODUCTIVITY;

    return (
        <Fade in={!store.isLoading}>
            <Box
                ref={ref}
                className={clsx(
                    classes.root,
                    (fapSettings.fapPosition === BKMS_FAP_POSITION.BOTTOM || appService.activity === ACTIVITY.FAVORITES)
                    && classes.stickyRoot,
                    isContained && classes.contained,
                )}
            >
                <Card
                    elevation={0}
                    className={clsx(
                        classes.card,
                        isContained && classes.backdrop,
                        fapSettings.fapAlign === BKMS_FAP_ALIGN.LEFT && classes.leftAlign,
                        appService.activity === ACTIVITY.BOOKMARKS && classes.contrastBackdrop,
                        fapSettings.fapStyle === BKMS_FAP_STYLE.PRODUCTIVITY && classes.disableLeftPadding,
                    )}
                >
                    {store.maxCount.length !== 0 && store.favorites.slice(0, store.maxCount).map((fav) => {
                        let a11props = {
                            ...fav,
                            key: `${fav.constructor.name}-${fav.id}`,
                            isBlurBackdrop: !isContained,
                            dense: fapSettings.fapStyle === FAP_STYLE.PRODUCTIVITY,
                        };

                        if (fav instanceof FolderEntity || fav instanceof TagEntity) {
                            a11props = {
                                ...a11props,
                                classes: {
                                    root: classes.link,
                                    backdrop: clsx(
                                        /* !isContained && */ classes.linkBackdropBlur,
                                        // isContained && classes.linkBackdrop,
                                    ),
                                },
                            };
                        }

                        if (fav instanceof BookmarkEntity) {
                            return (<Link {...a11props} className={clsx(classes.link, classes.linkBackdropBlur)} />);
                        } else if (fav instanceof FolderEntity) {
                            return (<Folder {...a11props} />);
                        } else if (fav instanceof TagEntity) {
                            return (<Tag {...a11props} />);
                        }

                        return null;
                    })}
                    {overload && (
                        <CollapseTray
                            offsetLoad={store.maxCount}
                            classes={{
                                backdrop: clsx(
                                    classes.overload,
                                    !isContained && classes.linkBackdropBlur,
                                    isContained && classes.linkBackdrop,
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
    const appService = useAppService();
    const bookmarksService = useBookmarksService();

    if (bookmarksService.settings.fapStyle !== BKMS_FAP_STYLE.HIDDEN || appService.activity === ACTIVITY.FAVORITES) {
        return (<ObserverFAP />);
    }

    return null;
}

export default observer(FAPWrapper);
