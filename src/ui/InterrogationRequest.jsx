import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { IconButton, CardMedia, Collapse } from '@material-ui/core';
import useCoreService from '@/stores/app/BaseStateProvider';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import Stub from '@/ui-components/Stub';
import { makeStyles } from '@material-ui/core/styles';
import {
    CloseRounded as CloseIcon,
    FavoriteRounded as FavoriteIcon,
} from '@material-ui/icons';
import requestSrc from '@/images/request.png';

const useStyles = makeStyles((theme) => ({
    rateScreen: { height: 520 },
    endScreen: { height: 360 },
    rateScreenIcon: {
        width: 200,
        height: 200,
    },
    endScreenIcon: { color: '#f61515' },
    dismissButton: {
        position: 'absolute',
        right: theme.spacing(1),
        top: theme.spacing(1),
    },
}));

function RequestScreen({ onClose, onEnd }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const [isRequestScreen, setIsRequestScreen] = useState(true);

    return (
        <React.Fragment>
            <IconButton className={classes.dismissButton} onClick={onClose}>
                <CloseIcon />
            </IconButton>
            <Collapse in={isRequestScreen}>
                <Stub
                    className={classes.rateScreen}
                    icon={CardMedia}
                    iconProps={{
                        className: classes.rateScreenIcon,
                        image: requestSrc,
                    }}
                    message={t('interrogation.request.title')}
                    description={t('interrogation.request.description')}
                    actions={[
                        {
                            variant: 'contained',
                            title: t('interrogation.request.accept'),
                            onClick: () => {
                                window.open('https://forms.gle/5AKN1tWcsxSBSbNm6', '_blank');
                                setIsRequestScreen(false);
                                onEnd();
                            },
                        },
                    ]}
                />
            </Collapse>
            <Collapse in={!isRequestScreen}>
                <Stub
                    className={classes.endScreen}
                    icon={FavoriteIcon}
                    iconProps={{ className: classes.endScreenIcon }}
                    message={t('interrogation.end.title')}
                    description={t('interrogation.end.description')}
                />
            </Collapse>
        </React.Fragment>
    );
}

function InterrogationRequest() {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const coreService = useCoreService();

    useEffect(() => {
        if (
            coreService.storage.temp.newVersion
            || coreService.storage.persistent.completedPoll === 'how-do-you-rigami'
        ) return;

        const rateSnackbar = enqueueSnackbar({
            content: (
                <RequestScreen
                    onClose={() => {
                        closeSnackbar(rateSnackbar);
                        coreService.storage.updatePersistent({ completedPoll: 'how-do-you-rigami' });
                    }}
                    onEnd={() => {
                        coreService.storage.updatePersistent({ completedPoll: 'how-do-you-rigami' });
                    }}
                />
            ),
        }, { persist: true });
    }, []);

    return null;
}

export default observer(InterrogationRequest);
