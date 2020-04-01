import React, { useState } from "preact/compat";
import { h, Component, render, Fragment } from "preact";

import FabMenu from "./FabMenu";
import HomeMenu from "../ui-pages/HomeMenu";
import {useEffect} from "preact/hooks";

function Menu() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectRow, setSelectRow] = useState(null);

    useEffect(() => {
        if(!isOpen) setSelectRow(null);
    }, [isOpen]);

    return (
        <Fragment>
            <FabMenu
                onOpenMenu={() => setIsOpen(true)}
                onRefreshBackground={() => {}}
            />
            <HomeMenu
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            >{(path, onBack) => {
                console.log(path)
                return (<div>{path}</div>)
            }}</HomeMenu>
        </Fragment>
    );
}

export default Menu;