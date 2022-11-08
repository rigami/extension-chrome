import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ACTIVITY } from '@/enum';
import { useAppStateService } from '@/stores/app/appState';
import Viewer from './Viewer';

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
        width: '100vw',
        backgroundColor: theme.palette.background.default,
        transform: 'translate3d(0,0,0)',
        display: 'flex',
        flexDirection: 'row',
    },
}));

function BookmarksViewer() {
    const classes = useStyles();
    const appStateService = useAppStateService();
    const [show, setShow] = useState(appStateService.activity === ACTIVITY.BOOKMARKS);

    useEffect(() => {
        console.log('appStateService.activity:', appStateService.activity);
        if (appStateService.activity === ACTIVITY.BOOKMARKS) setShow(true);
    }, [appStateService.activity]);

    if (!show) {
        return (<Box className={classes.root} />);
    }

    return (
        <Viewer />
    );
}

export default observer(BookmarksViewer);
