import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { APP_STATE } from '@/stores/app/core/service';
import MigrateScreen from '@/ui/MigrateScreen';
import packageJson from '@/../package.json';
import { useCoreService } from '@/stores/app/core';

const STATE = {
    PREPARE: 'PREPARE',
    DONE: 'DONE',
    FIRST_CONTACT: 'FIRST_CONTACT',
    MIGRATE: 'MIGRATE',
};

function InitApp({ children }) {
    const coreService = useCoreService();
    const [state, setState] = useState(STATE.PREPARE);

    const checkVersion = () => {
        if (coreService.storage.data?.lastUsageVersion !== packageJson.version) {
            // if (appVariables.notifyNewVersion) coreService.tempStorage.update({ newVersion: true });
            coreService.storage.update({ lastUsageVersion: packageJson.version });
        }
    };

    useEffect(() => {
        console.log('INIT APP STATE', coreService.appState);
        if (coreService.appState === APP_STATE.WORK) {
            checkVersion();
            if (state !== STATE.FIRST_CONTACT) setState(STATE.DONE);
        } else if (coreService.appState === APP_STATE.REQUIRE_SETUP) {
            setState(STATE.FIRST_CONTACT);
        } else if (coreService.appState === APP_STATE.REQUIRE_MIGRATE) {
            setState(STATE.MIGRATE);
        }
    }, [coreService.appState]);

    console.log('state:', state);

    return (
        <React.Fragment>
            {state !== STATE.MIGRATE && children}
            {state === STATE.MIGRATE && (
                <MigrateScreen
                    onStart={() => {
                        checkVersion();
                        setState(STATE.DONE);
                    }}
                />
            )}
        </React.Fragment>
    );
}

export default observer(InitApp);
