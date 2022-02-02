import React, {
    Fragment,
    useState,
    forwardRef,
    useEffect,
} from 'react';
import {
    Box,
    Button,
    CircularProgress,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Typography,
} from '@material-ui/core';
import { RefreshRounded as TryAgainIcon } from '@material-ui/icons';
import { getI18n, useTranslation } from 'react-i18next';
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
    },
    code: {
        fontVariantNumeric: 'tabular-nums',
        marginRight: theme.spacing(1),
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
    codeContainer: {
        display: 'flex',
        alignItems: 'center',
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
        requestId: 0,
        status: FETCH.WAIT,
        code: '',
        isOpen: false,
        expiredTimeout: 0,
        maxExpiredTimeout: 0,
        lifeInterval: null,
        lifeTimer: null,
    }));

    const createRequest = async () => {
        store.status = FETCH.PENDING;
        store.requestId += 1;

        const { requestId } = store;
        clearInterval(store.lifeInterval);
        clearTimeout(store.lifeTimer);

        try {
            const eventTarget = api.sse('users/merge/request/create');

            eventTarget.addEventListener('start', (event) => {
                console.log('start:', requestId, event);
                if (requestId !== store.requestId) return;
            });

            eventTarget.addEventListener('code', (event) => {
                console.log('event:', requestId, event);
                if (requestId !== store.requestId) return;
                store.code = event.data.code;
                store.expiredTimeout = event.data.expiredTimeout;
                store.maxExpiredTimeout = event.data.maxExpiredTimeout;
                store.status = FETCH.DONE;

                store.lifeInterval = setInterval(() => {
                    store.expiredTimeout -= 1000;
                }, 1000);

                store.lifeTimer = setTimeout(() => {
                    createRequest();
                }, event.data.expiredTimeout);
            });

            eventTarget.addEventListener('cancel-merge', (event) => {
                console.log('cancel-merge:', requestId, event);
                if (requestId !== store.requestId) return;
            });

            eventTarget.addEventListener('done-merge', async (event) => {
                console.log('done-merge:', requestId, event.data);
                if (requestId !== store.requestId) return;

                if (event.data.action === 'login/jwt') {
                    const { response: loginResponse } = await api.post(
                        'auth/login/jwt',
                        {
                            useToken: event.data.authToken,
                            responseType: 'json',
                        },
                    );

                    console.log('loginResponse:', loginResponse);

                    authStorage.update({
                        accessToken: loginResponse.accessToken,
                        refreshToken: loginResponse.refreshToken,
                        authToken: loginResponse.authToken,
                    });

                    eventToBackground('sync/forceSync', { newUsername: event.data.newUsername });
                } else if (event.data.action === 'confirm') {

                } else {

                }

                store.isOpen = false;
            });

            eventTarget.addEventListener('error', (event) => {
                console.log('error:', requestId, event);
                if (requestId !== store.requestId) return;
                store.status = FETCH.FAILED;
            });

            eventTarget.addEventListener('close', (event) => {
                console.log('close:', requestId, event);
                if (requestId !== store.requestId) return;
                store.status = FETCH.FAILED;
            });

            eventTarget.addEventListener('abort', (event) => {
                console.log('abort:', requestId, event);
                if (requestId !== store.requestId) return;
                store.status = FETCH.FAILED;
                store.code = '';
                clearInterval(store.lifeInterval);
                clearTimeout(store.lifeTimer);
            });
        } catch (e) {
            store.status = FETCH.FAILED;
        }
    };

    const deleteRequest = async () => {
        clearInterval(store.lifeInterval);
        clearTimeout(store.lifeTimer);

        await api.delete('users/merge/request', { responseType: null });
    };

    useEffect(() => {
        createRequest();

        return () => deleteRequest();
    }, []);

    return (
        <Fragment>
            <MenuRow
                description={t('mergeUsers.createRequest.dialog.description')}
                action={{
                    type: ROWS_TYPE.CUSTOM,
                    onClick: () => {},
                    component: (
                        <Box className={classes.codeContainer}>
                            {store.status === FETCH.FAILED && (
                                <Button endIcon={<TryAgainIcon />} onClick={createRequest}>
                                    {t('common:error.tryAgain')}
                                </Button>
                            )}
                            {store.status !== FETCH.FAILED && (
                                <Fragment>
                                    {store.status === FETCH.PENDING && !store.code && (
                                        <Typography variant="h4" className={classes.code}>
                                            {t('common:loading')}
                                        </Typography>
                                    )}
                                    {(store.status !== FETCH.PENDING || store.code) && (
                                        <Typography variant="h4" className={classes.code}>
                                            {store.code.substring(0, 3)}
                                            -
                                            {store.code.substring(3)}
                                        </Typography>
                                    )}
                                    <CircularProgress
                                        variant={store.status === FETCH.PENDING ? 'indeterminate' : 'determinate'}
                                        value={(store.expiredTimeout / store.maxExpiredTimeout) * 100}
                                        size={26}
                                        thickness={5}
                                    />
                                </Fragment>
                            )}
                        </Box>
                    ),
                }}
            />
            <MenuRow>
                <MenuInfo
                    show
                    variant="warn"
                    message={t('mergeUsers.createRequest.dialog.warn.title')}
                    classes={{ root: classes.banner }}
                    description={t('mergeUsers.createRequest.dialog.warn.description')}
                />
            </MenuRow>
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
            const { response, ok } = await api.get('users/merge/request/apply', { query: { code } });

            console.log('response:', response);

            if (!ok) {
                setError(response.message);
                setStatus(FETCH.FAILED);

                return;
            }

            if (response.action === 'login/jwt') {
                const { response: loginResponse } = await api.post(
                    'auth/login/jwt',
                    {
                        useToken: response.authToken,
                        responseType: 'json',
                    },
                );

                console.log('loginResponse:', loginResponse);

                authStorage.update({
                    accessToken: loginResponse.accessToken,
                    refreshToken: loginResponse.refreshToken,
                    authToken: loginResponse.authToken,
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

function Device({ type, lastActivityDate, current = false, onClick }) {
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
            onClick={onClick}
        />
    );
}

function SyncedDevices() {
    const classes = useStyles();
    const { t } = useTranslation(['settingsSync']);
    const { widgets } = useAppStateService();
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

    const disconnectDevice = async () => {
        store.disconnectStatus = FETCH.PENDING;

        try {
            const { response, ok } = await api.get('users/merge', {
                query: { },
                useToken: !!authStorage.data.username,
            });

            console.log('response:', response);

            if (!ok) {
                store.disconnectStatus = FETCH.FAILED;

                return;
            }

            await fetchDevices();

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
                    {/* <MenuRow
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
                    /> */}
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
                                            ? (widgets.settings.dtwTimeFormat12 ? format12 : format24)(new Date(device.createDate))
                                            : '-'
                                    }
                                    <br />
                                    <Typography variant="caption">{t('syncDevices.createDate')}</Typography>
                                    <br />
                                    <br />
                                    {device.userAgent}
                                    <br />
                                    <Typography variant="caption">{t('syncDevices.userAgent')}</Typography>
                                </Fragment>
                            )}
                            /* action={{
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
                            }} */
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

const ObserverSyncedDevices = observer(SyncedDevices);

function LinkBrowsers() {
    const classes = useStyles();
    const { t } = useTranslation(['settingsSync']);

    return (
        <React.Fragment>
            <SectionHeader title={t('syncDevices.title')} />
            <MenuRow
                title={t('mergeUsers.createRequest.title')}
                description={t('mergeUsers.createRequest.description')}
            />
            <ObserverCreateRequest />
            <ApplyRequest />
            {authStorage.data.refreshToken && (<ObserverSyncedDevices />)}
        </React.Fragment>
    );
}

export default observer(LinkBrowsers);
