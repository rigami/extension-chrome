import React, { useCallback, useEffect } from 'react';
import { Box, Card, Fade } from '@material-ui/core';
import { useResizeDetector } from 'react-resize-detector';
import { makeStyles, alpha } from '@material-ui/core/styles';
import { observer, useLocalObservable } from 'mobx-react-lite';
import clsx from 'clsx';
import { captureException } from '@sentry/react';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import {
    ACTIVITY,
    BKMS_FAP_ALIGN,
    BKMS_FAP_POSITION,
    BKMS_FAP_STYLE,
} from '@/enum';
import FoldersUniversalService from '@/stores/universal/workingSpace/folders';
import BookmarksUniversalService from '@/stores/universal/workingSpace/bookmarks';
import BookmarkEntity from '@/stores/universal/workingSpace/entities/bookmark';
import FolderEntity from '@/stores/universal/workingSpace/entities/folder';
import TagEntity from '@/stores/universal/workingSpace/entities/tag';
import { useAppStateService } from '@/stores/app/appState';
import TagsUniversalService from '@/stores/universal/workingSpace/tags';
import asyncAction from '@/utils/helpers/asyncAction';
import FAP_STYLE from '@/enum/BKMS/FAP_STYLE';
import { useCoreService } from '@/stores/app/core';
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
        // minHeight: theme.spacing(6) + 40,
    },
    stickyRoot: {
        top: 'auto',
        bottom: 0,
    },
    contained: {
        // minHeight: theme.spacing(6) + theme.spacing(2.5) + 40,
    },
    card: {
        minWidth: (40 + theme.spacing(1.5)) * 7 - theme.spacing(1.5) + theme.spacing(1.25) * 2,
        margin: 'auto',
        pointerEvents: 'auto',
        borderRadius: theme.shape.borderRadiusBold * 2,
        overflow: 'unset',
        display: 'flex',
        background: 'none',
        flexWrap: 'wrap',
        marginBottom: 0,
        padding: theme.spacing(2, 0),
        paddingBottom: 0,
        transition: theme.transitions.create(['background-color'], {
            duration: theme.transitions.duration.short,
            easing: theme.transitions.easing.easeInOut,
        }),
    },
    leftAlign: { marginLeft: 0 },
    backdrop: {
        backdropFilter: 'blur(40px) brightness(110%)  contrast(1.2) invert(0.06)',
        backgroundColor: alpha(theme.palette.background.backdrop, 0.22),
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        padding: theme.spacing(1.25),
        minHeight: 60,
    },
    link: {
        marginRight: theme.spacing(1.5),
        padding: 0,
        '&:last-child': { marginRight: 0 },
    },
    linkDense: {
        marginRight: theme.spacing(1.5),
        marginBottom: theme.spacing(1.5),
    },
    linkBackdrop: { backgroundColor: theme.palette.background.default },
    linkBackdropBlur: {
        backdropFilter: 'blur(10px) brightness(200%)',
        backgroundColor: alpha(theme.palette.background.default, 0.82),
    },
    linkBackdropBlurLight: { backdropFilter: 'blur(10px) brightness(200%)' },
    linkBackdropBlurColor: { backgroundColor: alpha(theme.palette.background.default, 0.82) },
    overload: {
        width: 40,
        height: 40,
        borderRadius: theme.shape.borderRadiusBold,
    },
    contrastBackdrop: { backgroundColor: alpha(theme.palette.background.backdrop, 0.95) },
    disableLeftPadding: {
        paddingLeft: 0,
        paddingRight: 0,
        minWidth: 'unset',
        maxWidth: 1200,
        paddingBottom: theme.spacing(0.5),
    },
    imageWithSafeZone: { padding: theme.spacing(0.5) },
}));

function FAP() {
    const classes = useStyles();
    const service = useCoreService();
    const appStateService = useAppStateService();
    const { desktopService } = appStateService;
    const workingSpaceService = useWorkingSpaceService();
    const store = useLocalObservable(() => ({
        favorites: [],
        isLoading: true,
        maxCount: 0,
    }));

    const onResize = useCallback((width, height) => {
        store.maxCount = Math.max(Math.floor((width + 16) / 56) - 1, 0);
        service.tempStorage.update({ desktopFapHeight: height });
    }, []);

    const { ref } = useResizeDetector({ onResize });

    useEffect(() => {
        if (workingSpaceService.favorites.length === 0) {
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
            const queue = workingSpaceService.favorites.slice(0, store.maxCount).map((fav) => {
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
    }, [workingSpaceService.favorites.length, store.maxCount, workingSpaceService.lastTruthSearchTimestamp]);

    const overload = store.maxCount < workingSpaceService.favorites.length;

    const isContained = desktopService.settings.fapStyle === BKMS_FAP_STYLE.CONTAINED;
    const isProductivity = desktopService.settings.fapStyle === BKMS_FAP_STYLE.PRODUCTIVITY;

    return (
        <Fade in={!store.isLoading}>
            <Box
                ref={ref}
                className={clsx(
                    classes.root,
                    (desktopService.settings.fapPosition === BKMS_FAP_POSITION.BOTTOM || appStateService.activity === ACTIVITY.FAVORITES)
                    && classes.stickyRoot,
                    isContained && classes.contained,
                )}
            >
                <Card
                    elevation={0}
                    className={clsx(
                        classes.card,
                        isContained && classes.backdrop,
                        desktopService.settings.fapAlign === BKMS_FAP_ALIGN.LEFT && classes.leftAlign,
                        appStateService.activity === ACTIVITY.BOOKMARKS && classes.contrastBackdrop,
                        isProductivity && classes.disableLeftPadding,
                    )}
                >
                    {store.maxCount.length !== 0 && store.favorites.slice(0, store.maxCount).map((fav) => {
                        if (!fav) return null;

                        let a11props = {
                            ...fav,
                            key: `${fav.constructor.name}-${fav.id}`,
                            isBlurBackdrop: !isContained,
                            dense: desktopService.settings.fapStyle === FAP_STYLE.PRODUCTIVITY,
                        };

                        if (fav instanceof FolderEntity) {
                            a11props = {
                                ...a11props,
                                classes: {
                                    root: clsx(classes.link, !isContained && classes.linkDense),
                                    backdrop: classes.linkBackdropBlurLight,
                                    stubFolderPreview: classes.linkBackdropBlurColor,
                                },
                            };
                        }

                        if (fav instanceof TagEntity) {
                            a11props = {
                                ...a11props,
                                classes: {
                                    root: clsx(classes.link, !isContained && classes.linkDense),
                                    backdrop: classes.linkBackdropBlur,
                                },
                            };
                        }

                        if (fav instanceof BookmarkEntity) {
                            a11props = {
                                ...a11props,
                                classes: {
                                    image: clsx(
                                        classes.linkBackdropBlur,
                                        !isProductivity && fav.icoSafeZone && classes.imageWithSafeZone,
                                    ),
                                },
                            };
                        }

                        if (fav instanceof BookmarkEntity) {
                            return (
                                <Link
                                    {...a11props}
                                    className={clsx(
                                        classes.link,
                                        !isContained && classes.linkDense,
                                    )}
                                />
                            );
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
    const appStateService = useAppStateService();
    const workingSpaceService = useWorkingSpaceService();
    const { desktopService } = appStateService;

    if (
        (
            desktopService.settings.fapStyle !== BKMS_FAP_STYLE.HIDDEN
            && workingSpaceService.favorites.length !== 0
        )
        || appStateService.activity === ACTIVITY.FAVORITES
    ) {
        return (<ObserverFAP />);
    }

    return null;
}

export default observer(FAPWrapper);
