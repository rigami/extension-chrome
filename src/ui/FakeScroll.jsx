import React, { useRef, useEffect } from 'react';
import { Box } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { useService as useAppService } from '@/stores/app';

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100vw',
        position: 'absolute',
        pointerEvents: 'none',
        top: 0,
    },
    desktop: {
        height: '100vh',
    },
}));

function FakeScroll({ children }) {
    const classes = useStyles();
    const rootRef = useRef(null);
    const appService = useAppService();

    useEffect(() => {
        const listenId = appService.eventBus.on('scroll', ({ y: offsetY }) => {
            if (rootRef.current) rootRef.current.style.top = `${-offsetY}px`;
        });

        return () => appService.eventBus.removeListener(listenId);
    }, []);

    return (
        <Box
            className={classes.root}
            ref={rootRef}
        >
            <Box className={classes.desktop}/>
            {children}
            <Box className={classes.desktop}/>
        </Box>
    );
}

export default observer(FakeScroll);
