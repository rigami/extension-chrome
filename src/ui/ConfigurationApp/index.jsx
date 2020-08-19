import React, { useEffect, useState } from 'react';
import ConfigStores from '@/utils/configStores';
import i18n from 'i18next';
import FirstLookScreen from './FirstLookScreen';

function ConfigurationApp({ children }) {
    const [isConfig, setIsConfig] = useState(false);
    const [isFirstContact, setIsFirstContact] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        ConfigStores.config()
            .then(() => {
                setIsConfig(true);
            })
            .catch(() => {
                document.title = i18n.t('tabName.prepare');
                console.error('Error config app. Perhaps first start. Setup data');
                setIsFirstContact(true);

                return ConfigStores.setup((progressValue) => setProgress(progressValue))
                    .then(() => {
                        setTimeout(() => setIsConfig(true), 1200);
                    });
            });

        if (PRODUCTION_MODE) {
            window.oncontextmenu = (event) => {
                event.preventDefault();
            };
        }
    }, []);

    return (
        <React.Fragment>
            {isConfig && !isFirstContact && children}
            {isFirstContact && (
                <FirstLookScreen
                    isConfig={isConfig}
                    progress={progress}
                    onStart={() => setIsFirstContact(false)}
                />
            )}
        </React.Fragment>
    );
}

export default ConfigurationApp;
