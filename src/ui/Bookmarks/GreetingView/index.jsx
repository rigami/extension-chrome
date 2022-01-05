import React from 'react';
import {
    Box,
    Card,
    Divider,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import Widgets from './Widgets';
import Greeting from './Greeting';
import useAppService from '@/stores/app/AppStateProvider';
import useCoreService from '@/stores/app/BaseStateProvider';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
        maxWidth: 4 * (theme.shape.dataCard.width + 16) + 24 + 8,
        paddingTop: theme.spacing(7),
        paddingRight: theme.spacing(3),
    },
    card: {
        backgroundColor: theme.palette.background.backdropLight,
        padding: theme.spacing(2, 3),
    },
    divider: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
}));

function GreetingView() {
    const classes = useStyles();
    const coreService = useCoreService();
    const { widgets } = useAppService();

    const greeting = coreService.storage.persistent.data.userName;
    const date = widgets.settings.dtwUseTime || widgets.settings.dtwUseDate || widgets.settings.dtwUseWeather;

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
