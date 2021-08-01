import { makeAutoObservable } from 'mobx';
import db from '@/utils/db';
import fetchData from '@/utils/helpers/fetchData';
import appVariables from '@/config/appVariables';
import BackgroundsUniversalService from '@/stores/universal/backgrounds/service';
import Background from '@/stores/universal/backgrounds/entities/background';
import { first } from 'lodash';
import { BG_SOURCE, BG_TYPE } from '@/enum';
import { PREPARE_PROGRESS } from '@/stores/app/core';
import { eventToApp } from '@/stores/universal/serviceBus';

class FactorySettingsService {
    core;
    storage;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
        this.storage = this.core.storage.persistent;

        this.subscribe();
    }

    async setFactorySettings(progressCallback) {
        progressCallback(10, PREPARE_PROGRESS.CREATE_DEFAULT_STRUCTURE);

        try {
            await db().add('folders', {
                id: 1,
                name: 'Sundry',
                parentId: 0,
            });
        } catch (e) {
            console.warn(e);
        }

        if (BUILD === 'full') {
            progressCallback(15, PREPARE_PROGRESS.IMPORT_BOOKMARKS);

            console.log('Import system bookmarks');
            await this.core.systemBookmarksService.syncBookmarks();
        }

        console.log('Fetch BG');
        progressCallback(35, PREPARE_PROGRESS.FETCH_BG);

        const { response } = await fetchData(
            `${appVariables.rest.url}/backgrounds/get-from-collection?count=1&type=image&collection=best`,
        ).catch(() => ({ response: [] }));

        progressCallback(70, PREPARE_PROGRESS.SAVE_BG);

        let bg;

        if (response.length !== 0) {
            bg = await BackgroundsUniversalService.addToLibrary(new Background({
                ...first(response),
                source: BG_SOURCE[first(response).service],
                downloadLink: first(response).fullSrc,
                type: BG_TYPE[first(response).type],
            }));
        } else {
            bg = await BackgroundsUniversalService.addToLibrary(new Background(appVariables.backgrounds.fallback));
        }

        this.storage.update({ bgCurrent: bg });

        console.log('DONE');
        progressCallback(100, PREPARE_PROGRESS.DONE);

        return Promise.resolve();
    }

    async factoryReset() {
        console.log('Start factory reset!');
        this.storage.update({
            factoryResetProgress: {
                percent: 0,
                stage: PREPARE_PROGRESS.WAIT,
            },
        });

        return new Promise((resolve) => {
            this.setFactorySettings((percent, stage) => {
                if (stage === PREPARE_PROGRESS.DONE) {
                    console.log('Done factory reset!');
                    this.storage.update({ factoryResetProgress: null });
                    resolve();
                } else {
                    this.storage.update({
                        factoryResetProgress: {
                            percent,
                            stage,
                        },
                    });
                }

                eventToApp('system/factoryReset/progress', {
                    percent,
                    stage,
                });
            });
        });
    }

    subscribe() {
        this.core.globalEventBus.on('system/factoryReset', ({ callback }) => {
            this.factoryReset().then(callback);
        });

        if (this.storage.data.factoryResetProgress || !this.storage.data.lastUsageVersion) {
            this.factoryReset();
        }
    }
}

export default FactorySettingsService;
