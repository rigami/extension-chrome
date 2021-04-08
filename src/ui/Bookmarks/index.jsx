import React, { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ACTIVITY } from '@/enum';
import useAppService from '@/stores/app/AppStateProvider';

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
        width: '100vw',
        backgroundColor: theme.palette.background.paper,
        transform: 'translate3d(0,0,0)',
        display: 'flex',
        flexDirection: 'row',
    },
}));

function EditBookmarkModal() {
    const classes = useStyles();
    const appService = useAppService();
    const [isLoad, setIsLoad] = useState(false);
    const viewer = useRef(null);

    const handleLoad = async () => {
        setIsLoad(true);

        viewer.current = (await import('./Viewer')).default;
        setIsLoad(false);
    };

    useEffect(() => {
        if (appService.activity === ACTIVITY.BOOKMARKS && !viewer.current) handleLoad();
    }, [appService.activity]);

    if (isLoad || !viewer.current) {
        return (<Box className={classes.root} />);
    }

    return (
        <viewer.current />
    );
}

export default observer(EditBookmarkModal);
