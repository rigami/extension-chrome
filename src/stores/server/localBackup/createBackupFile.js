import JSZip from 'jszip';
import appVariables from '@/config/config';

export default async (data) => {
    const {
        settings,
        bookmarks,
        tags,
        folders,
        favorites,
        wallpapers,
    } = data;
    const backup = {};

    backup.meta = {
        date: new Date().toISOString(),
        appVersion: appVariables.version,
        appType: 'extension.chrome',
        version: appVariables.backup.version,
    };

    const zip = new JSZip();

    zip.file('meta.json', JSON.stringify(backup.meta));

    if (settings) zip.file('settings.json', JSON.stringify(settings));

    if (bookmarks || tags || folders || favorites) {
        zip.file('workingSpace.json', JSON.stringify({
            favorites,
            bookmarks,
            tags,
            folders,
        }));
    }

    if (wallpapers) {
        zip.file('wallpapers.json', JSON.stringify(wallpapers.meta));
        zip.folder('wallpapers');
        zip.folder('previews');

        wallpapers.full.forEach((file, fileName) => {
            zip.file(`wallpapers/${fileName}`, file);
        });

        wallpapers.preview.forEach((file, fileName) => {
            zip.file(`wallpaperPreviews/${fileName}`, file);
        });
    }

    return zip.generateAsync({ type: 'blob' });
};
