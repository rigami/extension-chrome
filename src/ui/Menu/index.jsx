import React, { useState, useEffect } from "preact/compat";
import { h, Component, render, Fragment } from "preact";

import FabMenu from "./FabMenu";
import { Drawer, List } from "@material-ui/core";
import HomePage from "../Settings";

function Menu() {
    const [isOpen, setIsOpen] = useState(false);
    const [stack, setStack] = useState([HomePage]);

    const handleClose = () => {
        setStack([HomePage]);
        setIsOpen(false);
    };

    console.log(stack)

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
                <List disablePadding>
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