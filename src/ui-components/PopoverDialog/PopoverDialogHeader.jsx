import React from 'react';
import { CardHeader, Divider } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: { padding: theme.spacing(1, 2) },
    title: { fontSize: '0.9rem' },
}));

function PopoverDialogHeader({ ...props }) {
    const classes = useStyles();

    return (
        <React.Fragment>
            <CardHeader
                {...props}
                className={classes.root}
                classes={{ title: classes.title }}
            />
            <Divider />
        </React.Fragment>
    );
}

export default PopoverDialogHeader;
