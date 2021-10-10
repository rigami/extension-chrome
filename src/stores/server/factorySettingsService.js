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
import { StorageConnector } from '@/stores/universal/storage';
import { v4 as UUIDv4 } from 'uuid';

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

        progressCallback(15, PREPARE_PROGRESS.REGISTRATION_IN_CLOUD);

        const { auth: { deviceToken: defaultDeviceToken } = {} } = await StorageConnector.get('auth', null);

        const deviceToken = defaultDeviceToken || UUIDv4();

        console.log({ uuid: UUIDv4() });

        if (!defaultDeviceToken) await StorageConnector.set({ auth: { deviceToken } });

        const { response: registrationResponse } = await fetchData(
            `${appVariables.rest.url}/v1/auth/virtual/registration`,
            {
                method: 'POST',
                cache: 'no-store',
                withoutToken: true,
            },
        );

        await StorageConnector.set({
            auth: {
                deviceToken,
                accessToken: registrationResponse.accessToken,
                refreshToken: registrationResponse.refreshToken,
            },
        });

        console.log('registration in cloud:', registrationResponse);

        console.log('Fetch BG');
        progressCallback(35, PREPARE_PROGRESS.FETCH_BG);

        const { response: bgListResponse } = await fetchData(
            `${appVariables.rest.url}/backgrounds/get-from-collection?count=1&type=image&collection=best`,
        ).catch(() => ({ response: [] }));

        progressCallback(70, PREPARE_PROGRESS.SAVE_BG);

        let bg;

        try {
            if (bgListResponse.length !== 0) {
                bg = await BackgroundsUniversalService.addToLibrary(new Background({
                    ...first(bgListResponse),
                    source: BG_SOURCE[first(bgListResponse).service],
                    downloadLink: first(bgListResponse).fullSrc,
                    previewLink: first(bgListResponse).previewSrc,
                    type: BG_TYPE[first(bgListResponse).type],
                }));
            } else {
                bg = await BackgroundsUniversalService.addToLibrary(new Background(appVariables.backgrounds.fallback));
            }
        } catch (e) {
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

    async subscribe() {
        this.core.globalEventBus.on('system/factoryReset', ({ callback }) => {
            this.factoryReset().then(callback);
        });

        const migrateToMv3 = await db().getFromIndex('temp', 'name', 'migrate-to-mv3-require');

        if (!migrateToMv3 && (this.storage.data.factoryResetProgress || !this.storage.data.lastUsageVersion)) {
            this.factoryReset();
        }

        if (migrateToMv3) {
            this.storage.update({
                migrateToMv3Progress: {
                    percent: 0,
                    stage: PREPARE_PROGRESS.WAIT,
                },
            });
        }
    }
}

export default FactorySettingsService;
