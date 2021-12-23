import React, { Fragment } from 'react';
import {
    Box, Card, Divider, Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { StarRounded as CheckIcon } from '@material-ui/icons';
import Favorites from '../Favorites';
import Widgets from './Widgets';
import Greeting from './Greeting';

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
        backgroundColor: '#FBFBFB',
        padding: theme.spacing(2, 3),
    },
    divider: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
}));

function GreetingView() {
    const classes = useStyles();

    console.log('[GreetingView]', [
        (<Greeting />),
        (<Widgets />),
    ].filter((isExist) => isExist))

    return (
        <Box className={classes.root}>
            <Card elevation={0} className={classes.card}>
                {[
                    (<Greeting />),
                    (<Widgets />),
                ].filter((isExist) => isExist).map((child, index) => (
                    <Fragment>
                        {index !== 0 && (<Divider className={classes.divider} />)}
                        {child}
                    </Fragment>
                ))}
            </Card>
        </Box>
    );
}

export default observer(GreetingView);
