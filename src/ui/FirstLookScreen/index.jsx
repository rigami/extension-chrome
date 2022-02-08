import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Stub from '@/ui-components/Stub';
import useCoreService from '@/stores/app/BaseStateProvider';
import SmallProgress from '@/ui/FirstLookScreen/SmallProgress';
import { ACTIVITY } from '@/enum';
import FAP_STYLE from '@/enum/BKMS/FAP_STYLE';
import packageJson from '@/../package.json';
import { APP_STATE, PREPARE_PROGRESS } from '@/stores/app/core';
import defaultSettings from '@/config/settings';
import WaitEndInstall from './WaitEndInstall';
import Hello from './Hello';
import WizardInstall from './WizardInstall';
import Login from './Login';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
    },
}));

const INSTALL_STAGE = {
    HELLO: 'HELLO',
    WIZARD: 'WIZARD',
    LOGIN: 'LOGIN',
    WAIT_END_INSTALL: 'WAIT_END_INSTALL',
};

const defaultWizardSettings = {
    activity: ACTIVITY.DESKTOP,
    useTime: true,
    useDate: true,
    fapStyle: BUILD === 'full' ? FAP_STYLE.PRODUCTIVITY : FAP_STYLE.HIDDEN,
    userName: undefined,
};

function FirstLookScreen({ onStart }) {
    const classes = useStyles();
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

        coreService.appState = APP_STATE.WORK;
    };

    const applySettings = (newSettings) => {
        coreService.storage.persistent.update({ wizardSettings: newSettings });

        if (coreService.storage.persistent.data.factoryResetProgress) {
            setStage(INSTALL_STAGE.WAIT_END_INSTALL);
        } else {
            handleStart();
        }
    };

    return (
        <Box className={classes.root}>
            {stage !== INSTALL_STAGE.WAIT_END_INSTALL && coreService.storage.persistent.data?.factoryResetProgress && (
                <SmallProgress />
            )}
            {stage === INSTALL_STAGE.HELLO && (
                <Hello
                    onApplyDefaultSetting={() => applySettings(defaultWizardSettings)}
                    onStartWizard={() => { setStage(INSTALL_STAGE.WIZARD); }}
                    onLogin={() => { setStage(INSTALL_STAGE.LOGIN); }}
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
            {stage === INSTALL_STAGE.LOGIN && (
                <Login
                    defaultSettings={defaultWizardSettings}
                    onCancel={() => setStage(INSTALL_STAGE.HELLO)}
                    onEnd={(wizardSettings) => applySettings(wizardSettings)}
                />
            )}
        </Box>
    );
}

export default observer(FirstLookScreen);
