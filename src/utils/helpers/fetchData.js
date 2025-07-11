import mergeObjects from '@/utils/mergeObjects';

const fetchData = async (url, options = {}) => {
    const { responseType = 'json', ...userOptions } = options;

    const defaultOptions = {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'pragma': 'no-cache',
            'cache-control': 'no-cache',
        },
    };

    const response = await fetch(url, mergeObjects(defaultOptions, userOptions));

    let parsedResponse;

    if (responseType === 'json') {
        parsedResponse = await response.text();
        parsedResponse = parsedResponse.length === 0 ? null : JSON.parse(parsedResponse);
    } else if (responseType === 'blob') {
        parsedResponse = await response.blob();
    } else if (responseType === 'text') {
        parsedResponse = await response.text();
    } else if (responseType === 'arrayBuffer') {
        parsedResponse = await response.arrayBuffer();
    } else if (responseType === 'raw' || responseType === null) {
        parsedResponse = response;
    }

    return {
        statusCode: response.status,
        ok: response.ok,
        response: parsedResponse,
        raw: response,
    };
};

export default fetchData;
