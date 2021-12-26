import React, { memo } from 'react';
import { Box } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import clsx from 'clsx';
import { BKMS_VARIANT } from '@/enum';
import CardLink from '@/ui/Bookmarks/CardLink';

const useStyles = makeStyles((theme) => ({
    root: { width: '100%' },
    bookmarks: {
        display: 'flex',
        position: 'relative',
        transition: theme.transitions.create(['height'], {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeInOut,
        }),
    },
    bookmark: {
        position: 'absolute',
        transition: theme.transitions.create(['left', 'top'], {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeInOut,
        }),
    },
}));

function BookmarksGrid(props) {
    const classes = useStyles();
    const {
        bookmarks,
        columns,
        maxRows = Infinity,
        classes: externalClasses = {},
        overloadContent,
    } = props;
    const theme = useTheme();
    const columnStabilizer = Array.from({ length: columns }, () => 0);
    let renderCount = 0;
    const bookmarksGrid = {};
    let maxHeight = 0;

    (bookmarks || []).forEach((curr) => {
        let column = 0;
        columnStabilizer.forEach((element, index) => {
            if (
                columnStabilizer[column] > element
                && element < maxRows
            ) column = index;
        });

        if (columnStabilizer[column] >= maxRows) return;

        bookmarksGrid[curr.id] = {
            left: column * (theme.shape.dataCard.width + theme.spacing(2)),
            top: columnStabilizer[column] * (theme.shape.dataCard.height + theme.spacing(2)),
        };

        columnStabilizer[column] += curr.icoVariant === BKMS_VARIANT.POSTER ? 2 : 1;
        columnStabilizer[column] += curr.description ? 1 : 0;
        renderCount += 1;

        const currHeight = Math.max(
            columnStabilizer[column] * (theme.shape.dataCard.height + theme.spacing(2)) - theme.spacing(2),
            0,
        );

        maxHeight = currHeight > maxHeight ? currHeight : maxHeight;
    }, []);

    return (
        <Box className={clsx(classes.root, externalClasses.root)}>
            <Box
                style={{ height: maxHeight }}
                className={clsx(classes.bookmarks, externalClasses.bookmarks)}
            >
                {bookmarks.map((bookmark) => (
                    <Box
                        key={bookmark.id}
                        className={classes.bookmark}
                        style={{
                            left: bookmarksGrid[bookmark.id].left,
                            top: bookmarksGrid[bookmark.id].top,
                        }}
                    >
                        <CardLink
                            id={bookmark.id}
                            name={bookmark.name}
                            url={bookmark.url}
                            tags={bookmark.tags}
                            tagsFull={bookmark.tagsFull}
                            icoVariant={bookmark.icoVariant}
                            description={bookmark.description}
                            icoUrl={bookmark.icoUrl}
                        />
                    </Box>
                ))}
            </Box>
            {
                overloadContent
                && (bookmarks.length - renderCount > 0)
                && overloadContent(bookmarks.length - renderCount)
            }
        </Box>
    );
}

export default memo(BookmarksGrid);
