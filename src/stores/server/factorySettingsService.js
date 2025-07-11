import { makeAutoObservable } from 'mobx';
import { first } from 'lodash';
import db from '@/utils/db';
import appVariables from '@/config/config';
import WallpapersUniversalService from '@/stores/universal/wallpapers/service';
import Wallpaper from '@/stores/universal/wallpapers/entities/wallpaper';
import { BG_SOURCE, BG_TYPE } from '@/enum';
import { PREPARE_PROGRESS } from '@/stores/app/core/service';
import { eventToApp } from '@/stores/universal/serviceBus';
import api from '@/utils/helpers/api';
import authStorage from '@/stores/universal/storage/auth';
import FoldersUniversalService from '@/stores/universal/workingSpace/folders';
import { FIRST_UUID, NULL_UUID } from '@/utils/generate/uuid';

class FactorySettingsService {
    core;
    storage;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
        this.storage = this.core.storage;

        this.subscribe();
    }

    async setFactorySettings(progressCallback) {
        // Creating base structure

        progressCallback(10, PREPARE_PROGRESS.CREATE_DEFAULT_STRUCTURE);

        try {
            await FoldersUniversalService.save({
                name: 'Sundry',
                defaultId: FIRST_UUID,
                parentId: NULL_UUID,
            });
        } catch (e) {
            console.warn(e);
        }

        // Registration in cloud

        try {
            progressCallback(15, PREPARE_PROGRESS.REGISTRATION_IN_CLOUD);

            const { response: registrationResponse } = await api.post(
                'auth/virtual/sign-device',
                { useToken: false },
            );

            authStorage.update({
                authToken: registrationResponse.authToken,
                accessToken: registrationResponse.accessToken,
                refreshToken: registrationResponse.refreshToken,
                deviceSign: registrationResponse.deviceSign,
                synced: false,
            });

            console.log('registration in cloud:', registrationResponse);
        } catch (e) {
            authStorage.update({
                authToken: null,
                accessToken: null,
                refreshToken: null,
                deviceSign: null,
                synced: false,
            });
        }

        // Fetching first wallpaper

        progressCallback(35, PREPARE_PROGRESS.FETCH_BG);

        const { response: bgListResponse } = await api.get('wallpapers/collection/editors-choice?count=1&type=image')
            .catch(() => ({ response: [] }));

        progressCallback(70, PREPARE_PROGRESS.SAVE_BG);

        let wallpaper;

        try {
            if (bgListResponse.length !== 0) {
                const applyWallpaper = first(bgListResponse);

                wallpaper = await WallpapersUniversalService.addToLibrary(new Wallpaper({
                    ...applyWallpaper,
                    source: BG_SOURCE[applyWallpaper.service],
                    downloadLink: applyWallpaper.fullSrc,
                    previewLink: applyWallpaper.previewSrc,
                    type: BG_TYPE[applyWallpaper.type],
                }));
            } else {
                wallpaper = await WallpapersUniversalService.addToLibrary(new Wallpaper(appVariables.wallpapers.fallback));
            }
        } catch (e) {
            wallpaper = await WallpapersUniversalService.addToLibrary(new Wallpaper(appVariables.wallpapers.fallback));
        }

        this.storage.update({ bgCurrent: wallpaper });

        // Done

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
                    this.storage.update({
                        factoryResetProgress: null,
                        startUsageVersion: appVariables.version,
                    });
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

        if (!migrateToMv3 && (this.storage.data.factoryResetProgress || !this.storage.data.startUsageVersion)) {
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
