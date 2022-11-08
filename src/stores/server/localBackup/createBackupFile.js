import JSZip from 'jszip';
import appVariables from '@/config/config';

export default async (data) => {
    const {
        storage,
        settings,
        bookmarks,
        tags,
        folders,
        favorites,
        wallpapers,
    } = data;

    const zip = new JSZip();

    zip.file('meta.json', JSON.stringify({
        date: new Date().toISOString(),
        appVersion: appVariables.version,
        appType: 'extension.chrome',
        version: appVariables.backup.version,
    }));

    if (settings) zip.file('settings.json', JSON.stringify(settings));

    if (bookmarks || tags || folders || favorites) {
        zip.file('workingSpace.json', JSON.stringify({
            tags,
            folders,
            bookmarks,
            favorites,
        }));
    }

    if (storage) {
        zip.file('storage.json', JSON.stringify(storage));
    }

    if (wallpapers) {
        zip.file('wallpapers.json', JSON.stringify(wallpapers.meta));
        zip.folder('wallpapers');
        zip.folder('wallpaperPreviews');

        wallpapers.full.forEach((file, fileName) => {
            zip.file(`wallpapers/${fileName}`, file);
        });

        wallpapers.preview.forEach((file, fileName) => {
            zip.file(`wallpaperPreviews/${fileName}`, file);
        });
    }

    return zip.generateAsync({ type: 'blob' });
};
