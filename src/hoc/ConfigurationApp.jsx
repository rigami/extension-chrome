import React, {useEffect, useState} from "preact/compat";
import { h, Component, render, Fragment } from "preact";
import { LinearProgress, Fade } from "@material-ui/core";
import ConfigStores from "utils/configStores";
import BackgroundsStore from "stores/backgrounds";
import AppConfigStore from "stores/app";

import FullscreenStub from "ui-components/FullscreenStub";

function ConfigurationApp({ children }) {

    const [isConfig, setIsConfig] = useState(false);
    const [isFirstContact, setIsFirstContact] = useState(false);
    const [progress, setProgress] = useState(0);
    const [stores, setStores] = useState(null);

    const initStores = () => {
        document.title = localStorage.getItem("app_tab_name") || "\u200E";
        setStores({
            backgroundsStore: new BackgroundsStore(),
            appConfigStore: new AppConfigStore(),
        });
    };

    useEffect(() => {
        ConfigStores.config()
            .then(() => {
                setIsConfig(true);
                initStores();
            })
            .catch((e) => {
                console.error("Error config app. Perhaps first start. Setup data");
                setIsFirstContact(true);

                return ConfigStores.setup((progressValue) => setProgress(progressValue))
                    .then(() => {
                        initStores();
                        setTimeout(() => setIsConfig(true), 1200);
                    });
            });
    }, []);

    return (
        <Fragment>
            {isConfig && !isFirstContact && children(stores)}
            {isFirstContact && (
                <Fragment>
                    <Fade in={!isConfig}>
                        <FullscreenStub
                            message="Идет подготовка расширения"
                            description="Подождите пожалуйста..."
                            style={{height: "100vh"}}
                        >
                            <LinearProgress variant="determinate" style={{ width: 240 }} value={progress} />
                        </FullscreenStub>
                    </Fade>
                    <Fade in={isConfig}>
                        <FullscreenStub
                            message="Все готово!"
                            description="Расширение готово к работе"
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                height: "100vh",
                                width: "100vw",

                            }}
                            actions={[
                                {
                                    title: "Продолжить",
                                    color: "primary",
                                    variant: "contained",
                                    onClick: () => setIsFirstContact(false),
                                }
                            ]}
                        >

                        </FullscreenStub>
                    </Fade>
                </Fragment>
            )}
        </Fragment>
    );
}

export default ConfigurationApp;