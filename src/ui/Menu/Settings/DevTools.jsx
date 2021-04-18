import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import { observer, useLocalObservable } from 'mobx-react-lite';
import useCoreService from '@/stores/app/BaseStateProvider';
import StorageConnector from '@/utils/storageConnector';
import { Button } from '@material-ui/core';
import { eventToBackground } from '@/stores/server/bus';

const useStyles = makeStyles((theme) => ({ headerButton: { marginLeft: theme.spacing(2) } }));

const headerProps = {
    title: 'DevTools',
    actions: (<HeaderActions />),
};

function HeaderActions() {
    const classes = useStyles();
    const coreService = useCoreService();
    const [changeSettings, setChangeSettings] = useState(null);

    useEffect(() => {
        const listenerId = coreService.localEventBus.on('devTools.changed', (settings) => {
            setChangeSettings(settings);
        });

        return () => coreService.localEventBus.removeListener(listenerId);
    }, []);

    return (
        <React.Fragment>
            <Button
                disabled={!changeSettings}
                variant="contained"
                color="primary"
                onClick={() => {
                    StorageConnector.setJSON('devTools', changeSettings);
                    eventToBackground('system.forceReload');
                }}
            >
                Apply
            </Button>
            <Button
                disabled={!StorageConnector.get('devTools')}
                className={classes.headerButton}
                onClick={() => {
                    StorageConnector.remove('devTools');
                    eventToBackground('system.forceReload');
                }}
            >
                Reset
            </Button>
            <Button
                className={classes.headerButton}
                onClick={() => {
                    eventToBackground('system.forceReload');
                }}
            >
                Force reload
            </Button>
        </React.Fragment>
    );
}

function DevTools() {
    const coreService = useCoreService();
    const { t } = useTranslation();
    const store = useLocalObservable(() => ({
        settings: StorageConnector.getJSON('devTools', { productionEnv: false }),
        hasChange: false,
    }));

    useEffect(() => {
        if (store.hasChange) coreService.localEventBus.call('devTools.changed', store.settings);
    }, [store.hasChange]);

    return (
        <React.Fragment>
            <MenuRow
                title={t('Use production environment')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    width: 72,
                    checked: store.settings.productionEnv,
                    color: 'primary',
                    onChange: (event, value) => {
                        store.settings.productionEnv = value;
                        store.hasChange = true;
                    },
                }}
            />
            <MenuRow
                title={t('Locale')}
                action={{
                    type: ROWS_TYPE.SELECT,
                    value: store.settings.locale,
                    onChange: (event) => {
                        store.settings.locale = event.target.value;
                        store.hasChange = true;
                    },
                    values: ['ru', 'en'],
                }}
            />
        </React.Fragment>
    );
}

const ObserverDevTools = observer(DevTools);

export { headerProps as header, ObserverDevTools as content };

export default {
    header: headerProps,
    content: ObserverDevTools,
};
