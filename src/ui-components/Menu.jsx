import React, { useState, useRef } from "preact/compat";
import { h, Component, render, Fragment } from "preact";
import {
    List,
    ListItem,
    ListItemText,
    Divider,
    Drawer,
    ListItemIcon,
    ListItemAvatar,
    Avatar,
    IconButton,
    Collapse,
    Box
} from "@material-ui/core";
import {
    Refresh as RefreshIcon,
    Settings as SettingsIcon,
    ArrowBack as BackIcon
} from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles";
import CategoryWrapper from "./CategoryWrapper";
import clsx from 'clsx';

const menuConfig = [
    [
        {
            title: "Фон и настройка переключения",
            description: "Загрузите фоны или выберите из каталога и установите время и условия для переключения фонов",
            icon: SettingsIcon,
            id: "backgrounds"
        },
        {
            title: "Закладки и меню быстрого доступа",
            description: "Загрузите фоны или выберите из каталога и установите время и условия для переключения фонов",
            icon: SettingsIcon,
            id: "bookmarks"
        },
    ],
    [
        {
            title: "О проекте",
            description: "Загрузите фоны или выберите из каталога и установите время и условия для переключения фонов",
            icon: SettingsIcon,
            id: "about"
        }
    ]
];

const useStyles = makeStyles(theme => ({
    root: {
        position: 'absolute',
        borderRadius: theme.spacing(3),
        padding: theme.spacing(.5),
        bottom: theme.spacing(3),
        right: theme.spacing(3),
    },
    list: {
        width: '520px'
    },
    header: {

    },
    backButton: {
        padding: theme.spacing(1)
    },
    category: {
        height: '100vh'
    }
}));

function Menu({ isOpen, onClose }) {
    const classes = useStyles();
    const collapseRef = useRef(null);
    const [openCategory, setOpenCategory] = useState(null);

    console.log(collapseRef)

    return (
        <Drawer
            anchor="right"
            open={isOpen}
            onClose={() => onClose()}
        >
            <List className={classes.list}>
                <ListItem className={clsx(classes.row, classes.header)}>
                    <ListItemIcon>
                        <IconButton className={classes.backButton} onClick={() => onClose()}>
                            <BackIcon />
                        </IconButton>
                    </ListItemIcon>
                    <ListItemText primary='Настройки' />
                </ListItem>
                {menuConfig.map((category, index) => (
                    <Fragment>
                        {!!index && <Divider variant='middle' />}
                        {category.map((item) => (
                            <CategoryWrapper
                                key={item.category}
                                isOpen={openCategory === item.id}
                                onOpen={() => setOpenCategory(item.id)}
                                onClose={() => setOpenCategory(null)}
                                category={item}
                            >
                                {item.title}
                            </CategoryWrapper>
                        ))}
                    </Fragment>
                ))}
            </List>
        </Drawer>
    );
}

export default Menu;