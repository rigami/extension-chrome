import React, { useEffect, useState } from 'react';
import useBaseStateService from '@/stores/app/BaseStateProvider';
import { APP_STATE } from '@/stores/app/core';
import { observer } from 'mobx-react-lite';
import FirstLookScreen from '@/ui/FirstLookScreen';
import appVariables from '@/config/appVariables';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import useAppService from '@/stores/app/AppStateProvider';
import MigrateScreen from '@/ui/MigrateScreen';
import packageJson from '@/../package.json';

const STATE = {
    PREPARE: 'PREPARE',
    DONE: 'DONE',
    FIRST_CONTACT: 'FIRST_CONTACT',
    MIGRATE: 'MIGRATE',
};

function ApplyWizardSettingsProvider({ children }) {
    const coreService = useBaseStateService();
    const bookmarksService = useBookmarksService();
    const appService = useAppService();
    const { widgets } = appService;

    const { wizardSettings } = coreService.storage.persistent.data;

    if (!wizardSettings) return children;

    coreService.storage.persistent.update({
        wizardSettings: null,
        userName: wizardSettings.userName,
    });
    if (BUILD === 'full') {
        bookmarksService.settings.update({ fapStyle: wizardSettings.fapStyle });
    }
    widgets.settings.update({
        dtwUseDate: wizardSettings.useDate,
        dtwUseTime: wizardSettings.useTime,
    });
    appService.settings.update({ defaultActivity: wizardSettings.activity });
    appService.setActivity(wizardSettings.activity);

    return children;
}

function InitApp({ children }) {
    const service = useBaseStateService();
    const [state, setState] = useState(STATE.PREPARE);

    const checkVersion = () => {
        if (
            service.storage.persistent.data?.lastUsageVersion !== packageJson.version
            && appVariables.notifyNewVersion
        ) {
            service.storage.temp.update({ newVersion: true });
            service.storage.persistent.update({ lastUsageVersion: packageJson.version });
        }
    };

    useEffect(() => {
        console.log('INIT APP STATE', service.appState);
        if (service.appState === APP_STATE.WORK) {
            if (state !== STATE.FIRST_CONTACT) setState(STATE.DONE);

            checkVersion();
        } else if (service.appState === APP_STATE.REQUIRE_SETUP) {
            setState(STATE.FIRST_CONTACT);
        } else if (service.appState === APP_STATE.REQUIRE_MIGRATE) {
            setState(STATE.MIGRATE);
        }
    }, [service.appState]);

    console.log('state:', state);

    return (
        <React.Fragment>
            {state === STATE.DONE && children}
            {state === STATE.FIRST_CONTACT && (
                <FirstLookScreen onStart={() => { setState(STATE.DONE); }} />
            )}
            {state === STATE.MIGRATE && (
                <MigrateScreen
                    onStart={() => {
                        setState(STATE.DONE);
                        checkVersion();
                    }}
                />
            )}
        </React.Fragment>
    );
}

export default observer(InitApp);
export { ApplyWizardSettingsProvider };
