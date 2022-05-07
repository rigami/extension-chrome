import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Stub from '@/ui-components/Stub';
import { useCoreService } from '@/stores/app/core';
import SmallProgress from '@/ui/WorkingSpace/FirstLookScreen/SmallProgress';
import packageJson from '../../../../package.json';
import { APP_STATE, PREPARE_PROGRESS } from '@/stores/app/core/service';
import defaultSettings from '@/config/settings';
import WaitEndInstall from './WaitEndInstall';
import Hello from './Hello';
import WizardInstall from './WizardInstall';
import Login from './Login';
import { useAppStateService } from '@/stores/app/appState';

const useStyles = makeStyles(() => ({
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

function FirstLookScreen({ onStart, style: externalStyle = {} }) {
    const classes = useStyles();
    const { t, ready } = useTranslation('firstLook');
    const coreService = useCoreService();
    const appStateService = useAppStateService();
    const [stage, setStage] = useState(
        coreService.storage.data.wizardSettings
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

        if (!coreService.storage.data?.factoryResetProgress) {
            localStorage.setItem('appTabName', defaultSettings.app.tabName);
        }

        document.title = t('prepareApp');
    }, [ready]);

    if (!ready) {
        return (<Stub style={{ height: '100vh' }} />);
    }

    const handleStart = () => {
        coreService.storage.update({ lastUsageVersion: packageJson.version });
        document.title = defaultSettings.app.tabName;
        onStart();

        coreService.appState = APP_STATE.WORK;
    };

    const applySettings = () => {
        appStateService.settings.recalc();
        if (coreService.storage.data.factoryResetProgress) {
            setStage(INSTALL_STAGE.WAIT_END_INSTALL);
        } else {
            handleStart();
        }
    };

    return (
        <Box className={classes.root} style={externalStyle}>
            {stage !== INSTALL_STAGE.WAIT_END_INSTALL && coreService.storage.data?.factoryResetProgress && (
                <SmallProgress />
            )}
            {stage === INSTALL_STAGE.HELLO && (
                <Hello
                    onApplyDefaultSetting={() => applySettings()}
                    onStartWizard={() => { setStage(INSTALL_STAGE.WIZARD); }}
                    onLogin={() => { setStage(INSTALL_STAGE.LOGIN); }}
                />
            )}
            {stage === INSTALL_STAGE.WAIT_END_INSTALL && (<WaitEndInstall onDone={handleStart} />)}
            {stage === INSTALL_STAGE.WIZARD && (
                <WizardInstall
                    onCancel={() => setStage(INSTALL_STAGE.HELLO)}
                    onEnd={() => applySettings()}
                />
            )}
            {stage === INSTALL_STAGE.LOGIN && (
                <Login
                    onCancel={() => setStage(INSTALL_STAGE.HELLO)}
                    onEnd={() => applySettings()}
                />
            )}
        </Box>
    );
}

export default observer(FirstLookScreen);
