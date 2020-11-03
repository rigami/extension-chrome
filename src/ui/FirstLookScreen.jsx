import React, { useEffect, useState } from 'react';
import { LinearProgress, Fade } from '@material-ui/core';
import FullscreenStub from '@/ui-components/FullscreenStub';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import useService from '@/stores/BaseStateProvider';
import asyncAction from '@/utils/asyncAction';
import { PREPARE_PROGRESS } from '@/stores/core';

function FirstLookScreen({ onStart }) {
    const { t } = useTranslation();
    const service = useService();
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState(PREPARE_PROGRESS.WAIT);

    useEffect(() => {
        document.title = i18n.t('tabName.prepare') || 'Rigami';

        asyncAction(async () => {
            await service.setDefaultState((progressValue, stageValue) => {
                setProgress(progressValue);
                setStage(stageValue);
            });
        }).catch(console.error);
    }, []);

    return (
        <React.Fragment>
            <Fade in={stage !== PREPARE_PROGRESS.DONE}>
                <FullscreenStub
                    message={t('firstView.prepareApp')}
                    description={`${t('firstView.pleaseWait')} ${t(`firstView.stage.${stage}`)}`}
                    style={{ height: '100vh' }}
                >
                    <LinearProgress variant="determinate" style={{ width: 240 }} value={progress} />
                </FullscreenStub>
            </Fade>
            <Fade in={stage === PREPARE_PROGRESS.DONE}>
                <FullscreenStub
                    message={t('firstView.allDone')}
                    description={t('firstView.prepareAppDoneDescription')}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100vh',
                        width: '100vw',

                    }}
                    actions={[
                        {
                            title: t('firstView.continue'),
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

export default FirstLookScreen;
