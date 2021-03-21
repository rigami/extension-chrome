import React from 'react';
import { Box } from '@material-ui/core';
import Tags from '@/ui/Bookmarks/Tags';
import { makeStyles } from '@material-ui/core/styles';
import { LabelRounded as TagIcon } from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginLeft: theme.spacing(4),
        maxWidth: 1000,
        flexGrow: 1,
        overflow: 'auto',
    },
    icon: {
        margin: theme.spacing(2),
        marginLeft: 0,
    },
}));

function TagsSearch({ searchRequest, onResearch }) {
    const classes = useStyles();

    return (
        <Box className={classes.root}>
            <TagIcon className={classes.icon} />
            <Tags
                onlyFavorites={searchRequest.onlyFavorites}
                value={searchRequest.tags}
                usePopper
                onChange={(tags) => onResearch({ tags })}
            />
        </Box>
    );
}

export default TagsSearch;
