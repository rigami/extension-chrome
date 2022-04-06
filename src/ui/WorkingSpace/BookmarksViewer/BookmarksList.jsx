import React, { Fragment, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Divider } from '@material-ui/core';
import clsx from 'clsx';
import RowItem from '@/ui/WorkingSpace/Bookmark/Row';

const useStyles = makeStyles((theme) => ({
    root: {
        padding: 0,
        margin: 0,
    },
    divider: {
        opacity: 1,
        margin: theme.spacing(0.5, 0),
    },
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

    return (
        <ul className={clsx(classes.root, externalClasses.root, externalClassName)}>
            {bookmarks.slice(0, max).map((bookmark, index) => (
                <Fragment key={bookmark.id}>
                    {index !== 0 && (
                        <Divider
                            variant="middle"
                            className={classes.divider}
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
                        className={externalClasses.rowItem}
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
