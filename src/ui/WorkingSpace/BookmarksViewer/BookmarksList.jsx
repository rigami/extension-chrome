import React, { Fragment, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Divider } from '@material-ui/core';
import clsx from 'clsx';
import RowItem from '@/ui/WorkingSpace/Bookmark/Row';

const useStyles = makeStyles((theme) => ({
    root: {
        padding: 0,
        margin: 0,
    },
    goToButton: {
        textTransform: 'none',
        color: theme.palette.secondary.main,
        fontWeight: 800,
    },
    bookmarksGrid: {
        margin: theme.spacing(0, 2),
        marginBottom: theme.spacing(2),
        maxHeight: (theme.shape.dataCard.height + theme.spacing(2)) * 3,
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1, 2),
    },
    countResults: {
        color: theme.palette.text.secondary,
        marginLeft: 'auto',
        flexShrink: 0,
    },
    stub: { padding: theme.spacing(2) },
    folderBreadcrumbs: { overflow: 'auto' },
    divider: {
        opacity: 1,
        transition: theme.transitions.create(['opacity'], {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeInOut,
        }),
    },
    hide: { opacity: 0 },
}));

function BookmarksList(props) {
    const classes = useStyles();
    const {
        bookmarks,
        max = Infinity,
        classes: externalClasses = {},
        className: externalClassName,
        overloadContent,
    } = props;
    const [hoverIndex, setHoverIndex] = useState(null);

    return (
        <ul className={clsx(classes.root, externalClasses.root, externalClassName)}>
            {bookmarks.slice(0, max).map((bookmark, index) => (
                <Fragment key={bookmark.id}>
                    {index !== 0 && (
                        <Divider
                            variant="middle"
                            className={clsx(
                                classes.divider,
                                hoverIndex !== null && (hoverIndex === index || hoverIndex + 1 === index) && classes.hide,
                            )}
                        />
                    )}
                    <RowItem
                        id={bookmark.id}
                        name={bookmark.name}
                        url={bookmark.url}
                        tags={bookmark.tags}
                        tagsFull={bookmark.tagsFull}
                        icoVariant={bookmark.icoVariant}
                        description={bookmark.description}
                        icoUrl={bookmark.icoUrl}
                        onMouseEnter={() => { setHoverIndex(index); }}
                        onMouseLeave={() => { setHoverIndex(null); }}
                    />
                </Fragment>
            ))}
            {
                overloadContent
                && (bookmarks.length > max)
                && overloadContent(Math.min(bookmarks.length, max))
            }
        </ul>
    );
}

export default BookmarksList;
