import React, { useState, useEffect } from "preact/compat";
import { h, Component, render, Fragment } from "preact";

import FabMenu from "./FabMenu";
import {DialogContentText, Drawer, List} from "@material-ui/core";
import HomePage from "../Settings";
import {makeStyles} from "@material-ui/core/styles";
import {useSnackbar} from "notistack";

const useStyles = makeStyles((theme) => ({
    list: {
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
}));

function Menu() {
    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar();
    const [isOpen, setIsOpen] = useState(false);
    const [stack, setStack] = useState([HomePage]);

    const handleClose = () => {
        setStack([HomePage]);
        setIsOpen(false);
    };

    useEffect(() => {
        /*enqueueSnackbar({
            message: 'Загрузка фонов',
            description: '0%',
            variant: 'progress',
            progressEffect: (updateValue, updateDescription) => {
                let progress = 0;

                const timer = setInterval(() => {
                    progress = progress >= 100 ? 0 : progress + 0.2;
                    updateValue(progress);
                    updateDescription(Math.round(progress)+'%');
                }, 20);

                return () => clearInterval(timer);
            },
        }, {
            persist: true,
        });


        chrome.notifications.create("test", {
            type: "basic",
            iconUrl: "resource/64x64.png",
            title: "test",
            message: "Test message",
            buttons: [
                { title: "Button 1" },
                { title: "Button 2" },
            ],
            contextMessage: "contextMessage, contextMessage - contextMessage. contextMessage!",
        });

        chrome.notifications.create("test2", {
            type: "progress",
            iconUrl: "resource/64x64.png",
            title: "test",
            message: "Test progress message",
            progress: 75,
            requireInteraction: true,
            silent: true,
        });*/
    }, []);

    return (
        <Fragment>
            <FabMenu
                onOpenMenu={() => setIsOpen(true)}
                onRefreshBackground={() => {}}
            />
            <Drawer
                anchor="right"
                open={isOpen}
                onClose={() => handleClose()}

            >
                <List disablePadding className={classes.list}>
                    {stack[stack.length - 1]({
                        onClose: () => {
                            if (stack.length === 1) {
                                handleClose();
                            } else {
                                setStack(stack.slice(0, stack.length - 1));
                            }
                        },
                        onSelect: (page) => setStack([...stack, page]),
                    })}
                </List>
            </Drawer>
        </Fragment>
    );
}

export default Menu;