import React, { memo } from 'react';
import { Box } from '@material-ui/core';
import CardLink from '@/ui/Bookmarks/CardLink';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { BKMS_VARIANT } from '@/enum';
import hash from 'object-hash';
import clsx from 'clsx';

const useStyles = makeStyles(() => ({
    root: { width: '100%' },
    bookmarks: { display: 'flex' },
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
    const columnStabilizer = [...Array.from({ length: columns }, () => 0)];
    let renderCount = 0;

    return (
        <Box className={clsx(classes.root, externalClasses.root)}>
            <Box
                key={`${bookmarks.length}-${columns}`}
                display="flex"
                className={clsx(classes.bookmarks, externalClasses.bookmarks)}
            >
                {bookmarks && bookmarks.reduce((acc, curr) => {
                    let column = 0;
                    columnStabilizer.forEach((element, index) => {
                        if (
                            columnStabilizer[column] > element
                            && element < maxRows
                        ) column = index;
                    });

                    if (columnStabilizer[column] >= maxRows) return acc;

                    columnStabilizer[column] += curr.icoVariant === BKMS_VARIANT.POSTER ? 2 : 1;
                    columnStabilizer[column] += curr.description ? 1 : 0;
                    renderCount += 1;

                    if (typeof acc[column] === 'undefined') acc[column] = [];

                    acc[column].push(curr);

                    return acc;
                }, [])
                    .map((column, index, arr) => (
                        <Box
                            style={{
                                marginRight: theme.spacing(
                                    arr.length - 1 !== index ? 2 : 0,
                                ),
                            }}
                            key={hash(column)}
                        >
                            {column.map((card) => (
                                <CardLink
                                    id={card.id}
                                    name={card.name}
                                    url={card.url}
                                    tags={card.tags}
                                    icoVariant={card.icoVariant}
                                    description={card.description}
                                    icoUrl={card.icoUrl}
                                    key={card.id}
                                    style={{ marginBottom: theme.spacing(2) }}
                                />
                            ))}
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
