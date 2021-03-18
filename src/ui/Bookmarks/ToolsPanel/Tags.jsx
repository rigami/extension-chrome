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
        maxWidth: 620,
        flexGrow: 1,
    },
    tags: { maxWidth: 600 },
    icon: { margin: theme.spacing(2) },
}));

function TagsSearch({ onResearch }) {
    const classes = useStyles();

    return (
        <Box className={classes.root}>
            <TagIcon className={classes.icon} />
            <Tags
                className={classes.tags}
                usePopper
                onChange={(tags) => onResearch({ tags })}
            />
        </Box>
    );
}

export default TagsSearch;
