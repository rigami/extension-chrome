import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ACTIVITY } from '@/enum';
import useAppService from '@/stores/app/AppStateProvider';
import Viewer from './Viewer';

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

function BookmarksViewer() {
    const classes = useStyles();
    const appService = useAppService();
    const [show, setShow] = useState(appService.activity === ACTIVITY.BOOKMARKS);

    useEffect(() => {
        if (appService.activity === ACTIVITY.BOOKMARKS) setShow(true);
    }, [appService.activity]);

    if (!show) {
        return (<Box className={classes.root} />);
    }

    return (
        <Viewer />
    );
}

export default observer(BookmarksViewer);
