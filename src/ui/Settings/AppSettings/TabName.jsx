import React from "preact/compat";
import {h, Component, render, Fragment} from "preact";
import {
    TextField,
    Box,
    Button,
    SvgIcon,
    Typography,
} from "@material-ui/core";
import {} from "@material-ui/icons";

import locale from "i18n/RU";
import PageHeader from "ui/Menu/PageHeader";
import {makeStyles} from "@material-ui/core/styles";
import SettingsRow, {ROWS_TYPE} from "ui/Menu/SettingsRow";
import {inject, observer} from "mobx-react";
import {THEME} from "dict";
import TabNameExampleImage from "images/tabName.svg";

const useStyles = makeStyles((theme) => ({
    row: {
        width: 520,
        padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
    },
    splash: {
        position: "relative",
        overflow: "hidden",
        marginBottom: theme.spacing(2),
    },
    siteName: {
        position: "absolute",
        width: 216,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    }
}));

function TabName({appConfigStore, onSelect, onClose}) {
    const classes = useStyles();

    return (
        <Fragment>
            <PageHeader title={locale.settings.app.tab_name} onBack={() => onClose()}/>
            <Box className={classes.splash}>
                <TabNameExampleImage/>
                <span
                    style={{left: -29, top: 97}}
                    className={classes.siteName}
                >
                    Danilkinkin
                </span>
                <span
                    style={{left: 151, top: 97}}
                    className={classes.siteName}
                >
                    {appConfigStore.tabName}
                </span>
            </Box>
            <Box className={classes.row}>
                <Typography>
                    Отображаемое название вкладки
                </Typography>
            </Box>
            <Box className={classes.row}>
                <TextField
                    variant="outlined"
                    fullWidth
                    placeholder="Пустое название вкладки"
                    defaultValue={appConfigStore.tabName}
                    onChange={(event) => appConfigStore.setTabName(event.target.value)}
                />
            </Box>
        </Fragment>
    );
}

export default inject('appConfigStore')(observer(TabName));