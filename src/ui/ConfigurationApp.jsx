import React, { useEffect, useState } from 'react';
import { LinearProgress, Fade } from '@material-ui/core';
import ConfigStores from '@/utils/configStores';
import FullscreenStub from '@/ui-components/FullscreenStub';
import { useTranslation } from 'react-i18next';

function ConfigurationApp({ children }) {
    const { t } = useTranslation();
    const [isConfig, setIsConfig] = useState(false);
    const [isFirstContact, setIsFirstContact] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        ConfigStores.config()
            .then(() => {
                setIsConfig(true);
            })
            .catch(() => {
                document.title = t("tabName.prepare");
                console.error('Error config app. Perhaps first start. Setup data');
                setIsFirstContact(true);

                return ConfigStores.setup((progressValue) => setProgress(progressValue))
                    .then(() => {
                        setTimeout(() => setIsConfig(true), 1200);
                    });
            });


        if (localStorage.getItem('mode') !== 'development') {
            window.oncontextmenu = (event) => {
                event.preventDefault();
            };
        }
    }, []);

    return (
        <React.Fragment>
            {isConfig && !isFirstContact && children}
            {isFirstContact && (
                <React.Fragment>
                    <Fade in={!isConfig}>
                        <FullscreenStub
                            message={t("firstView.prepareApp")}
                            description={t("firstView.pleaseWait")}
                            style={{ height: '100vh' }}
                        >
                            <LinearProgress variant="determinate" style={{ width: 240 }} value={progress} />
                        </FullscreenStub>
                    </Fade>
                    <Fade in={isConfig}>
                        <FullscreenStub
                            message={t("firstView.allDone")}
                            description={t("firstView.prepareAppDoneDescription")}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                height: '100vh',
                                width: '100vw',

                            }}
                            actions={[
                                {
                                    title: t("firstView.continue"),
                                    color: 'primary',
                                    variant: 'contained',
                                    onClick: () => setIsFirstContact(false),
                                },
                            ]}
                        />
                    </Fade>
                </React.Fragment>
            )}
        </React.Fragment>
    );
}

// ConfigurationApp.propTypes = { children: PropTypes.element };
// ConfigurationApp.defaultProps = { children: null };

export default ConfigurationApp;
