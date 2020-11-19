import { Box } from '@material-ui/core';
import CardLink from '@/ui/Bookmarks/CardLink';
import React from 'react';
import useCoreService from '@/stores/BaseStateProvider';
import { useTheme } from '@material-ui/core/styles';

function BookmarksGrid({ bookmarks }) {
    const theme = useTheme();
    const coreService = useCoreService();

    const columnStabilizer = [...Array.from({ length: coreService.storage.temp.columnsCount }, () => 0)];

    return bookmarks && bookmarks.reduce((acc, curr) => {
        let column = 0;
        columnStabilizer.forEach((element, index) => {
            if (columnStabilizer[column] > element) column = index;
        });

        columnStabilizer[column] += curr.type === 'extend' ? 0.8 : 0.6;
        columnStabilizer[column] += Math.min(
            Math.ceil(curr.name.length / 15),
            2,
        ) * 0.2 || 0.4;
        columnStabilizer[column] += (
            curr.description
            && Math.min(Math.ceil(curr.description.length / 20), 4) * 0.17
        ) || 0;
        columnStabilizer[column] += 0.12;

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
                key={index}
            >
                {column.map((card) => (
                    <CardLink
                        id={card.id}
                        name={card.name}
                        url={card.url}
                        categories={card.categories}
                        icoVariant={card.icoVariant}
                        description={card.description}
                        imageUrl={card.imageUrl}
                        key={card.id}
                        style={{ marginBottom: theme.spacing(2) }}
                    />
                ))}
            </Box>
        ));
}

export default BookmarksGrid;
