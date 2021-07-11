import React from 'react';
import LogoIcon from '@/images/logo-icon.svg';
import LogoText from '@/images/logo-text.svg';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'row',
    },
    appLogoIcon: {
        width: 20,
        height: 20,
        marginRight: theme.spacing(1),
    },
    appLogoText: {
        height: 20,
        width: 'auto',
        fill: theme.palette.type === 'dark' ? theme.palette.common.white : theme.palette.common.black,
    },
}));

function Logo() {
    const classes = useStyles();

    return (
        <Box className={classes.root}>
            <LogoIcon className={classes.appLogoIcon} />
            <LogoText className={classes.appLogoText} />
        </Box>
    );
}

export default Logo;
