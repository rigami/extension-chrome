import React, { useEffect, useState } from 'react';
import useService from '@/stores/app/BaseStateProvider';
import { APP_STATE } from '@/stores/app/core';
import { observer } from 'mobx-react-lite';
import FirstLookScreen from '@/ui/FirstLookScreen';
import appVariables from '@/config/appVariables';
import packageJson from '../../../package.json';

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
                if (appVariables.notifyNewVersion) service.storage.updateTemp({ newVersion: true });
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
                    onLoad={() => {
                        service.storage.updatePersistent({ lastUsageVersion: packageJson.version });
                    }}
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
