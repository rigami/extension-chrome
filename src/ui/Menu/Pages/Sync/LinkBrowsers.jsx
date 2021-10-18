import { useTranslation } from 'react-i18next';
import React, {
    Fragment, useState, forwardRef, useEffect,
} from 'react';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
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
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import SectionHeader from '@/ui/Menu/SectionHeader';
import { IMaskInput } from 'react-imask';
import MenuInfo from '@/ui/Menu/MenuInfo';
import clsx from 'clsx';
import { FETCH } from '@/enum';
import api from '@/utils/helpers/api';
import authStorage from '@/stores/universal/AuthStorage';
import { eventToBackground } from '@/stores/universal/serviceBus';

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
    const [isOpen, setIsOpen] = useState(false);
    const [code, setCode] = useState('');
    const [status, setStatus] = useState(FETCH.WAIT);

    const createRequest = async () => {
        setStatus(FETCH.PENDING);

        try {
            const eventTarget = api.sse('users/merge/create-request');

            eventTarget.addEventListener('start', (event) => {
                console.log('start:', event);
            });

            eventTarget.addEventListener('code', (event) => {
                setCode(event.data);
                setStatus(FETCH.DONE);
            });

            eventTarget.addEventListener('cancel-merge', (event) => {
                console.log('cancel-merge:', event);
            });

            eventTarget.addEventListener('done-merge', async (event) => {
                console.log('done-merge:', event.data);

                const { response: registrationResponse } = await api.post(
                    'auth/login',
                    {
                        useToken: false,
                        responseType: 'json',
                        body: {
                            email: event.data.newUsername,
                            password: event.data.newUsername,
                        },
                    },
                );

                authStorage.update({
                    username: event.data.newUsername,
                    accessToken: registrationResponse.accessToken,
                    refreshToken: registrationResponse.refreshToken,
                });

                eventToBackground('sync/forceSync', { newUsername: event.data.newUsername });

                setIsOpen(false);
            });

            eventTarget.addEventListener('close', (event) => {
                console.log('close:', event);
                setStatus(FETCH.FAILED);
            });

            eventTarget.addEventListener('abort', (event) => {
                console.log('abort:', event);
                setStatus(FETCH.FAILED);
            });

            // setCode(response.code);
            // setStatus(FETCH.DONE);
        } catch (e) {
            setStatus(FETCH.FAILED);
        }
    };

    const deleteRequest = async () => {
        await api.delete('users/merge/delete-request', { responseType: null });
    };

    useEffect(() => {
        if (!isOpen) return () => {};

        createRequest();

        return () => deleteRequest();
    }, [isOpen]);

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
                            onClick={() => setIsOpen(true)}
                        >
                            {t('mergeUsers.createRequest.button.generateCode')}
                        </Button>
                    ),
                }}
            />
            <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
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
                    {status === FETCH.FAILED && (
                        <Typography variant="body1" className={classes.code}>
                            {t('common:error.tryLater')}
                        </Typography>
                    )}
                    {status === FETCH.PENDING && (
                        <Typography variant="h5" className={classes.code}>
                            {t('common:loading')}
                        </Typography>
                    )}
                    {status === FETCH.DONE && (
                        <Typography variant="h2" className={classes.code}>
                            {code.substring(0, 3)}
                            -
                            {code.substring(3)}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        data-ui-path="mergeUsers.createRequest.cancel"
                        color="primary"
                        onClick={() => { setIsOpen(false); }}
                    >
                        {t('common:button.cancel')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}

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
            const { response, ok } = await api.get('users/merge/apply-request', { query: { code } });

            console.log('response:', response);

            if (!ok) {
                setError(response.message);
                setStatus(FETCH.FAILED);

                return;
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
                title={t('mergeUsers.applyRequest.title')}
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

function LinkBrowsers() {
    const classes = useStyles();
    const { t } = useTranslation(['settingsSync']);

    return (
        <React.Fragment>
            <SectionHeader title={t('mergeUsers.title')} />
            <CreateRequest />
            <ApplyRequest />
        </React.Fragment>
    );
}

export default observer(LinkBrowsers);
