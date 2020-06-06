import React, { memo } from 'react';
import { ListSubheader } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        paddingTop: theme.spacing(2),
        fontSize: '22px',
        fontWeight: 800,
    },
}));

function SectionHeader({ title }) {
    const classes = useStyles();

    return (
        <ListSubheader inset className={classes.root}>
            {title}
        </ListSubheader>
    );
}

export default memo(SectionHeader);
