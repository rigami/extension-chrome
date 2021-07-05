import React, { useEffect, useState } from 'react';
import { LinearProgress, Fade } from '@material-ui/core';
import Stub from '@/ui-components/Stub';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import useService from '@/stores/app/BaseStateProvider';
import { PREPARE_PROGRESS } from '@/stores/app/core';
import { captureException } from '@sentry/react';
import { observer } from 'mobx-react-lite';

function FirstLookScreen({ onStart, onLoad }) {
    const { t, ready } = useTranslation('firstLook');
    const service = useService();
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState(PREPARE_PROGRESS.WAIT);

    useEffect(() => {
        document.title = t('prepareApp');

        service.setDefaultState((progressValue, stageValue) => {
            console.log(progressValue, stageValue);
            setProgress(progressValue);
            setStage(stageValue);

            if (stageValue === PREPARE_PROGRESS.DONE) {
                document.title = 'Rigami';
                localStorage.setItem('appTabName', document.title);
                onLoad();
            }
        }).catch((e) => {
            console.error(e);
            captureException(e);
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
