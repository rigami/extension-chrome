import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { StarRounded as CheckIcon } from '@material-ui/icons';
import Favorites from './Favorites';
import Widgets from './Widgets';
import Greeting from './Greeting';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    },
    sidebar: {},
    widgetContainer: { margin: theme.spacing(1.5, 0) },
    favoritesContainer: { maxWidth: 1000 },
    header: {
        display: 'flex',
        flexDirection: 'row',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    icon: {
        color: theme.palette.favorite.main,
        width: 22,
        height: 22,
        marginRight: theme.spacing(1),
    },
}));

function GreetingView({ searchService: service }) {
    const classes = useStyles();
    const { t } = useTranslation();

    return (
        <Box className={classes.root}>
            {/* <Greeting />
                <Widgets className={classes.widgetContainer} /> */}
            <Box className={classes.header}>
                <CheckIcon className={classes.icon} />
                <Typography>{t('bookmark:button.favorites')}</Typography>
            </Box>
            <Favorites className={classes.favoritesContainer} />
        </Box>
    );
}

export default observer(GreetingView);
