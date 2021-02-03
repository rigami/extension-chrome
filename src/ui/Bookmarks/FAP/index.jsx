import React, {
    useState, createRef, useEffect, useRef,
} from 'react';
import {
    Card,
    IconButton,
    Fade,
} from '@material-ui/core';
import {
    NavigateBeforeRounded as LeftIcon,
    NavigateNextRounded as RightIcon,
} from '@material-ui/icons';
import ReactResizeDetector from 'react-resize-detector';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { fade } from '@material-ui/core/styles/colorManipulator';
import clsx from 'clsx';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import { BKMS_FAP_POSITION, BKMS_FAP_STYLE } from '@/enum';
import ScrollContainer from 'react-indiana-drag-scroll';
import Link from './Link';
import Category from './Category';
import Folder from './Folder';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(11),
        paddingTop: theme.spacing(3),
        paddingBottom: 0,
        width: '100%',
        zIndex: theme.zIndex.speedDial,
        display: 'flex',
        pointerEvents: 'none',
        justifyContent: 'center',
        position: 'relative',
        boxSizing: 'border-box',
    },
    stickyRoot: {
        position: 'sticky',
        top: 0,
        bottom: theme.spacing(3),
    },
    card: {
        margin: 'auto',
        pointerEvents: 'auto',
        borderRadius: 16,
        backdropFilter: 'blur(20px) brightness(98%)  contrast(1.2) invert(0.1)',
        background: 'none',
    },
    panel: {
        padding: theme.spacing(1.5, 0),
        paddingLeft: theme.spacing(0.5),
        paddingRight: theme.spacing(0.5),
        maxWidth: 1400,
        display: 'block',
        whiteSpace: 'nowrap',
        '&::-webkit-scrollbar': {
            width: 0,
            height: 0,
        },
    },
    disablePadding: {
        padding: 0,
        paddingLeft: theme.spacing(1),
    },
    absoluteCard: {
        position: 'fixed',
        top: theme.spacing(3),
    },
    cardTransparent: {
        background: 'none',
        backdropFilter: 'none',
        boxShadow: 'none',
    },
    iconButton: {
        marginRight: theme.spacing(1),
        padding: theme.spacing(1),
        backgroundColor: fade(theme.palette.common.white, 0.32),
        '&:hover': { backgroundColor: fade(theme.palette.common.white, 0.52) },
    },
    popper: {
        width: 310,
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        backdropFilter: 'blur(15px) brightness(130%)',
        backgroundColor: fade(theme.palette.background.default, 0.70),
    },
    emptyTitle: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(2),
    },
    arrowButton: {
        padding: theme.spacing(1),
        position: 'absolute',
        zIndex: 1,
        backgroundColor: fade(theme.palette.common.black, 0.52),
        transition: theme.transitions.create('transform', {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.short,
        }),
    },
    leftArrow: { left: theme.spacing(1) },
    leftArrowHide: { transform: `translateX(calc(-100% - ${theme.spacing(1)}px))` },
    rightArrow: { right: theme.spacing(1) },
    rightArrowHide: { transform: `translateX(calc(100% + ${theme.spacing(1)}px))` },
}));

function FAP() {
    const classes = useStyles();
    const theme = useTheme();
    const bookmarksService = useBookmarksService();
    const scrollRef = createRef();
    const rootRef = useRef(null);
    const [isLeft, setIsLeft] = useState(false);
    const [isRight, setIsRight] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const resizeHandle = () => {
        const container = scrollRef.current.container.current;
        if (!container) return;
        if (container.clientWidth < container.scrollWidth) {
            setIsLeft(container.scrollLeft !== 0);
            setIsRight(
                container.scrollLeft + container.clientWidth
                !== container.scrollWidth,
            );
        } else {
            setIsLeft(false);
            setIsRight(false);
        }
    };

    const scrollHandle = (left) => {
        const container = scrollRef.current.container.current;
        if (!container) return;
        setIsLeft(left !== 0);
        setIsRight(left + container.clientWidth !== container.scrollWidth);
    };

    const scrollToStartHandle = () => {
        scrollRef.current.container.current.scrollTo({
            behavior: 'smooth',
            left: 0,
            top: 0,
        });
    };

    const scrollToEndHandle = () => {
        scrollRef.current.container.current.scrollTo({
            behavior: 'smooth',
            left: scrollRef.current.container.current.scrollWidth,
            top: 0,
        });
    };

    useEffect(() => {
        Promise.all(
            bookmarksService.favorites.map((fav) => {
                if (fav.type === 'bookmark') {
                    return bookmarksService.bookmarks.get(fav.id);
                } else if (fav.type === 'folder') {
                    return FoldersUniversalService.get(fav.id);
                } else {
                    return bookmarksService.categories.get(fav.id);
                }
            }),
        )
            .then((findFavorites) => {
                setFavorites(findFavorites.map((fav, index) => ({
                    ...fav,
                    type: bookmarksService.favorites[index].type,
                })));
                setIsLoading(false);
            })
            .catch((e) => {
                console.error('Failed load favorites', e);
                setIsLoading(false);
            });
    }, [bookmarksService.favorites.length]);

    return (
        <Fade in={bookmarksService.settings.fapStyle !== BKMS_FAP_STYLE.HIDDEN && !isLoading && favorites.length !== 0} unmountOnExit>
            <div
                className={clsx(
                    classes.root,
                    bookmarksService.settings.fapPosition === BKMS_FAP_POSITION.BOTTOM && classes.stickyRoot,
                )}
                ref={rootRef}
                style={{ height: 40 + theme.spacing(3 + (bookmarksService.settings.fapStyle === BKMS_FAP_STYLE.TRANSPARENT ? 0 : 3)) }}
            >
                <Card
                    elevation={12}
                    className={clsx(
                        classes.card,
                        bookmarksService.settings.fapStyle === BKMS_FAP_STYLE.TRANSPARENT && classes.cardTransparent,
                        bookmarksService.settings.fapPosition === BKMS_FAP_POSITION.TOP && classes.absoluteCard,
                    )}
                >
                    <ScrollContainer
                        vertical={false}
                        horizontal
                        hideScrollbars
                        onScroll={scrollHandle}
                        className={clsx(
                            classes.panel,
                            bookmarksService.settings.fapStyle === BKMS_FAP_STYLE.TRANSPARENT && classes.disablePadding,
                        )}
                        ref={scrollRef}
                    >
                        <IconButton
                            className={clsx(
                                classes.arrowButton,
                                classes.leftArrow,
                                !isLeft && classes.leftArrowHide,
                            )}
                            onClick={scrollToStartHandle}
                        >
                            <LeftIcon />
                        </IconButton>
                        {favorites.map((fav) => {
                            if (fav.type === 'bookmark') {
                                return (
                                    <Link
                                        {...fav}
                                        key={`${fav.type}-${fav.id}`}
                                        isBlurBackdrop={bookmarksService.settings.fapStyle === BKMS_FAP_STYLE.TRANSPARENT}
                                    />
                                );
                            } else if (fav.type === 'folder') {
                                return (
                                    <Folder
                                        {...fav}
                                        key={`${fav.type}-${fav.id}`}
                                        isBlurBackdrop={bookmarksService.settings.fapStyle === BKMS_FAP_STYLE.TRANSPARENT}
                                    />
                                );
                            } else {
                                return (
                                    <Category
                                        {...fav}
                                        key={`${fav.type}-${fav.id}`}
                                        isBlurBackdrop={bookmarksService.settings.fapStyle === BKMS_FAP_STYLE.TRANSPARENT}
                                    />
                                );
                            }
                        })}
                        <IconButton
                            className={clsx(
                                classes.arrowButton,
                                classes.rightArrow,
                                !isRight && classes.rightArrowHide,
                            )}
                            onClick={scrollToEndHandle}
                        >
                            <RightIcon />
                        </IconButton>
                    </ScrollContainer>
                    <ReactResizeDetector handleWidth onResize={resizeHandle} />
                </Card>
            </div>
        </Fade>
    );
}

export default observer(FAP);
