import React, { memo } from 'react';
import { ListSubheader } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    root: {
        paddingTop: theme.spacing(2),
        fontSize: '22px',
        fontWeight: 800,
    },
    h1: {},
    h2: {
        fontSize: '16px',
        fontWeight: 800,
    },
}));

function SectionHeader({ title, h = 1 }) {
    const classes = useStyles();

    return (
        <ListSubheader inset className={clsx(classes.root, classes[`h${h}`])} disableSticky>
            {title}
        </ListSubheader>
    );
}

export default memo(SectionHeader);
