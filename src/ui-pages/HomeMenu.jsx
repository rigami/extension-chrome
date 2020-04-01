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
    ArrowBack as BackIcon, Settings as SettingsIcon
} from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles";
import clsx from 'clsx';
import MenuPage from "../ui-components/MenuPage";

const rowsMainMenu = [
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
    {
        title: "О проекте",
        description: "Загрузите фоны или выберите из каталога и установите время и условия для переключения фонов",
        icon: SettingsIcon,
        id: "about"
    },
];

function HomeMenu({ isOpen, onClose, children }) {
    const [selectRow, setSelectRow] = useState(null);

    console.log(children)

    return (
        <Drawer
            anchor="right"
            open={isOpen}
            onClose={() => onClose()}
        >
            <MenuPage
                title='Настройки'
                onBack={() => onClose()}
                rows={[...rowsMainMenu]}
                rowRender={(row, index) => {
                    return (
                        <ListItem
                            button
                            onClick={() => setSelectRow(index)}
                            style={{ width: 520 }}
                        >
                            <ListItemAvatar>
                                <Avatar>
                                    <SettingsIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={row.title} secondary={row.description} />
                        </ListItem>
                    );
                }}
                expandedRowIndex={selectRow}
                renderRowExpanded={(row, index) => {
                    console.log(row);
                    return children(rowsMainMenu[selectRow] && rowsMainMenu[selectRow].id, ()  => setSelectRow(false))
                }} />
        </Drawer>
    );
}

export default HomeMenu;