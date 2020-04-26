import React from "preact/compat";
import {h, Component, render, Fragment} from "preact";
import {
    Typography,
} from "@material-ui/core";
import {

} from "@material-ui/icons";

import locale from "i18n/RU";
import PageHeader from "ui/Menu/PageHeader";
import {makeStyles} from "@material-ui/core/styles";
import SettingsRow, {ROWS_TYPE} from "ui/Menu/SettingsRow";
import {inject, observer} from "mobx-react";
import {THEME} from "dict";

import TabNamePage from "./TabName";

const useStyles = makeStyles((theme) => ({
    defaultTabValue: {
        fontStyle: "italic",
        color: theme.palette.text.secondary,
    },
}));

function AppSettings({ appConfigStore, onSelect, onClose}) {
    const classes = useStyles();

    return (
        <Fragment>
            <PageHeader title={locale.settings.app.title} onBack={() => onClose()}/>
            <SettingsRow
                title="Тёмная тема подложки"
                width={520}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    width: 72,
                    checked: appConfigStore.backdropTheme === THEME.DARK,
                    color: "primary",
                    onChange: (event, value) => appConfigStore.setBackdropTheme(value ? THEME.DARK : THEME.LIGHT),
                }}
            />
            <SettingsRow
                title="Тёмная тема оформления приложения"
                width={520}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    width: 72,
                    checked: appConfigStore.theme === THEME.DARK,
                    color: "primary",
                    onChange: (event, value) => appConfigStore.setTheme(value ? THEME.DARK : THEME.LIGHT),
                }}
            />
            <SettingsRow
                title={locale.settings.app.tab_name}
                width={520}
                action={{
                    type: ROWS_TYPE.LINK,
                    onClick: () => onSelect(TabNamePage),
                    component: (
                        <Typography className={!appConfigStore.tabName && classes.defaultTabValue}>
                            {appConfigStore.tabName || "По умолчанию"}
                        </Typography>
                    ),
                }}
            />
        </Fragment>
    );
}

export default inject('appConfigStore')(observer(AppSettings));