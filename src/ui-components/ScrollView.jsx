import React, { forwardRef } from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles(() => ({
    root: {
        height: '100vh',
        width: '100vw',
    },
    contentWrapper: {
        minHeight: '100vh',
        width: '100vw',
    },
}));

function ScrollView(props, ref) {
    const {
        children,
        value,
        active,
        onScroll,
        onTryScrollCallback,
        classes: externalClassName = {},
    } = props;
    const classes = useStyles();

    return (
        <Box id={value} ref={ref} className={classes.root}>
            <Box className={clsx(classes.contentWrapper, externalClassName.content)}>
                {React.cloneElement(children, {
                    active,
                    onScroll,
                    onTryScrollCallback,
                })}
            </Box>
        </Box>
    );
}

export default forwardRef(ScrollView);
