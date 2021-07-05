import React, { useEffect, useState } from 'react';
import { LinearProgress, Fade } from '@material-ui/core';
import Stub from '@/ui-components/Stub';
import { useTranslation } from 'react-i18next';
import { PREPARE_PROGRESS } from '@/stores/app/core';
import { observer } from 'mobx-react-lite';
import useCoreService from '@/stores/app/BaseStateProvider';

function FirstLookScreen({ onStart }) {
    const { t, ready } = useTranslation('firstLook');
    const coreService = useCoreService();
    const [progress, setProgress] = useState(coreService.storage.persistent.data?.factoryResetProgress?.percent || 0);
    const [stage, setStage] = useState(coreService.storage.persistent.data?.factoryResetProgress?.stage || PREPARE_PROGRESS.WAIT);

    useEffect(() => {
        document.title = t('prepareApp');

        coreService.globalEventBus.on('system/factoryReset/progress', ({ data }) => {
            setProgress(data.percent);
            setStage(data.stage);

            if (data.stage === PREPARE_PROGRESS.DONE) {
                document.title = 'Rigami';
                localStorage.setItem('appTabName', document.title);
            }
        });
    }, []);

    console.log('stage:', stage);

    if (!ready) {
        return (
            <Stub
                style={{ height: '100vh' }}
            />
        );
    }

    return (
        <React.Fragment>
            <Fade in={stage !== PREPARE_PROGRESS.DONE}>
                <Stub
                    message={t('prepareApp')}
                    description={`${t('pleaseWait')} ${t(`stage.${stage}`)}`}
                    style={{ height: '100vh' }}
                >
                    <LinearProgress variant="determinate" style={{ width: 240 }} value={progress} />
                </Stub>
            </Fade>
            <Fade in={stage === PREPARE_PROGRESS.DONE}>
                <Stub
                    message={t('allDone')}
                    description={t('prepareAppDoneDescription')}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100vh',
                        width: '100vw',

                    }}
                    actions={[
                        {
                            title: t('button.continue'),
                            color: 'primary',
                            variant: 'contained',
                            onClick: onStart,
                        },
                    ]}
                />
            </Fade>
        </React.Fragment>
    );
}

export default observer(FirstLookScreen);
