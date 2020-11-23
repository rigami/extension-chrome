import React, { useEffect, useState } from 'react';
import useService from '@/stores/BaseStateProvider';
import { APP_STATE } from '@/stores/core';
import { observer } from 'mobx-react-lite';
import packageJson from '@/../package.json';
import FirstLookScreen from '../ui/FirstLookScreen';

function InitApp({ children }) {
    const service = useService();
    const [isConfig, setIsConfig] = useState(false);
    const [isFirstContact, setIsFirstContact] = useState(false);

    useEffect(() => {
        console.log('INIT APP STATE', service.appState);
        if (service.appState === APP_STATE.WORK) {
            setIsConfig(true);
            if (
                service.storage.persistent.lastUsageVersion
                && service.storage.persistent.lastUsageVersion !== packageJson.version
            ) {
                service.storage.updateTemp({ newVersion: true });
                service.storage.updatePersistent({ lastUsageVersion: packageJson.version });
            }
        } else if (service.appState === APP_STATE.REQUIRE_SETUP) {
            setIsFirstContact(true);
        }
    }, [service.appState]);

    return (
        <React.Fragment>
            {isConfig && !isFirstContact && children}
            {isFirstContact && (
                <FirstLookScreen
                    onStart={() => {
                        setIsConfig(true);
                        setIsFirstContact(false);
                        service.storage.updatePersistent({ lastUsageVersion: packageJson.version });
                    }}
                />
            )}
        </React.Fragment>
    );
}

export default observer(InitApp);
