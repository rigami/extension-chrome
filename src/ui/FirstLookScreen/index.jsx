import React, { useEffect, useState } from 'react';
import Stub from '@/ui-components/Stub';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import useCoreService from '@/stores/app/BaseStateProvider';
import SmallProgress from '@/ui/FirstLookScreen/SmallProgress';
import { ACTIVITY } from '@/enum';
import FAP_STYLE from '@/enum/BKMS/FAP_STYLE';
import packageJson from '@/../package.json';
import { PREPARE_PROGRESS } from '@/stores/app/core';
import defaultSettings from '@/config/settings';
import WaitEndInstall from './WaitEndInstall';
import Hello from './Hello';
import WizardInstall from './WizardInstall';

const INSTALL_STAGE = {
    HELLO: 'HELLO',
    WIZARD: 'WIZARD',
    WAIT_END_INSTALL: 'WAIT_END_INSTALL',
};

const defaultWizardSettings = {
    activity: ACTIVITY.DESKTOP,
    useTime: true,
    useDate: true,
    fapStyle: FAP_STYLE.PRODUCTIVITY,
    userName: undefined,
};

function FirstLookScreen({ onStart }) {
    const { t, ready } = useTranslation('firstLook');
    const coreService = useCoreService();
    const [stage, setStage] = useState(
        coreService.storage.persistent.data.wizardSettings
            ? INSTALL_STAGE.WAIT_END_INSTALL
            : INSTALL_STAGE.HELLO,
    );

    useEffect(() => {
        if (!ready) return;

        coreService.globalEventBus.on('system/factoryReset/progress', ({ data }) => {
            if (data.stage === PREPARE_PROGRESS.DONE) {
                localStorage.setItem('appTabName', defaultSettings.app.tabName);
            }
        });

        if (!coreService.storage.persistent.data?.factoryResetProgress) {
            localStorage.setItem('appTabName', defaultSettings.app.tabName);
        }

        document.title = t('prepareApp');
    }, [ready]);

    if (!ready) {
        return (<Stub style={{ height: '100vh' }} />);
    }

    const handleStart = () => {
        coreService.storage.persistent.update({ lastUsageVersion: packageJson.version });
        document.title = defaultSettings.app.tabName;
        onStart();
    };

    const applySettings = (newSettings) => {
        coreService.storage.persistent.update({ wizardSettings: newSettings });

        if (coreService.storage.persistent.data.factoryResetProgress) {
            setStage(INSTALL_STAGE.WAIT_END_INSTALL);
        } else {
            handleStart();
        }
    };

    const handleStartWizard = () => {
        setStage(INSTALL_STAGE.WIZARD);
    };

    return (
        <React.Fragment>
            {stage !== INSTALL_STAGE.WAIT_END_INSTALL && coreService.storage.persistent.data?.factoryResetProgress && (
                <SmallProgress />
            )}
            {stage === INSTALL_STAGE.HELLO && (
                <Hello
                    onApplyDefaultSetting={() => applySettings(defaultWizardSettings)}
                    onStartWizard={handleStartWizard}
                />
            )}
            {stage === INSTALL_STAGE.WAIT_END_INSTALL && (<WaitEndInstall onDone={handleStart} />)}
            {stage === INSTALL_STAGE.WIZARD && (
                <WizardInstall
                    defaultSettings={defaultWizardSettings}
                    onCancel={() => setStage(INSTALL_STAGE.HELLO)}
                    onEnd={(wizardSettings) => applySettings(wizardSettings)}
                />
            )}
        </React.Fragment>
    );
}

export default observer(FirstLookScreen);
