import mergeObjects from '@/utils/mergeObjects';

const fetchData = async (url, options = {}) => {
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
        response: parsedResponse,
        raw: response,
    };
};

export default fetchData;
