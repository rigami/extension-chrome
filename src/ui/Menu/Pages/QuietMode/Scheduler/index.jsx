import React, { memo } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import {
    Fade,
    LinearProgress,
    Tab,
    Tabs,
} from '@material-ui/core';
import { WifiTetheringRounded as StreamIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { BG_SELECT_MODE, BG_SHOW_STATE, BG_TYPE } from '@/enum';
import SectionHeader from '@/ui/Menu/SectionHeader';
import useAppStateService from '@/stores/app/AppStateProvider';
import Stream from './Stream';
import Specific from './Specific';

const useStyles = makeStyles((theme) => ({
    tabs: {
        margin: theme.spacing(0, 4),
        marginBottom: theme.spacing(1),
        marginLeft: theme.spacing(9),
    },
    linearProgress: {
        marginTop: theme.spacing(-0.25),
        marginBottom: theme.spacing(-0.25),
    },
}));

function SchedulerSection({ onSelect }) {
    const { backgrounds } = useAppStateService();
    const { t } = useTranslation(['settingsQuietMode']);
    const classes = useStyles();

    return (
        <React.Fragment>
            <SectionHeader h={2} title={t('scheduler')} />
            <Tabs
                className={classes.tabs}
                indicatorColor="primary"
                variant="fullWidth"
                value={backgrounds.settings.selectionMethod}
                onChange={(event, newValue) => {
                    if (newValue === BG_SELECT_MODE.STREAM) {
                        backgrounds.settings.update({
                            type: backgrounds.settings.type.filter((type) => (
                                type !== BG_TYPE.ANIMATION
                                && type !== BG_TYPE.FILL_COLOR
                            )),
                        });
                    }
                    backgrounds.settings.update({ selectionMethod: newValue });
                }}
            >
                <Tab
                    icon={<StreamIcon />}
                    value={BG_SELECT_MODE.STREAM}
                    label={t(`selectionMethod.value.${BG_SELECT_MODE.STREAM}`)}
                />
                <Tab
                    value={BG_SELECT_MODE.GRADIENT}
                    label={t(`selectionMethod.value.${BG_SELECT_MODE.GRADIENT}`)}
                />
                <Tab
                    value={BG_SELECT_MODE.SOLID}
                    label={t(`selectionMethod.value.${BG_SELECT_MODE.SOLID}`)}
                />
            </Tabs>
            <Fade in={backgrounds.bgState === BG_SHOW_STATE.SEARCH} unmountOnExit>
                <LinearProgress className={classes.linearProgress} />
            </Fade>
            <Specific onSelect={onSelect} />
            <Stream onSelect={onSelect} />
        </React.Fragment>
    );
}

export default memo(observer(SchedulerSection));
