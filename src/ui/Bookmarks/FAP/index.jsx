import React, {
    useState,
    createRef,
    useEffect,
    useRef,
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
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import { toJS } from 'mobx';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import BookmarkEntity from '@/stores/universal/bookmarks/entities/bookmark';
import FolderEntity from '@/stores/universal/bookmarks/entities/folder';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Folder from './Folder';
import Category from './Category';
import Link from './Link';

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
        top: theme.spacing(3),
    },
    stickyRoot: {
        top: 'auto',
        bottom: theme.spacing(3),
    },
    card: {
        margin: 'auto',
        pointerEvents: 'auto',
        borderRadius: 8,
        backdropFilter: 'blur(40px) brightness(110%)  contrast(1.2) invert(0.06)',
        background: 'none',
    },
    panel: {
        padding: theme.spacing(1.5, 0),
        paddingLeft: theme.spacing(0.5),
        paddingRight: theme.spacing(0.5),
        // maxWidth: 1400,
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

const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    padding: 16,
    margin: `0 ${16}px 0 0`,

    // change background colour if dragging
    background: isDragging ? 'lightgreen' : 'grey',

    // styles we need to apply on draggables
    ...draggableStyle,
});

const getListStyle = (isDraggingOver) => ({
    background: isDraggingOver ? 'lightblue' : 'lightgrey',
    display: 'flex',
    padding: 16,
    overflow: 'auto',
});

function FAP() {
    const classes = useStyles();
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
        Promise.allSettled(
            bookmarksService.favorites.map((fav) => {
                console.log('fav', toJS(fav));
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
                console.log('findFavorites:', findFavorites);
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
        <Fade
            in={bookmarksService.settings.fapStyle !== BKMS_FAP_STYLE.HIDDEN && !isLoading && favorites.length !== 0}
            unmountOnExit
        >
            <DragDropContext>
                <div
                    className={clsx(
                        classes.root,
                        bookmarksService.settings.fapPosition === BKMS_FAP_POSITION.BOTTOM && classes.stickyRoot,
                    )}
                    ref={rootRef}
                >
                    <Card
                        elevation={0}
                        className={clsx(
                            classes.card,
                            bookmarksService.settings.fapStyle === BKMS_FAP_STYLE.TRANSPARENT && classes.cardTransparent,
                        )}
                    >
                        <Droppable droppableId="droppable" direction="horizontal">
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    style={getListStyle(snapshot.isDraggingOver)}
                                    {...provided.droppableProps}
                                >
                                    {favorites.map((fav, index) => {
                                        if (fav instanceof BookmarkEntity) {
                                            return (
                                                <Draggable key={`${fav.type}-${fav.id}`} draggableId={`${fav.type}-${fav.id}`} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={getItemStyle(
                                                                snapshot.isDragging,
                                                                provided.draggableProps.style,
                                                            )}
                                                        >
                                                            <Link
                                                                {...fav}
                                                                key={`${fav.type}-${fav.id}`}
                                                                isBlurBackdrop={
                                                                    bookmarksService.settings.fapStyle === BKMS_FAP_STYLE.TRANSPARENT
                                                                }
                                                            />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            );
                                        } /* else if (fav instanceof FolderEntity) {
                                        return (
                                            <Draggable key={`${fav.type}-${fav.id}`}>
                                                <Folder
                                                    {...fav}
                                                    key={`${fav.type}-${fav.id}`}
                                                    isBlurBackdrop={
                                                        bookmarksService.settings.fapStyle === BKMS_FAP_STYLE.TRANSPARENT
                                                    }
                                                />
                                            </Draggable>
                                        );
                                    } else {
                                        return (
                                            <Draggable key={`${fav.type}-${fav.id}`}>
                                                <Category
                                                    {...fav}
                                                    key={`${fav.type}-${fav.id}`}
                                                    isBlurBackdrop={
                                                        bookmarksService.settings.fapStyle === BKMS_FAP_STYLE.TRANSPARENT
                                                    }
                                                />
                                            </Draggable>
                                        );
                                    } */
                                    })}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </Card>
                </div>
            </DragDropContext>
        </Fade>
    );
}

export default observer(FAP);
