import React from 'react';
import { LinearProgress, Fade } from '@material-ui/core';
import FullscreenStub from '@/ui-components/FullscreenStub';
import { useTranslation } from 'react-i18next';

function FirstLookScreen({ isConfig, progress, onStart }) {
    const { t } = useTranslation();

    return (
        <React.Fragment>
            <Fade in={!isConfig}>
                <FullscreenStub
                    message={t("firstView.prepareApp")}
                    description={t("firstView.pleaseWait")}
                    style={{ height: '100vh' }}
                >
                    <LinearProgress variant="determinate" style={{ width: 240 }} value={progress} />
                </FullscreenStub>
            </Fade>
            <Fade in={isConfig}>
                <FullscreenStub
                    message={t("firstView.allDone")}
                    description={t("firstView.prepareAppDoneDescription")}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100vh',
                        width: '100vw',

                    }}
                    actions={[
                        {
                            title: t("firstView.continue"),
                            color: 'primary',
                            variant: 'contained',
                            onClick: () => onStart(),
                        },
                    ]}
                />
            </Fade>
        </React.Fragment>
    );
}

export default FirstLookScreen;
