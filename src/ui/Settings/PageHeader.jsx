import React, { memo } from 'react';
import {
    IconButton,
    AppBar,
    Toolbar,
    Typography, Breadcrumbs,
} from '@material-ui/core';
import { ArrowBackRounded as BackIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { alpha } from '@material-ui/core/styles/colorManipulator';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        borderTopLeftRadius: theme.shape.borderRadius,
        borderTopRightRadius: theme.shape.borderRadius,
    },
    toolbar: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    },
    backButton: {
        padding: theme.spacing(1),
        marginRight: theme.spacing(2),
        color: theme.palette.getContrastText(theme.palette.background.paper),
    },
    title: {
        fontSize: '22px',
        fontWeight: 800,
        flexShrink: 0,
        marginLeft: 40 + theme.spacing(2),
    },
    actions: {
        marginLeft: theme.spacing(4),
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        display: 'flex',
        flexDirection: 'row',
    },
    grow: { flexGrow: 1 },
}));

function PageHeader(props) {
    const {
        title,
        stack,
        onBack,
        className: externalClassName,
        ...other
    } = props;
    const classes = useStyles();
    const { t } = useTranslation(['settings']);

    console.log('stack:', stack);

    return (
        <AppBar
            position="static"
            color="transparent"
            elevation={0}
            className={clsx(classes.root, externalClassName)}
            {...other}
        >
            <Toolbar className={classes.toolbar}>
                <IconButton
                    data-ui-path="settings.back"
                    className={classes.backButton}
                    onClick={() => onBack()}
                >
                    <BackIcon />
                </IconButton>
                <Typography className={clsx(!onBack && classes.title)} variant="h6" noWrap>{t(stack[0].header.title)}</Typography>
                <div className={classes.grow} />
            </Toolbar>
        </AppBar>
    );
}

export default memo(PageHeader);
