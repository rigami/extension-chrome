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
