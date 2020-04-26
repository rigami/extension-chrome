import React, { useState, useRef } from "preact/compat";
import { h, Component, render, Fragment } from "preact";
import {
    ListItem,
    ListItemText,
    Divider,
    ListItemAvatar,
    Avatar,
} from "@material-ui/core";
import {
    SettingsRounded as SettingsIcon,
    CollectionsRounded as BackgroundsIcon,
    CollectionsBookmarkRounded as BookmarksIcon,
    HelpRounded as AboutIcon,
    BackupRounded as BackupIcon,
} from "@material-ui/icons";

import locale from "i18n/RU";
import Header from "ui/Menu/PageHeader";
import BackgroundsPage from "./Backgrounds";
import AboutPage from "./About";
import AppSettingsPage from "./AppSettings";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    divider: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
}));

const general = [
    {
        title: locale.settings.backgrounds.title,
        description: locale.settings.backgrounds.description,
        icon: BackgroundsIcon,
        id: "backgrounds",
        page: BackgroundsPage,
        color: "#2675F0",
    },
    {
        title: locale.settings.bookmarks.title,
        description: locale.settings.bookmarks.description,
        icon: BookmarksIcon,
        id: "bookmarks",
        color: "#ff4f88",
    },
    {
        title: locale.settings.app.title,
        description: locale.settings.app.description,
        icon: SettingsIcon,
        id: "app",
        page: AppSettingsPage,
        color: "#F88317",
    },
    {
        title: locale.settings.backup.title,
        description: locale.settings.backup.description,
        icon: BackupIcon,
        id: "backup",
        color: "#0f9d58",
    },
];
const additional = [
    {
        title: locale.settings.about.title,
        description: locale.settings.about.description,
        icon: AboutIcon,
        id: "about",
        page: AboutPage,
        color: "#9C27B0",
    },
];

function GeneralMenu({ onSelect, onClose }) {
    const classes = useStyles();

    return (
        <Fragment>
            <Header title={locale.settings.title} onBack={() => onClose()} />
            {general.map((row) => (
                <ListItem
                    key={row.id}
                    button
                    onClick={() => onSelect(row.page)}
                    style={{ width: 520 }}
                    disabled={!row.page}
                >
                    <ListItemAvatar>
                        <Avatar style={{ backgroundColor: row.color }}>
                            {row.icon({})}
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={row.title} secondary={row.description} />
                </ListItem>
            ))}
            <Divider variant="middle" className={classes.divider} />
            {additional.map((row) => (
                <ListItem
                    key={row.id}
                    button
                    onClick={() => onSelect(row.page)}
                    style={{ width: 520 }}
                    disabled={!row.page}
                >
                    <ListItemAvatar>
                        <Avatar style={{ backgroundColor: row.color }}>
                            {row.icon({})}
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={row.title} secondary={row.description} />
                </ListItem>
            ))}
        </Fragment>
    );
}

export default GeneralMenu;