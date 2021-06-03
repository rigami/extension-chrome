import React, { useEffect, useState } from 'react';
import useService from '@/stores/app/BaseStateProvider';
import { APP_STATE } from '@/stores/app/core';
import { observer } from 'mobx-react-lite';
import FirstLookScreen from '@/ui/InitApp/FirstLookScreen';
import appVariables from '@/config/appVariables';
import Stub from '@/ui-components/Stub';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import packageJson from '../../../package.json';

const useStyles = makeStyles((theme) => ({
    stub: {
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100vh',
        width: '100vw',
        backgroundColor: theme.palette.background.default,
    },
}));

function CrashApp() {
    const classes = useStyles();
    const service = useService();
    const { t } = useTranslation();

    return (
        <Stub
            message={t('crashApp.title')}
            description={t(`crashApp.error.${service.appError}`, t('crashApp.error.UNKNOWN'))}
            className={classes.stub}
        />
    );
}

function InitApp({ children }) {
    const service = useService();
    const [isConfig, setIsConfig] = useState(false);
    const [isFirstContact, setIsFirstContact] = useState(false);

    useEffect(() => {
        console.log('INIT APP STATE', service.appState);
        if (service.appState === APP_STATE.WORK) {
            setIsConfig(true);

            // service.storage.temp.update({ newVersion: true });

            if (
                service.storage.persistent.data.lastUsageVersion
                && service.storage.persistent.data.lastUsageVersion !== packageJson.version
            ) {
                if (appVariables.notifyNewVersion) service.storage.temp.update({ newVersion: true });
                service.storage.persistent.update({ lastUsageVersion: packageJson.version });
            }
        } else if (service.appState === APP_STATE.REQUIRE_SETUP) {
            setIsFirstContact(true);
        }
    }, [service.appState]);

    return (
        <React.Fragment>
            {service.appState !== APP_STATE.FAILED && isConfig && !isFirstContact && children}
            {service.appState !== APP_STATE.FAILED && isFirstContact && (
                <FirstLookScreen
                    onLoad={() => {
                        service.storage.persistent.update({ lastUsageVersion: packageJson.version });
                    }}
                    onStart={() => {
                        setIsConfig(true);
                        setIsFirstContact(false);
                    }}
                />
            )}
            {service.appState === APP_STATE.FAILED && (<CrashApp />)}
        </React.Fragment>
    );
}

export default observer(InitApp);
