const packageJson = require('../../package.json');

module.exports = () => {
    let manifest = {
        'manifest_version': 3,
        'name': '__MSG_appNameFull__',
        'description': '__MSG_appDescFull__',
        'short_name': 'Rigami',
        'default_locale': 'en',
        'version': packageJson.version,
        'homepage_url': 'https://rigami.io/',
        'minimum_chrome_version': '85',
        'offline_enabled': true,
        'icons': {
            '16': 'resource/16x16.png',
            '32': 'resource/32x32.png',
            '64': 'resource/64x64.png',
            '128': 'resource/128x128.png',
        },
        'background': { 'service_worker': 'server.js' },
        'chrome_url_overrides': { 'newtab': 'index.html' },
        'host_permissions': ['http://danilkinkin.com/', '*://*/*'],
        'content_security_policy': {
            'extension_pages':
                'default-src \'self\' http://localhost:8097; '
                + 'connect-src *; '
                + 'style-src \'unsafe-inline\'; '
                + 'img-src *;'
                + 'font-src *;'
                + 'media-src * data: blob: \'unsafe-inline\'',
        },
    };

    let permissions = ['storage', 'unlimitedStorage'];

    if (!process.env.BUILD || process.env.BUILD === 'full') {
        manifest = {
            ...manifest,
            'action': {
                'default_title': '__MSG_appAction__',
                'default_popup': 'popup.html',
            },
        };
        permissions = [
            ...permissions,
            'activeTab',
            'sessions',
            'bookmarks',
        ];
    }

    if (process.env.BUILD === 'wallpapers') {
        manifest = {
            ...manifest,
            'short_name': 'Rigami wallpapers',
            'name': '__MSG_appNameWallpapers__',
            'description': '__MSG_appDescWallpapers__',
        };
    }

    manifest = {
        ...manifest,
        permissions,
    };

    return manifest;
};
