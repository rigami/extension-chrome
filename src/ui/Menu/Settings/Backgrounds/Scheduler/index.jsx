import React, { memo } from 'react';
import { observer } from 'mobx-react-lite';
import { BG_SELECT_MODE, BG_SHOW_STATE, BG_TYPE } from '@/enum';
import { useTranslation } from 'react-i18next';
import SectionHeader from '@/ui/Menu/SectionHeader';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import Stream from './Stream';
import Random from './Random';
import Specific from './Specific';
import useAppStateService from '@/stores/app/AppStateProvider';
import { Collapse, LinearProgress } from '@material-ui/core';


function SchedulerSection({ onSelect }) {
    const { backgrounds } = useAppStateService();
    const { t } = useTranslation();

    return (
        <React.Fragment>
            <SectionHeader title={t('settings.bg.scheduler.title')} />
            <MenuRow
                title={t('settings.bg.scheduler.selectionMethod.title')}
                description={t('settings.bg.scheduler.selectionMethod.description')}
                action={{
                    type: ROWS_TYPE.SELECT,
                    format: (value) => t(`settings.bg.scheduler.selectionMethod.method.${value}`),
                    value: backgrounds.settings.selectionMethod,
                    onChange: (event) => {
                        if(event.target.value === BG_SELECT_MODE.STREAM) {
                            backgrounds.settings.update({
                                type: backgrounds.settings.type.filter((type) => (
                                    type !== BG_TYPE.ANIMATION
                                    && type !== BG_TYPE.FILL_COLOR
                                )),
                            });
                        }
                        backgrounds.settings.update({ selectionMethod: event.target.value });
                    },
                    values: [
                        BG_SELECT_MODE.RANDOM,
                        BG_SELECT_MODE.SPECIFIC,
                        // BG_SELECT_MODE.SEQUENCE,
                        BG_SELECT_MODE.STREAM,
                    ],
                }}
            />
            <Collapse in={backgrounds.bgState === BG_SHOW_STATE.SEARCH}>
                <LinearProgress />
            </Collapse>
            <Random />
            <Specific onSelect={onSelect} />
            <Stream onSelect={onSelect} />
        </React.Fragment>
    );
}

export default memo(observer(SchedulerSection));
