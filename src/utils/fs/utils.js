import appVariables from '@/config/appVariables';

export const getUrl = (path) => `filesystem:${appVariables.fs.root || `${location.origin}/persistent/`}${path}`;
