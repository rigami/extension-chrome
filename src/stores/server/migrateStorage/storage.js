import { toJS } from 'mobx';
import { omit } from 'lodash';

// eslint-disable-next-line camelcase
async function migrate_1_2(storage) {
    let wallpapersStreamQuery = {};

    if (
        storage.backgroundStreamQuery.type === 'query'
        || storage.backgroundStreamQuery.type === 'custom-query'
    ) {
        wallpapersStreamQuery = {
            type: 'query',
            value: storage.backgroundStreamQuery.value,
        };
    } else {
        wallpapersStreamQuery = {
            type: storage.backgroundStreamQuery.type,
            value: 'editors-choice',
        };
    }

    return {
        ...omit(storage, ['backgroundStreamQuery', 'currentBGStream', 'bgsStream']),
        wallpapersStreamQuery,
        bgCurrent: {
            ...storage.bgCurrent,
            angle: 0,
            colors: [],
            id: btoa(JSON.stringify({
                idInSource: storage.bgCurrent.originId,
                source: storage.bgCurrent.source.toLowerCase(),
            })),
            idInSource: storage.bgCurrent.originId,
            kind: 'media',
            previewSrc: storage.bgCurrent.previewLink,
        },
    };
}

async function migrate(storage, oldVersion, newVersion) {
    console.log('Migrate storage:', storage, oldVersion, newVersion);
    let migratedStorage = toJS(storage.data);

    if (oldVersion !== 0 && oldVersion < 2) migratedStorage = await migrate_1_2(migratedStorage);

    storage.update(migratedStorage, true);
}

export default migrate;
