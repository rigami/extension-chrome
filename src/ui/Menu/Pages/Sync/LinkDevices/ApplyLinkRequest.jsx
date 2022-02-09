import React, {
    forwardRef,
    Fragment,
    useEffect,
    useState,
} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { IMaskInput } from 'react-imask';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { FETCH } from '@/enum';
import api from '@/utils/helpers/api';
import authStorage from '@/stores/universal/AuthStorage';
import { eventToBackground } from '@/stores/universal/serviceBus';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import MenuInfo from '@/ui/Menu/MenuInfo';

const useStyles = makeStyles((theme) => ({
    fullWidth: { width: '100%' },
    reRunSyncButton: { flexShrink: 0 },
    banner: {
        margin: theme.spacing(1, 0),
        width: 'auto',
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

function ApplyLinkRequest() {
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
                authStorage.update({ authToken: response.authToken });

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
                });

                eventToBackground('sync/forceSync', { newAuthToken: response.authToken });
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

export default observer(ApplyLinkRequest);
