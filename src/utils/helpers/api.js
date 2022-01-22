import { map, startsWith } from 'lodash';
import mergeObjects from '@/utils/mergeObjects';
import appVariables from '@/config/appVariables';
import fetchData from '@/utils/helpers/fetchData';
import awaitInstallStorage from '@/utils/helpers/awaitInstallStorage';
import { SERVICE_STATE } from '@/enum';
import authStorage from '@/stores/universal/AuthStorage';

const queueAwaitRequests = [];
let refreshingAccessToken = false;

const refreshAccessToken = async () => {
    console.log('Check token is expired...');

    let { accessToken, expiredTimestamp } = authStorage.data;
    const { deviceToken, refreshToken } = authStorage.data;
    let expired = true;

    if (accessToken) {
        const { response: checkExpiredResponse } = await fetchData(
            `${appVariables.rest.url}/v1/auth/token/expired-check`,
            {
                withoutToken: true,
                cache: 'no-store',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Device-Sign': deviceToken,
                    'Device-Type': 'extension-chrome',
                    'Device-Platform': navigator.userAgentData.platform,
                    'Authorization': `Bearer ${accessToken}`,
                },
            },
        );
        console.log('Check token:', checkExpiredResponse);

        expiredTimestamp = Date.now() + checkExpiredResponse.expiredTimeout - 5 * 1000;
        expired = checkExpiredResponse.expired;
    }

    if (expired) {
        console.log('Token is expired. Refresh...');
        const { response } = await fetchData(
            `${appVariables.rest.url}/v1/auth/token/refresh`,
            {
                cache: 'no-store',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Device-Sign': deviceToken,
                    'Device-Type': 'extension-chrome',
                    'Device-Platform': navigator.userAgentData.platform,
                    'Authorization': `Bearer ${refreshToken}`,
                },
            },
        );

        console.log('Refresh response:', response);

        expiredTimestamp = Date.now() + response.expiredTimeout - 5 * 1000;
        accessToken = response.accessToken;

        authStorage.update({
            accessToken,
            expiredTimestamp,
        });
    } else {
        authStorage.update({ expiredTimestamp });
    }
};

async function getAccessToken() {
    if (refreshingAccessToken) {
        return new Promise((resolve, reject) => {
            queueAwaitRequests.push({
                resolve,
                reject,
            });
        });
    }

    if (authStorage.data.accessToken && authStorage.data.expiredTimestamp > Date.now()) {
        return authStorage.data.accessToken;
    }

    refreshingAccessToken = true;

    try {
        await refreshAccessToken();

        refreshingAccessToken = false;
        queueAwaitRequests.map(({ resolve }) => resolve(authStorage.data.accessToken));
    } catch (e) {
        refreshingAccessToken = false;
        queueAwaitRequests.map(({ reject }) => reject(authStorage.data.accessToken));
    }

    return authStorage.data.accessToken;
}

async function getDeviceToken() {
    if (authStorage.state !== SERVICE_STATE.DONE) {
        await awaitInstallStorage(authStorage);
    }

    return authStorage.data.deviceToken;
}

async function api(path, options = {}) {
    const {
        useToken = true,
        version = 1,
        query,
        body,
        ...userOptions
    } = options;

    const deviceToken = await getDeviceToken();

    const defaultOptions = {
        cache: 'no-store',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Device-Sign': deviceToken,
            'Device-Type': 'extension-chrome',
            'Device-Platform': navigator.userAgentData.platform,
        },
    };

    if (useToken) {
        const accessToken = await getAccessToken();

        defaultOptions.headers.Authorization = `Bearer ${accessToken}`;
    }

    let url = `${appVariables.rest.url}/v${version}/${path}`;

    if (body) {
        defaultOptions.body = JSON.stringify(body);
        defaultOptions.headers['Content-type'] = 'application/json';
    }

    if (query) {
        const queries = map(query, (value, key) => (value ? `${key}=${value}` : null))
            .filter((isExist) => isExist)
            .join('&');

        url = `${url}${queries ? `?${queries}` : ''}`;
    }

    return fetchData(url, mergeObjects(defaultOptions, userOptions));
}

api.get = async function getMethod(path, options = {}) {
    return api(path, {
        ...options,
        method: 'GET',
    });
};

api.post = async function postMethod(path, options = {}) {
    return api(path, {
        ...options,
        method: 'POST',
    });
};

api.put = async function putMethod(path, options = {}) {
    return api(path, {
        ...options,
        method: 'PUT',
    });
};

api.delete = async function deleteMethod(path, options = {}) {
    return api(path, {
        ...options,
        method: 'DELETE',
    });
};

api.sse = function sse(path, options = {}) {
    function makeJsonDecoder() {
        // eslint-disable-next-line no-undef
        return new TransformStream({
            start(controller) {
                controller.buf = '';
                controller.pos = 0;
            },
            transform(chunk, controller) {
                controller.buf += chunk;
                while (controller.pos < controller.buf.length) {
                    if (controller.buf[controller.pos] === '\n') {
                        const line = controller.buf.substring(0, controller.pos);
                        if (startsWith(line, 'data:')) {
                            controller.enqueue(JSON.parse(line.substring(6)));
                        }
                        controller.buf = controller.buf.substring(controller.pos + 1);
                        controller.pos = 0;
                    } else {
                        controller.pos += 1;
                    }
                }
            },
        });
    }

    function makeWriteableEventStream(eventTarget) {
        return new WritableStream({
            start() {
                eventTarget.dispatchEvent(new Event('start'));
            },
            write(message) {
                eventTarget.dispatchEvent(
                    new MessageEvent(
                        message.type,
                        { data: message.data },
                    ),
                );
            },
            close() {
                eventTarget.dispatchEvent(new CloseEvent('close'));
            },
            abort(reason) {
                eventTarget.dispatchEvent(new CloseEvent('abort', { reason }));
            },
        });
    }

    const eventTarget = new EventTarget();
    const jsonDecoder = makeJsonDecoder();
    const eventStream = makeWriteableEventStream(eventTarget);

    api(path, {
        ...options,
        responseType: 'raw',
        method: 'GET',
    })
        .then(({ response }) => {
            response.body
                // eslint-disable-next-line no-undef
                .pipeThrough(new TextDecoderStream())
                .pipeThrough(jsonDecoder)
                .pipeTo(eventStream);
        })
        .catch((error) => {
            console.error(error);
            eventTarget.dispatchEvent(new CustomEvent('error', { detail: error }));
        });

    return eventTarget;
};

api.computeUrl = (path, { version = 1 } = {}) => `${appVariables.rest.url}/v${version}/${path}`;

export default api;
