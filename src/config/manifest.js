const packageJson = require('../../package.json');

module.exports = () => {
    let manifest = {
        'manifest_version': 3,
        'name': '__MSG_appNameFull__',
        'description': '__MSG_appDescFull__',
        'short_name': 'Rigami (beta)',
        'default_locale': 'en',
        'version': `1.9.9.${packageJson.version}`,
        'version_name': `2.0.0-beta.${packageJson.version}`,
        'homepage_url': 'https://rigami.io/',
        'minimum_chrome_version': '88',
        'offline_enabled': true,
        'icons': {
            '16': 'resource/16x16.png',
            '32': 'resource/32x32.png',
            '64': 'resource/64x64.png',
            '128': 'resource/128x128.png',
        },
        'background': { 'service_worker': 'server.js' },
        'chrome_url_overrides': { 'newtab': 'index.html' },
        'host_permissions': ['https://danilkinkin.com/', '*://*/*'],
        'content_security_policy': {
            'extension_pages':
                'default-src \'self\';'
                + 'script-src http://localhost:8097/;'
                + 'script-src-elem \'self\' http://localhost:8097/;'
                + 'style-src \'unsafe-inline\';'
                + 'object-src \'none\';'
                + 'img-src *;'
                + 'font-src *;'
                + 'connect-src \'unsafe-inline\' data: blob: *;'
                + 'form-action \'self\';'
                + 'media-src \'unsafe-inline\' data: blob: *;',
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
        permissions = [...permissions, 'activeTab', 'sessions'];
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
