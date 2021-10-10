import { StorageConnector } from '@/stores/universal/storage';
import mergeObjects from '@/utils/mergeObjects';
import appVariables from '@/config/appVariables';
import fetchData from '@/utils/helpers/fetchData';
import { map, startsWith } from 'lodash';

const cache = {
    deviceToken: '',
    accessToken: '',
    expiredTimestamp: Date.now(),
};

const refreshToken = async () => {
    console.log('Get token...');
    const { auth } = await StorageConnector.get('auth');

    console.log('auth:', auth);

    let { accessToken, expiredTimestamp } = auth;
    let expired = true;

    if (accessToken) {
        const { response: checkExpiredResponse } = await fetchData(
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
        const { response } = await fetchData(
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

async function api(path, options = {}) {
    const { useToken = true, version = 1, query, ...userOptions } = options;

    if (!cache.deviceToken) {
        const { auth } = await StorageConnector.get('auth');

        cache.deviceToken = auth.deviceToken;
    }

    const defaultOptions = {
        cache: 'no-store',
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Device-Token': cache.deviceToken,
            'Device-Type': 'extension-chrome',
        },
    };

    if (useToken) {
        if (!cache.accessToken || cache.expiredTimestamp < Date.now()) {
            await refreshToken();
        }

        if (!cache.accessToken) throw new Error('accessToken in undefined');

        defaultOptions.headers.Authorization = `Bearer ${cache.accessToken}`;
    }

    let url = `${appVariables.rest.url}/v${version}/${path}`;

    if (query) {
        url = `${url}?${map(query, (value, key) => `${key}=${value}`).join('&')}`;
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

api.clearCache = function clearCache() {
    cache.deviceToken = '';
    cache.accessToken = '';
    cache.expiredTimestamp = Date.now();
};

export default api;
