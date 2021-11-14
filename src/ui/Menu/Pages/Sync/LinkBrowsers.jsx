import { getI18n, useTranslation } from 'react-i18next';
import React, {
    Fragment, useState, forwardRef, useEffect,
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
            const eventTarget = api.sse('users/merge/request/with-exist-user/create', { useToken: false });

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

                const { response: loginResponse } = await api.post(
                    'auth/login',
                    {
                        useToken: false,
                        responseType: 'json',
                        body: {
                            username: event.data.newUsername,
                            password: event.data.newUsername,
                        },
                    },
                );

                authStorage.update({
                    username: event.data.newUsername,
                    accessToken: loginResponse.accessToken,
                    refreshToken: loginResponse.refreshToken,
                });

                eventToBackground('sync/forceSync', { newUsername: event.data.newUsername });

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
        await api.delete('users/merge/request/with-exist-user', {
            query: { requestId: store.requestId },
            responseType: null,
        });
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
            const { response, ok } = await api.get('users/merge/request/create-virtual-user/apply', {
                query: { code },
                useToken: false,
            });

            console.log('response:', response);

            if (!ok) {
                setError(response.message);
                setStatus(FETCH.FAILED);

                return;
            }

            authStorage.update({
                username: response.regInfo.username,
                accessToken: response.regInfo.accessToken,
                refreshToken: response.regInfo.refreshToken,
            });

            eventToBackground('sync/forceSync', { newUsername: response.regInfo.username });

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
    const classes = useStyles();
    const { t } = useTranslation(['settingsSync']);
    const [status, setStatus] = useState(FETCH.WAIT);
    const [currentDevices, setCurrentDevices] = useState(null);
    const [otherDevices, setOtherDevices] = useState([]);

    const fetchDevices = async () => {
        setStatus(FETCH.PENDING);

        try {
            const { response, ok } = await api.get('devices');

            console.log('response:', response);

            if (!ok) {
                setStatus(FETCH.FAILED);

                return;
            }

            setCurrentDevices(response.currentDevice);
            setOtherDevices(response.otherDevices);
            setStatus(FETCH.DONE);
        } catch (e) {
            console.error(e);
            setStatus(FETCH.FAILED);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, [authStorage.data.username]);

    if (status === FETCH.PENDING) {
        return (
            <MenuRow
                title={t('syncDevices.loading')}
            />
        );
    }

    return (
        <Fragment>
            <SectionHeader h={2} title={t('syncDevices.currentTitle')} />
            {currentDevices && (
                <Device
                    type={currentDevices.type}
                    lastActivityDate={currentDevices.lastActivityDate}
                    current
                />
            )}
            <SectionHeader h={2} title={t('syncDevices.otherTitle')} />
            {otherDevices.map((device) => (
                <Device
                    key={device.id}
                    type={device.type}
                    lastActivityDate={device.lastActivityDate}
                />
            ))}
        </Fragment>
    );
}

function LinkBrowsers() {
    const classes = useStyles();
    const { t } = useTranslation(['settingsSync']);

    return (
        <React.Fragment>
            <SectionHeader title={t('syncDevices.title')} />
            <ObserverCreateRequest />
            <ApplyRequest />
            {authStorage.data.username && (<SyncedDevices />)}
        </React.Fragment>
    );
}

export default observer(LinkBrowsers);
