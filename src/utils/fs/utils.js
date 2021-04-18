import appVariables from '@/config/appVariables';

export function getPathAndName(pathOrFS) {
    const path = pathOrFS.substring(0, pathOrFS.lastIndexOf('/'));

    return {
        path,
        name: pathOrFS.substring(pathOrFS.lastIndexOf('/') + 1),
    };
}

export const getUrl = (path) => `filesystem:${appVariables.fs.root || `${location.origin}/persistent/`}${path}`;

export const getBgUrl = (path, type = 'full') => getUrl(`backgrounds/${type}/${path}`);

export const getIconUrl = (path) => getUrl(`bookmarksIcons/${path}`);
