import React from 'react';
import { Box } from '@material-ui/core';
import Categories from '@/ui/Bookmarks/Categories';
import { makeStyles } from '@material-ui/core/styles';
import { LabelRounded as TagIcon } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
    categories: { maxWidth: 600 },
    icon: { margin: theme.spacing(2) },
}));

function Tags({ onResearch }) {
    const classes = useStyles();

    return (
        <Box display="flex" alignItems="center" ml={4}>
            <TagIcon className={classes.icon} />
            <Categories
                className={classes.categories}
                usePopper
                onChange={(tags) => onResearch({ tags })}
            />
        </Box>
    );
}

export default Tags;
