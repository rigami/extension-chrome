import { getI18n, useTranslation } from 'react-i18next';
import React, {
    Fragment, useState, forwardRef, useEffect, useCallback,
} from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Typography,
} from '@material-ui/core';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { IMaskInput } from 'react-imask';
import clsx from 'clsx';
import SectionHeader from '@/ui/Menu/SectionHeader';
import MenuInfo from '@/ui/Menu/MenuInfo';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import { FETCH } from '@/enum';
import api from '@/utils/helpers/api';
import authStorage from '@/stores/universal/AuthStorage';
import { eventToBackground } from '@/stores/universal/serviceBus';
import useAppStateService from '@/stores/app/AppStateProvider';

const useStyles = makeStyles((theme) => ({
    fullWidth: { width: '100%' },
    reRunSyncButton: { flexShrink: 0 },
    banner: {
        margin: theme.spacing(1, 0),
        width: 'auto',
        borderRadius: theme.shape.borderRadius,
    },
    code: {
        fontVariantNumeric: 'tabular-nums',
        height: 80,
        lineHeight: '80px',
    },
    codeInput: {
        fontSize: '2.5rem',
        fontVariantNumeric: 'tabular-nums',
        textAlign: 'center',
        fontWeight: theme.typography.h2.fontWeight,
        height: 90,
        letterSpacing: '0.7rem',
    },
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

const NumberFormatCustom = forwardRef(function NumberFormatCustom(props, ref) {
    const { value, onChange, className: externalClassName, ...other } = props;
    const classes = useStyles();

    return (
        <IMaskInput
            value={value}
            mask="###-###"
            definitions={{ '#': /[^1|i|0|o|\W|_]/i }}
            unmask // true|false|'typed'
            className={clsx(externalClassName, classes.codeInput)}
            inputRef={ref}
            onAccept={(acceptValue) => onChange({
                target: {
                    name: props.name,
                    value: acceptValue.toUpperCase(),
                },
            })}
            overwrite
            lazy={false}
        />
    );
});

function CreateRequest() {
    const classes = useStyles();
    const { t } = useTranslation(['settingsSync']);
    const store = useLocalObservable(() => ({
        requestId: null,
        status: FETCH.WAIT,
        code: '',
        isOpen: false,
    }));

    const createRequest = async () => {
        store.status = FETCH.PENDING;

        try {
            let eventTarget;

            if (authStorage.data.username) {
                eventTarget = api.sse('users/merge/request/create');
            } else {
                eventTarget = api.sse('users/merge/request/no-user/create', { useToken: false });
            }

            eventTarget.addEventListener('start', (event) => {
                console.log('start:', event);
            });

            eventTarget.addEventListener('code', (event) => {
                console.log('event:', event);
                store.code = event.data.code;
                store.requestId = event.data.requestId;
                store.status = FETCH.DONE;
            });

            eventTarget.addEventListener('cancel-merge', (event) => {
                console.log('cancel-merge:', event);
            });

            eventTarget.addEventListener('done-merge', async (event) => {
                console.log('done-merge:', event.data);

                if (event.data.action === 'login') {
                    const { response: loginResponse } = await api.post(
                        'auth/login',
                        {
                            useToken: false,
                            responseType: 'json',
                            body: {
                                username: event.data.newUsername,
                                password: event.data.newPassword,
                            },
                        },
                    );

                    authStorage.update({
                        username: event.data.newUsername,
                        accessToken: loginResponse.accessToken,
                        refreshToken: loginResponse.refreshToken,
                    });

                    eventToBackground('sync/forceSync', { newUsername: event.data.newUsername });
                } else if (event.data.action === 'confirm') {

                } else {

                }

                store.isOpen = false;
            });

            eventTarget.addEventListener('close', (event) => {
                console.log('close:', event);
                store.status = FETCH.FAILED;
            });

            eventTarget.addEventListener('abort', (event) => {
                console.log('abort:', event);
                store.status = FETCH.FAILED;
            });
        } catch (e) {
            store.status = FETCH.FAILED;
        }
    };

    const deleteRequest = async () => {
        console.log('requestId:', store.requestId);
        if (authStorage.data.username) {
            await api.delete('users/merge/request', { responseType: null });
        } else {
            await api.delete('users/merge/request/no-user', {
                query: { requestId: store.requestId },
                responseType: null,
                useToken: false,
            });
        }
    };

    useEffect(() => {
        if (!store.isOpen) return () => {};

        createRequest();

        return () => deleteRequest();
    }, [store.isOpen]);

    return (
        <Fragment>
            <MenuRow
                title={t('mergeUsers.createRequest.title')}
                description={t('mergeUsers.createRequest.description')}
                action={{
                    type: ROWS_TYPE.CUSTOM,
                    onClick: () => {},
                    component: (
                        <Button
                            variant="contained"
                            component="span"
                            color="primary"
                            className={classes.reRunSyncButton}
                            fullWidth
                            onClick={() => { store.isOpen = true; }}
                        >
                            {t('mergeUsers.createRequest.button.generateCode')}
                        </Button>
                    ),
                }}
            />
            <Dialog open={store.isOpen} onClose={() => { store.isOpen = false; }}>
                <DialogTitle>{t('mergeUsers.createRequest.dialog.title')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('mergeUsers.createRequest.dialog.description')}
                    </DialogContentText>
                    <MenuInfo
                        show
                        variant="warn"
                        message={t('mergeUsers.createRequest.dialog.warn.title')}
                        classes={{ root: classes.banner }}
                        description={t('mergeUsers.createRequest.dialog.warn.description')}
                    />
                    {store.status === FETCH.FAILED && (
                        <Typography variant="body1" className={classes.code}>
                            {t('common:error.tryLater')}
                        </Typography>
                    )}
                    {store.status === FETCH.PENDING && (
                        <Typography variant="h5" className={classes.code}>
                            {t('common:loading')}
                        </Typography>
                    )}
                    {store.status === FETCH.DONE && (
                        <Typography variant="h2" className={classes.code}>
                            {store.code.substring(0, 3)}
                            -
                            {store.code.substring(3)}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        data-ui-path="mergeUsers.createRequest.cancel"
                        color="primary"
                        onClick={() => { store.isOpen = false; }}
                    >
                        {t('common:button.cancel')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}

const ObserverCreateRequest = observer(CreateRequest);

function ApplyRequest() {
    const classes = useStyles();
    const { t } = useTranslation(['settingsSync']);
    const [isOpen, setIsOpen] = useState(false);
    const [code, setCode] = useState('');
    const [status, setStatus] = useState(FETCH.WAIT);
    const [error, setError] = useState('');

    const applyRequest = async () => {
        setStatus(FETCH.PENDING);

        try {
            const { response, ok } = await api.get(`users/merge/request/${authStorage.data.username ? '' : 'no-user/'}apply`, {
                query: { code },
                useToken: !!authStorage.data.username,
            });

            console.log('response:', response);

            if (!ok) {
                setError(response.message);
                setStatus(FETCH.FAILED);

                return;
            }

            if (response.action === 'login') {
                const { response: loginResponse } = await api.post(
                    'auth/login',
                    {
                        useToken: false,
                        responseType: 'json',
                        body: {
                            username: response.newUsername,
                            password: response.newPassword,
                        },
                    },
                );

                authStorage.update({
                    username: response.newUsername,
                    accessToken: loginResponse.accessToken,
                    refreshToken: loginResponse.refreshToken,
                });

                eventToBackground('sync/forceSync', { newUsername: response.newUsername });
            } else if (response.action === 'confirm') {

            } else {

            }

            setStatus(FETCH.DONE);
            setIsOpen(false);
        } catch (e) {
            console.error(e);
            setError('UNKNOWN');
            setStatus(FETCH.FAILED);
        }
    };

    useEffect(() => {
        if (!isOpen) return;

        setError('');
        setStatus(FETCH.WAIT);
        setCode('');
    }, [isOpen]);

    return (
        <Fragment>
            <MenuRow
                description={t('mergeUsers.applyRequest.description')}
                action={{
                    type: ROWS_TYPE.CUSTOM,
                    onClick: () => {},
                    component: (
                        <Button
                            variant="contained"
                            component="span"
                            color="primary"
                            className={classes.reRunSyncButton}
                            fullWidth
                            onClick={() => setIsOpen(true)}
                        >
                            {t('mergeUsers.applyRequest.button.apply')}
                        </Button>
                    ),
                }}
            />
            <Dialog open={isOpen} onClose={() => status !== FETCH.PENDING && setIsOpen(false)}>
                <DialogTitle>{t('mergeUsers.applyRequest.dialog.title')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('mergeUsers.applyRequest.dialog.description')}
                    </DialogContentText>
                    <MenuInfo
                        show
                        variant="warn"
                        classes={{ root: classes.banner }}
                        message={t('mergeUsers.applyRequest.dialog.warn.title')}
                        description={t('mergeUsers.applyRequest.dialog.warn.description')}
                    />
                    <TextField
                        variant="outlined"
                        autoFocus
                        margin="dense"
                        fullWidth
                        size="medium"
                        value={code}
                        spellCheck={false}
                        InputProps={{ inputComponent: NumberFormatCustom }}
                        onChange={(event) => setCode(event.target.value)}
                    />
                    <MenuInfo
                        show={error && status === FETCH.FAILED}
                        variant="error"
                        classes={{ root: classes.banner }}
                        message={t(`mergeUsers.applyRequest.dialog.error.${error}`)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        data-ui-path="mergeUsers.applyRequest.cancel"
                        color="primary"
                        disabled={status === FETCH.PENDING}
                        onClick={() => { setIsOpen(false); }}
                    >
                        {t('common:button.cancel')}
                    </Button>
                    <Button
                        data-ui-path="mergeUsers.applyRequest.apply"
                        color="primary"
                        disabled={code.length !== 6 || status === FETCH.PENDING}
                        onClick={applyRequest}
                    >
                        {t('mergeUsers.applyRequest.dialog.button.apply')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}

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

function Device({ type, lastActivityDate, current = false }) {
    const classes = useStyles();
    const { t } = useTranslation(['settingsSync']);
    const { widgets } = useAppStateService();

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
                                        ? (widgets.settings.dtwTimeFormat12 ? format12 : format24)(new Date(lastActivityDate))
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
        />
    );
}

function SyncedDevices() {
    const { t } = useTranslation(['settingsSync']);
    const store = useLocalObservable(() => ({
        status: FETCH.WAIT,
        currentDevice: null,
        otherDevices: [],
    }));

    const fetchDevices = async () => {
        console.log('status:', store.status);
        if (store.status === FETCH.WAIT) store.status = FETCH.PENDING;

        try {
            const { response, ok } = await api.get('devices');

            console.log('response:', response);

            if (!ok) {
                store.status = FETCH.FAILED;

                return;
            }

            store.currentDevice = response.currentDevice;
            store.otherDevices = response.otherDevices;
            store.status = FETCH.DONE;
        } catch (e) {
            console.error(e);
            store.status = FETCH.FAILED;
        }
    };

    useEffect(() => {
        if (!authStorage.data.username) {
            store.currentDevice = null;
            store.otherDevices = [];
            return () => {};
        }

        fetchDevices();

        const interval = setInterval(() => {
            fetchDevices();
        }, 3000);

        return () => clearInterval(interval);
    }, [authStorage.data.username]);

    if (store.status === FETCH.PENDING) {
        return (
            <MenuRow
                title={t('syncDevices.loading')}
            />
        );
    }

    return (
        <Fragment>
            <SectionHeader h={2} title={t('syncDevices.currentTitle')} />
            {store.currentDevice && (
                <Device
                    type={store.currentDevice.type}
                    lastActivityDate={store.currentDevice.lastActivityDate}
                    current
                />
            )}
            <SectionHeader h={2} title={t('syncDevices.otherTitle')} />
            {store.otherDevices.map((device) => (
                <Device
                    key={device.id}
                    type={device.type}
                    lastActivityDate={device.lastActivityDate}
                />
            ))}
        </Fragment>
    );
}

const ObserverSyncedDevices = observer(SyncedDevices);

function LinkBrowsers() {
    const classes = useStyles();
    const { t } = useTranslation(['settingsSync']);

    return (
        <React.Fragment>
            <SectionHeader title={t('syncDevices.title')} />
            <ObserverCreateRequest />
            <ApplyRequest />
            {authStorage.data.username && (<ObserverSyncedDevices />)}
        </React.Fragment>
    );
}

export default observer(LinkBrowsers);
