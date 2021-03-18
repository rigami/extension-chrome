import { Box } from '@material-ui/core';
import CardLink from '@/ui/Bookmarks/CardLink';
import React from 'react';
import { useTheme } from '@material-ui/core/styles';
import { BKMS_VARIANT } from '@/enum';

function BookmarksGrid({ bookmarks, columns, renderCard }) {
    const theme = useTheme();
    const columnStabilizer = [...Array.from({ length: columns }, () => 0)];

    const render = renderCard || ((card) => (
        <CardLink
            id={card.id}
            name={card.name}
            url={card.url}
            tags={card.tags}
            icoVariant={card.icoVariant}
            description={card.description}
            imageUrl={card.imageUrl}
            key={card.id}
            style={{ marginBottom: theme.spacing(2) }}
        />
    ));

    return bookmarks && bookmarks.reduce((acc, curr) => {
        let column = 0;
        columnStabilizer.forEach((element, index) => {
            if (columnStabilizer[column] > element) column = index;
        });

        columnStabilizer[column] += curr.variant === BKMS_VARIANT.POSTER ? 2 : 1;
        columnStabilizer[column] += curr.description ? 1 : 0;

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
                key={`column-${column.length}`}
            >
                {column.map((card) => render({
                    ...card,
                    style: { marginBottom: theme.spacing(2) },
                }))}
            </Box>
        ));
}

export default BookmarksGrid;
