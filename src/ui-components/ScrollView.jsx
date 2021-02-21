import React, { forwardRef, useEffect, useRef } from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Scrollbar from '@/ui-components/CustomScroll';
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

function ScrollView({ children, value, onScroll, active, classes: externalClassName = {} }, ref) {
    const classes = useStyles();
    const scrollRef = useRef(null);

    const scrollHandler = (now) => {
        const isTop = now.scrollTop === 0;
        const isBottom = now.scrollTop + now.clientHeight === now.contentScrollHeight;

        onScroll({
            isTop,
            isBottom,
            state: now,
        });
    };

    useEffect(() => {
        scrollHandler(scrollRef.current.scrollValues);
    }, [active]);

    return (
        <Box id={value} ref={ref} className={classes.root}>
            <Scrollbar
                onScroll={scrollHandler}
                refScroll={(scrollInstance) => { scrollRef.current = scrollInstance; }}
            >
                <Box className={clsx(classes.contentWrapper, externalClassName.content)}>
                    {children}
                </Box>
            </Scrollbar>
        </Box>
    );
}

export default forwardRef(ScrollView);
