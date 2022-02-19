import React from 'react';
import {
    Box,
    Card,
    Divider,
} from '@material-ui/core';
import { alpha, makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import Widgets from './Widgets';
import Greeting from './Greeting';
import { useAppStateService } from '@/stores/app/appState';
import { useCoreService } from '@/stores/app/core';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
        maxWidth: 4 * (theme.shape.dataCard.width + 16) + 24 + 8,
    },
    card: {
        backgroundColor: theme.palette.background.backdropLight,
        padding: theme.spacing(3, 4),
        borderRadius: 24,
    },
    divider: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
}));

function GreetingView() {
    const classes = useStyles();
    const coreService = useCoreService();
    const { widgetsService } = useAppStateService();

    const greeting = coreService.storage.data.userName;
    const date = (
        widgetsService.settings.useTime
        || widgetsService.settings.useDate
        || widgetsService.settings.useWeather
    );

    if (!greeting && !date) return null;

    return (
        <Box className={classes.root}>
            <Card elevation={0} className={classes.card}>
                <Greeting />
                {greeting && date && (<Divider className={classes.divider} />)}
                <Widgets />
            </Card>
        </Box>
    );
}

export default observer(GreetingView);
