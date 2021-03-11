import React from 'react';
import { Box } from '@material-ui/core';
import Categories from '@/ui/Bookmarks/Categories';
import { makeStyles } from '@material-ui/core/styles';
import { LabelRounded as TagIcon } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        marginLeft: theme.spacing(4),
        maxWidth: 620,
        flexGrow: 1,
    },
    categories: { maxWidth: 600 },
    icon: { margin: theme.spacing(2) },
}));

function Tags({ onResearch }) {
    const classes = useStyles();

    return (
        <Box className={classes.root}>
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
