import mergeObjects from '@/utils/mergeObjects';
import { StorageConnector } from '@/stores/universal/storage';
import appVariables from '@/config/appVariables';

const cache = {
    deviceToken: '',
    accessToken: '',
    expiredTimestamp: Date.now(),
};

const baseFetchDate = async (url, options = {}) => {
    const { responseType = 'json', ...userOptions } = options;

    const defaultOptions = { headers: { 'Access-Control-Allow-Origin': '*' } };

    const response = await fetch(url, mergeObjects(defaultOptions, userOptions));

    let parsedResponse;

    if (responseType === 'json') {
        parsedResponse = await response.json();
    } else if (responseType === 'blob') {
        parsedResponse = await response.blob();
    } else if (responseType === 'text') {
        parsedResponse = await response.text();
    } else if (responseType === 'arrayBuffer') {
        parsedResponse = await response.arrayBuffer();
    } else if (responseType === 'raw') {
        parsedResponse = await response;
    }

    return {
        statusCode: response.status,
        ok: response.ok,
        response: parsedResponse,
        raw: response,
    };
};

const refreshToken = async () => {
    console.log('Get token...');
    const { auth } = await StorageConnector.get('auth');

    console.log('auth:', auth);

    let { accessToken, expiredTimestamp } = auth;
    let expired = true;

    if (accessToken) {
        const { response: checkExpiredResponse } = await baseFetchDate(
            `${appVariables.rest.url}/v1/auth/token/expired-check`,
            {
                withoutToken: true,
                cache: 'no-store',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Device-Token': auth.deviceToken,
                    'Device-Type': 'extension-chrome',
                    'Authorization': `Bearer ${accessToken}`,
                },
            },
        );
        console.log('Check token:', checkExpiredResponse);

        expiredTimestamp = Date.now() + checkExpiredResponse.expiredTimeout;
        expired = checkExpiredResponse.expired;
    }

    if (expired) {
        console.log('Token is expired. Refresh...');
        const { response } = await baseFetchDate(
            `${appVariables.rest.url}/v1/auth/token/refresh`,
            {
                cache: 'no-store',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Device-Token': auth.deviceToken,
                    'Device-Type': 'extension-chrome',
                    'Authorization': `Bearer ${auth.refreshToken}`,
                },
            },
        );

        console.log('Refresh response:', response);

        expiredTimestamp = Date.now() + response.expiredTimeout;
        accessToken = response.accessToken;

        await StorageConnector.set({
            auth: {
                ...auth,
                accessToken,
                expiredTimestamp,
            },
        });
    }

    cache.accessToken = accessToken;
    cache.expiredTimestamp = expiredTimestamp - 30 * 1000;
};

const fetchData = async (url, options = {}) => {
    const { withoutToken = false, ...userOptions } = options;

    console.log('fetchData:', url, withoutToken);

    if (!cache.deviceToken) {
        const { auth } = await StorageConnector.get('auth');

        cache.deviceToken = auth.deviceToken;
    }

    const defaultOptions = {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Device-Token': cache.deviceToken,
            'Device-Type': 'extension-chrome',
        },
    };

    if (!withoutToken) {
        if (!cache.accessToken || cache.expiredTimestamp < Date.now()) {
            await refreshToken();
        }

        if (!cache.accessToken) throw new Error('accessToken in undefined');

        defaultOptions.headers.Authorization = `Bearer ${cache.accessToken}`;
    }

    return baseFetchDate(url, mergeObjects(defaultOptions, userOptions));
};

export default fetchData;
