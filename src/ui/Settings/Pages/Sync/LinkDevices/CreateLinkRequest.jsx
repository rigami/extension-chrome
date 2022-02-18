import React, { Fragment, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { action } from 'mobx';
import {
    Box,
    Button,
    CircularProgress,
    Typography,
} from '@material-ui/core';
import { RefreshRounded as TryAgainIcon } from '@material-ui/icons';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { FETCH } from '@/enum';
import api from '@/utils/helpers/api';
import authStorage from '@/stores/universal/storage/auth';
import { eventToBackground } from '@/stores/universal/serviceBus';
import MenuRow, { ROWS_TYPE } from '@/ui/Settings/MenuRow';
import Banner from '@/ui-components/Banner';

const useStyles = makeStyles((theme) => ({
    banner: {
        margin: theme.spacing(1, 0),
        width: 'auto',
    },
    code: {
        fontVariantNumeric: 'tabular-nums',
        marginRight: theme.spacing(1),
    },
    codeContainer: {
        display: 'flex',
        alignItems: 'center',
    },
}));

function CreateLinkRequest({ onLink }) {
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
        eventTarget: null,
    }));

    const createRequest = async () => {
        store.status = FETCH.PENDING;
        store.requestId += 1;

        const { requestId } = store;
        clearInterval(store.lifeInterval);
        clearTimeout(store.lifeTimer);

        try {
            if (store.eventTarget) store.eventTarget.abort();

            store.eventTarget = api.sse('users/merge/request/create');

            store.eventTarget.addEventListener('code', action((event) => {
                if (requestId !== store.requestId) return;

                console.log('event:', requestId, event);
                store.code = event.data.code;
                store.expiredTimeout = event.data.expiredTimeout;
                store.maxExpiredTimeout = event.data.maxExpiredTimeout;
                store.expiredDate = Date.now() + store.expiredTimeout;
                store.status = FETCH.DONE;

                clearInterval(store.lifeInterval);
                clearTimeout(store.lifeTimer);

                store.lifeInterval = setInterval(action(() => {
                    store.expiredTimeout = store.expiredDate - Date.now();
                }), 100);

                store.lifeTimer = setTimeout(() => {
                    createRequest();
                }, event.data.expiredTimeout);
            }));

            store.eventTarget.addEventListener('cancel-merge', (event) => {
                if (requestId !== store.requestId) return;

                console.log('cancel-merge:', requestId, event);
            });

            store.eventTarget.addEventListener('done-merge', async (event) => {
                if (requestId !== store.requestId) return;

                console.log('done-merge:', requestId, event.data);

                if (event.data.action === 'login/jwt') {
                    authStorage.update({ authToken: event.data.authToken });

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
                        synced: true,
                    });

                    if (onLink) onLink();

                    eventToBackground('sync/forceSync', { newAuthToken: event.data.authToken });
                } else if (event.data.action === 'confirm') {

                } else {

                }

                store.isOpen = false;
            });

            store.eventTarget.addEventListener('error', (event) => {
                if (requestId !== store.requestId) return;

                console.log('error:', requestId, event);
                store.status = FETCH.FAILED;
            });

            store.eventTarget.addEventListener('close', (event) => {
                if (requestId !== store.requestId) return;

                console.log('close:', requestId, event);
                store.status = FETCH.FAILED;
            });

            store.eventTarget.addEventListener('abort', (event) => {
                if (requestId !== store.requestId) return;

                console.log('abort:', requestId, event);
                store.status = FETCH.FAILED;
                store.code = '';
                clearInterval(store.lifeInterval);
                clearTimeout(store.lifeTimer);
            });
        } catch (e) {
            console.error(e);
            store.status = FETCH.FAILED;
        }
    };

    const deleteRequest = async () => {
        clearInterval(store.lifeInterval);
        clearTimeout(store.lifeTimer);
        if (store.eventTarget) store.eventTarget.abort();

        // await api.delete('users/merge/request', { responseType: null });
    };

    useEffect(() => {
        createRequest();

        return () => deleteRequest();
    }, [authStorage.data.authToken]);

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
                                        variant={store.status === FETCH.PENDING || store.expiredTimeout <= 0 ? 'indeterminate' : 'determinate'}
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
                <Banner
                    variant="warn"
                    message={t('mergeUsers.createRequest.dialog.warn.title')}
                    classes={{ root: classes.banner }}
                    description={t('mergeUsers.createRequest.dialog.warn.description')}
                />
            </MenuRow>
        </Fragment>
    );
}

export default observer(CreateLinkRequest);
