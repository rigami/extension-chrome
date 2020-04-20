import React, {useEffect, useState} from "preact/compat";
import { h, Component, render, Fragment } from "preact";
import { CssBaseline, Typography } from "@material-ui/core";
import { Provider } from 'mobx-react';
import { SnackbarProvider } from 'notistack';
import ConfigStores from "../utils/configStores";
import BackgroundsStore from "stores/backgrounds";

function ConfigurationApp({ children }) {

    const [isConfig, setIsConfig] = useState(false);
    const [stores, setStores] = useState(null);

    useEffect(() => {
        ConfigStores.config()
            .then(() => {
                setIsConfig(true);
                setStores({
                    backgroundsStore: new BackgroundsStore(),
                });
            })
            .catch((e) => console.error("Error config app:", e));
    }, []);

    return (
        <Fragment>
            {isConfig && children(stores)}
        </Fragment>
    );
}

export default ConfigurationApp;