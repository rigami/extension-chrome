import React, { memo } from 'react';
import { ListSubheader } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    root: {
        paddingLeft: theme.spacing(4),
        paddingTop: theme.spacing(1),
        fontSize: '22px',
        fontWeight: 800,
    },
    h1: {},
    h2: {
        fontSize: '16px',
        fontWeight: 800,
    },
    content: {
        display: 'inline-flex',
        verticalAlign: 'middle',
        marginLeft: theme.spacing(2),
    },
}));

function SectionHeader({ title, h = 1, content }) {
    const classes = useStyles();

    return (
        <ListSubheader className={clsx(classes.root, classes[`h${h}`])} disableSticky>
            {title}
            {content && (
                <div className={classes.content}>
                    {content}
                </div>
            )}
        </ListSubheader>
    );
}

export default memo(SectionHeader);
