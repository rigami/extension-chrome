import React, { Fragment, useEffect } from 'react';
import { getI18n, useTranslation } from 'react-i18next';
import {
    Button,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Typography,
} from '@material-ui/core';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import { makeStyles } from '@material-ui/core/styles';
import { useAppStateService } from '@/stores/app/appState';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import { FETCH } from '@/enum';
import api from '@/utils/helpers/api';
import authStorage from '@/stores/universal/storage/auth';
import SectionHeader from '@/ui/Menu/SectionHeader';

const useStyles = makeStyles((theme) => ({
    fullWidth: { width: '100%' },
    reRunSyncButton: { flexShrink: 0 },
    sycnedDot: {
        backgroundColor: '#57c901',
        borderRadius: '50%',
        width: theme.spacing(1),
        height: theme.spacing(1),
        display: 'inline-block',
        marginLeft: theme.spacing(1),
        verticalAlign: 'middle',
    },
}));

const { format: format12 } = new Intl.DateTimeFormat(getI18n()?.language, {
    weekday: 'long',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h11',
});

const { format: format24 } = new Intl.DateTimeFormat(getI18n()?.language, {
    weekday: 'long',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
});

function Device({ type, lastActivityDate, current = false, onClick }) {
    const classes = useStyles();
    const { t } = useTranslation(['settingsSync']);
    const { widgetsService } = useAppStateService();

    return (
        <MenuRow
            title={t(`syncDevices.type.${type}`)}
            action={{
                type: ROWS_TYPE.CUSTOM,
                onClick: () => {},
                component: (
                    <Fragment>
                        {!current && (
                            <Typography variant="body2">
                                {
                                    lastActivityDate
                                        ? (widgetsService.settings.dtwTimeFormat12 ? format12 : format24)(new Date(lastActivityDate))
                                        : t('syncDevices.notSynced')
                                }
                            </Typography>
                        )}
                        {current && (
                            <Typography variant="body2">
                                {t('syncDevices.synced')}
                                <span className={classes.sycnedDot} />
                            </Typography>
                        )}
                    </Fragment>
                ),
            }}
            onClick={onClick}
        />
    );
}

function LinkedDevices() {
    const classes = useStyles();
    const { t } = useTranslation(['settingsSync']);
    const { widgetsService } = useAppStateService();
    const store = useLocalObservable(() => ({
        status: FETCH.WAIT,
        currentDevice: null,
        otherDevices: [],
        expandDevice: null,
        disconnectStatus: FETCH.WAIT,
        disconnectedDevice: null,
    }));

    const fetchDevices = async () => {
        console.log('status:', store.status);
        if (store.status === FETCH.WAIT) store.status = FETCH.PENDING;

        try {
            const { response, ok } = await api.get('devices');

            console.log('response:', response);

            if (!ok) {
                runInAction(() => {
                    store.status = FETCH.FAILED;
                });

                return;
            }

            runInAction(() => {
                store.currentDevice = response.currentDevice;
                store.otherDevices = response.otherDevices;
                store.status = FETCH.DONE;
            });
        } catch (e) {
            console.error(e);
            runInAction(() => {
                store.status = FETCH.FAILED;
            });
        }
    };

    const disconnectDevice = async () => {
        store.disconnectStatus = FETCH.PENDING;

        try {
            const { response, ok } = await api.delete(`devices/${store.disconnectedDevice.id}`);

            console.log('response:', response);

            if (!ok) {
                store.disconnectStatus = FETCH.FAILED;

                return;
            }

            if (store.currentDevice.id === store.disconnectedDevice.id) {
                const { response: registrationResponse } = await api.post(
                    'auth/virtual/sign-device',
                    { useToken: false },
                ).catch(console.error);

                authStorage.update({
                    authToken: registrationResponse.authToken,
                    accessToken: registrationResponse.accessToken,
                    refreshToken: registrationResponse.refreshToken,
                    deviceSign: registrationResponse.deviceSign,
                });
            } else {
                await fetchDevices();
            }

            store.disconnectStatus = FETCH.DONE;
            store.disconnectedDevice = null;
        } catch (e) {
            console.error(e);
            store.disconnectStatus = FETCH.FAILED;
        }
    };

    useEffect(() => {
        if (!authStorage.data.refreshToken) {
            store.currentDevice = null;
            store.otherDevices = [];
            return () => {};
        }

        fetchDevices();

        const interval = setInterval(() => {
            fetchDevices();
        }, 3000);

        return () => clearInterval(interval);
    }, [authStorage.data.refreshToken]);

    if (store.status === FETCH.PENDING) {
        return (
            <MenuRow
                title={t('syncDevices.loading')}
            />
        );
    }

    if (store.status === FETCH.FAILED) {
        return (
            <MenuRow
                title={t('syncDevices.failed')}
            />
        );
    }

    if (store.otherDevices.length === 0) {
        return null;
    }

    return (
        <Fragment>
            <SectionHeader h={2} title={t('syncDevices.currentTitle')} />
            {store.currentDevice && (
                <Fragment>
                    <Device
                        type={store.currentDevice.type}
                        lastActivityDate={store.currentDevice.lastActivityDate}
                        current
                    />
                    <MenuRow
                        action={{
                            type: ROWS_TYPE.CUSTOM,
                            onClick: () => {},
                            component: (
                                <Button
                                    variant="contained"
                                    component="span"
                                    color="error"
                                    className={classes.reRunSyncButton}
                                    fullWidth
                                    onClick={() => {
                                        store.disconnectedDevice = store.currentDevice;
                                    }}
                                >
                                    {t('syncDevices.button.disconnectThisDevice')}
                                </Button>
                            ),
                        }}
                    />
                </Fragment>
            )}
            <SectionHeader h={2} title={t('syncDevices.otherTitle')} />
            {store.otherDevices.map((device) => (
                <Fragment key={device.id}>
                    <Device
                        type={device.type}
                        lastActivityDate={device.lastActivityDate}
                        onClick={() => {
                            if (store.expandDevice === device.id) {
                                store.expandDevice = null;
                            } else {
                                store.expandDevice = device.id;
                            }
                        }}
                    />
                    <Collapse in={store.expandDevice === device.id}>
                        <MenuRow
                            description={(
                                <Fragment>
                                    {device.lastActivityIp}
                                    <br />
                                    <Typography variant="caption">{t('syncDevices.lastActivityIp')}</Typography>
                                    <br />
                                    <br />
                                    {
                                        device.createDate
                                            ? (widgetsService.settings.dtwTimeFormat12 ? format12 : format24)(new Date(device.createDate))
                                            : '-'
                                    }
                                    <br />
                                    <Typography variant="caption">{t('syncDevices.createDate')}</Typography>
                                    <br />
                                    <br />
                                    {device.userAgent}
                                    <br />
                                    <Typography variant="caption">{t('syncDevices.userAgent')}</Typography>
                                    <br />
                                    <br />
                                    {device.id}
                                    <br />
                                    <Typography variant="caption">{t('syncDevices.id')}</Typography>
                                </Fragment>
                            )}
                            action={{
                                type: ROWS_TYPE.CUSTOM,
                                onClick: () => {},
                                component: (
                                    <Button
                                        variant="contained"
                                        component="span"
                                        color="error"
                                        className={classes.reRunSyncButton}
                                        fullWidth
                                        onClick={() => {
                                            store.disconnectedDevice = device;
                                        }}
                                    >
                                        {t('syncDevices.button.disconnectOtherDevice')}
                                    </Button>
                                ),
                            }}
                        />
                    </Collapse>
                </Fragment>
            ))}
            <Dialog
                open={store.disconnectedDevice}
                onClose={() => { if (store.disconnectStatus !== FETCH.PENDING) store.disconnectedDevice = null; }}
            >
                <DialogTitle>{t('syncDevices.disconnectDevice.title')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('syncDevices.disconnectDevice.description')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        data-ui-path="mergeUsers.applyRequest.cancel"
                        color="primary"
                        disabled={store.disconnectStatus === FETCH.PENDING}
                        onClick={() => { store.disconnectedDevice = null; }}
                    >
                        {t('common:button.cancel')}
                    </Button>
                    <Button
                        data-ui-path="mergeUsers.applyRequest.apply"
                        color="primary"
                        disabled={store.disconnectStatus === FETCH.PENDING}
                        onClick={disconnectDevice}
                    >
                        {t('syncDevices.disconnectDevice.button.apply')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}

export default observer(LinkedDevices);
