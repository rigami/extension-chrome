import React, { useEffect, useState } from 'react';
import useService from '@/stores/app/BaseStateProvider';
import { APP_STATE } from '@/stores/app/core';
import { observer } from 'mobx-react-lite';
import FirstLookScreen from '@/ui/InitApp/FirstLookScreen';
import appVariables from '@/config/appVariables';
import packageJson from '../../../package.json';

const STATE = {
    PREPARE: 'PREPARE',
    DONE: 'DONE',
    FIRST_CONTACT: 'FIRST_CONTACT',
};

function InitApp({ children }) {
    const service = useService();
    const [state, setState] = useState(STATE.PREPARE);

    useEffect(() => {
        console.log('INIT APP STATE', service.appState);
        if (service.appState === APP_STATE.WORK) {
            if (state !== STATE.FIRST_CONTACT) setState(STATE.DONE);

            if (
                service.storage.persistent.data?.lastUsageVersion !== packageJson.version
                && appVariables.notifyNewVersion
            ) {
                service.storage.temp.update({ newVersion: true });
            }
        } else if (service.appState === APP_STATE.REQUIRE_SETUP) {
            setState(STATE.FIRST_CONTACT);
        }
    }, [service.appState]);

    console.log('state:', state);

    return (
        <React.Fragment>
            {state === STATE.DONE && children}
            {state === STATE.FIRST_CONTACT && (
                <FirstLookScreen onStart={() => { setState(STATE.DONE); }} />
            )}
        </React.Fragment>
    );
}

export default observer(InitApp);
