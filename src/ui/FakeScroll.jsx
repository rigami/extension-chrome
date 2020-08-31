import React, { useRef, useEffect } from 'react';
import { Box } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import useCoreService from '@/stores/BaseStateProvider';

const useStyles = makeStyles(() => ({
    root: {
        width: '100vw',
        position: 'absolute',
        pointerEvents: 'none',
        top: 0,
    },
    desktop: { height: '100vh' },
}));

function FakeScroll({ children }) {
    const classes = useStyles();
    const rootRef = useRef(null);
    const coreService = useCoreService();

    useEffect(() => {
        const listenId = coreService.localEventBus.on('system/scroll', ({ y: offsetY }) => {
            if (rootRef.current) rootRef.current.style.top = `${-offsetY}px`;
        });

        return () => coreService.localEventBus.removeListener(listenId);
    }, []);

    return (
        <Box
            className={classes.root}
            ref={rootRef}
        >
            <Box className={classes.desktop} />
            {children}
            <Box className={classes.desktop} />
        </Box>
    );
}

export default observer(FakeScroll);
