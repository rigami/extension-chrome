import React from 'react';
import { Card } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({ root: { border: `1px solid ${theme.palette.divider}` } }));

function PopoverCard({ children }) {
    const classes = useStyles();

    return (
        <Card elevation={22} className={classes.root}>
            {children}
        </Card>
    );
}

export default PopoverCard;
