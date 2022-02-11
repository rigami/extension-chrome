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
import { useAppStateService } from '@/stores/app/appState';
import Stream from './Stream';
import Specific from './Specific';
import Color from './Color';
import { useCoreService } from '@/stores/app/core';
import MenuRow from '@/ui/Menu/MenuRow';

const useStyles = makeStyles((theme) => ({
    tabs: { width: '100%' },
    linearProgress: {
        marginTop: theme.spacing(-0.25),
        marginBottom: theme.spacing(-0.25),
    },
}));

function SchedulerSection({ onSelect }) {
    const { wallpapersService } = useAppStateService();
    const coreService = useCoreService();
    const { t } = useTranslation(['settingsQuietMode']);
    const classes = useStyles();

    return (
        <React.Fragment>
            <SectionHeader h={2} title={t('scheduler')} />
            <MenuRow>
                <Tabs
                    className={classes.tabs}
                    indicatorColor="primary"
                    variant="fullWidth"
                    value={wallpapersService.settings.kind}
                    onChange={(event, newValue) => {
                        if (newValue === BG_SELECT_MODE.STREAM) {
                            wallpapersService.settings.update({
                                type: wallpapersService.settings.type.filter((type) => (
                                    type !== BG_TYPE.ANIMATION
                                    && type !== BG_TYPE.FILL_COLOR
                                )),
                            });
                        }
                        wallpapersService.settings.update({ kind: newValue });
                    }}
                >
                    <Tab
                        icon={<StreamIcon />}
                        value={BG_SELECT_MODE.STREAM}
                        label={t(`kind.value.${BG_SELECT_MODE.STREAM}`)}
                    />
                    <Tab
                        value={BG_SELECT_MODE.COLOR}
                        label={t(`kind.value.${BG_SELECT_MODE.COLOR}`)}
                    />
                </Tabs>
            </MenuRow>
            <Fade in={coreService.storage.data.wallpaperState === BG_SHOW_STATE.SEARCH} unmountOnExit>
                <LinearProgress className={classes.linearProgress} />
            </Fade>
            <Specific onSelect={onSelect} />
            <Stream onSelect={onSelect} />
            <Color onSelect={onSelect} />
        </React.Fragment>
    );
}

export default memo(observer(SchedulerSection));
