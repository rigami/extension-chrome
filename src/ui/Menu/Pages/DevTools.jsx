import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import { observer, useLocalObservable } from 'mobx-react-lite';
import useCoreService from '@/stores/app/BaseStateProvider';
import { StorageConnector } from '@/stores/universal/storage';
import { Button } from '@material-ui/core';
import { eventToBackground } from '@/stores/server/bus';

const useStyles = makeStyles((theme) => ({
    headerButton: { marginLeft: theme.spacing(2) },
    forceCrashButton: { flexShrink: 0 },
}));

const headerProps = {
    title: 'DevTools',
    actions: (<HeaderActions />),
};

function HeaderActions() {
    const classes = useStyles();
    const coreService = useCoreService();
    const [changeSettings, setChangeSettings] = useState(null);
    const [defaultData, setDefaultData] = useState(null);

    useEffect(() => {
        const listenerId = coreService.localEventBus.on('devTools.changed', (settings) => {
            setChangeSettings(settings);
        });

        StorageConnector.get('devTools').then(({ devTools }) => setDefaultData(devTools));

        return () => coreService.localEventBus.removeListener(listenerId);
    }, []);

    return (
        <React.Fragment>
            <Button
                disabled={!changeSettings}
                variant="contained"
                color="primary"
                onClick={() => {
                    StorageConnector.set({ 'devTools': changeSettings })
                        .finally(() => eventToBackground('system.forceReload'));
                }}
            >
                Apply
            </Button>
            <Button
                disabled={!defaultData}
                className={classes.headerButton}
                onClick={() => {
                    StorageConnector.remove('devTools')
                        .finally(() => eventToBackground('system.forceReload'));
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
    const classes = useStyles();
    const coreService = useCoreService();
    const { t } = useTranslation();
    const store = useLocalObservable(() => ({
        settings: { productionEnv: false },
        hasChange: false,
        forceCrash: false,
    }));

    useEffect(() => {
        StorageConnector.get('devTools').then(({ devTools = {} }) => {
            store.settings = {
                ...store.settings,
                ...devTools,
            };
        });
    }, []);

    useEffect(() => {
        if (store.hasChange) coreService.localEventBus.call('devTools.changed', store.settings);
    }, [store.hasChange]);

    if (store.forceCrash) {
        throw new Error('Test force crash app');
    }

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
                    value: store.settings.locale || '',
                    onChange: (event) => {
                        store.settings.locale = event.target.value;
                        store.hasChange = true;
                    },
                    values: ['ru', 'en'],
                }}
            />
            <MenuRow
                title={t('Force crash')}
                action={{
                    type: ROWS_TYPE.CUSTOM,
                    onClick: () => {},
                    component: (
                        <Button
                            variant="contained"
                            component="span"
                            color="primary"
                            className={classes.forceCrashButton}
                            fullWidth
                            onClick={() => { store.forceCrash = true; }}
                        >
                            Force crash app
                        </Button>
                    ),
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
