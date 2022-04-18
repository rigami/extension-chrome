import { map, startsWith } from 'lodash';
import mergeObjects from '@/utils/mergeObjects';
import appVariables from '@/config/config';
import fetchData from '@/utils/helpers/fetchData';
import awaitInstallStorage from '@/utils/helpers/awaitInstallStorage';
import { SERVICE_STATE } from '@/enum';
import authStorage from '@/stores/universal/storage/auth';
import { eventToBackground } from '@/stores/universal/serviceBus';

const queueAwaitRequests = [];
let refreshingAccessToken = false;

const refreshAccessToken = async () => {
    console.log('Check token is expired...');

    let { accessToken, expiredTimestamp } = authStorage.data;
    const { deviceSign, refreshToken } = authStorage.data;

    console.log('Token is expired. Refresh...');

    const { response, statusCode } = await fetchData(
        `${appVariables.rest.url}/v1/auth/token/refresh`,
        {
            cache: 'no-store',
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Device-Sign': deviceSign,
                'Device-Type': 'extension-chrome',
                'Device-Platform': navigator.userAgentData.platform,
                'Authorization': `Bearer ${refreshToken}`,
            },
        },
    );

    if (statusCode === 401) {
        const { response: tokenInfo, ok } = await fetchData(
            `${appVariables.rest.url}/v1/auth/token/check`,
            {
                withoutToken: true,
                cache: 'no-store',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Device-Sign': deviceSign,
                    'Device-Type': 'extension-chrome',
                    'Device-Platform': navigator.userAgentData.platform,
                    'Authorization': `Bearer ${refreshToken}`,
                },
            },
        );

        console.log('Token unavailable. Info:', tokenInfo);

        if (tokenInfo.status === 'device-inactive' && tokenInfo.action === 'login/jwt') {
            authStorage.update({ authToken: tokenInfo.authToken });

            const { response: loginResponse } = await fetchData(
                `${appVariables.rest.url}/v1/auth/login/jwt`,
                {
                    method: 'POST',
                    cache: 'no-store',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Device-Sign': deviceSign,
                        'Device-Type': 'extension-chrome',
                        'Device-Platform': navigator.userAgentData.platform,
                        'Authorization': `Bearer ${tokenInfo.authToken}`,
                    },
                },
            );

            console.log('loginResponse:', loginResponse);

            authStorage.update({
                accessToken: loginResponse.accessToken,
                refreshToken: loginResponse.refreshToken,
                synced: false,
            });

            const { response: devicesResponse } = await fetchData(
                `${appVariables.rest.url}/v1/devices`,
                {
                    method: 'GET',
                    cache: 'no-store',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Device-Sign': deviceSign,
                        'Device-Type': 'extension-chrome',
                        'Device-Platform': navigator.userAgentData.platform,
                        'Authorization': `Bearer ${loginResponse.accessToken}`,
                    },
                },
            );

            if (devicesResponse && devicesResponse.otherDevices.length !== 0) {
                authStorage.update({ synced: true });

                eventToBackground('sync/forceSync', { newAuthToken: tokenInfo.authToken });
            }
        }

        if (tokenInfo.status === 'device-deleted') {
            const { response: registrationResponse } = await fetchData(
                `${appVariables.rest.url}/v1/auth/virtual/sign-device`,
                {
                    method: 'POST',
                    cache: 'no-store',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Device-Sign': '',
                        'Device-Type': 'extension-chrome',
                        'Device-Platform': navigator.userAgentData.platform,
                    },
                },
            );

            console.log('registrationResponse:', registrationResponse);

            authStorage.update({
                authToken: registrationResponse.authToken,
                accessToken: registrationResponse.accessToken,
                refreshToken: registrationResponse.refreshToken,
                deviceSign: registrationResponse.deviceSign,
                synced: false,
            });
        }
    }

    console.log('Refresh response:', response);

    expiredTimestamp = Date.now() + response.expiredTimeout - 5 * 1000;
    accessToken = response.accessToken;

    authStorage.update({
        accessToken,
        expiredTimestamp,
    });
};

async function getAccessToken(force = false) {
    if (refreshingAccessToken) {
        return new Promise((resolve, reject) => {
            queueAwaitRequests.push({
                resolve,
                reject,
            });
        });
    }

    if (!force && authStorage.data.accessToken && authStorage.data.expiredTimestamp > Date.now()) {
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

async function getDeviceSign() {
    if (authStorage.state !== SERVICE_STATE.DONE) {
        await awaitInstallStorage(authStorage);
    }

    return authStorage.data.deviceSign;
}

async function api(pathOrUrl, options = {}) {
    const {
        useToken = true,
        version = 1,
        query,
        body,
        retryIfFall = true,
        ...userOptions
    } = options;

    const deviceSign = await getDeviceSign();

    const defaultOptions = {
        cache: 'no-store',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Device-Sign': deviceSign,
            'Device-Type': 'extension-chrome',
            'Device-Platform': navigator.userAgentData.platform,
        },
    };

    if (useToken === true) {
        const accessToken = await getAccessToken();

        defaultOptions.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (typeof useToken === 'string') {
        defaultOptions.headers.Authorization = `Bearer ${useToken}`;
    }

    let url = pathOrUrl?.indexOf('://') !== -1 ? pathOrUrl : `${appVariables.rest.url}/v${version}/${pathOrUrl}`;

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

    const result = await fetchData(url, mergeObjects(defaultOptions, userOptions));

    if (result.statusCode === 401 && retryIfFall) {
        await getAccessToken(true);

        return api(path, {
            ...options,
            retryIfFall: false,
        });
    }

    return result;
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
    const controller = new AbortController();

    api(path, {
        ...options,
        signal: controller.signal,
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

    const bindedAddListener = eventTarget.addEventListener.bind(eventTarget);
    const bindedAbort = controller.abort.bind(controller);

    return {
        addEventListener: bindedAddListener,
        abort: bindedAbort,
    };
};

api.computeUrl = (pathOrUrl, { version = 1 } = {}) => (
    pathOrUrl?.indexOf('://') !== -1
        ? pathOrUrl
        : `${appVariables.rest.url}/v${version}/${pathOrUrl}`
);

export default api;
