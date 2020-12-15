import React, { memo } from 'react';
import { observer } from 'mobx-react-lite';
import { BG_SELECT_MODE } from '@/enum';
import { useTranslation } from 'react-i18next';
import SectionHeader from '@/ui/Menu/SectionHeader';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import useBackgroundsService from '@/stores/BackgroundsStateProvider';
import Radio from './Radio';
import Random from './Random';
import Specific from './Specific';


function SchedulerSection({ onSelect }) {
    const backgroundsStore = useBackgroundsService();
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
                    value: backgroundsStore.settings.selectionMethod,
                    onChange: (event) => backgroundsStore.settings.update({ selectionMethod: event.target.value }),
                    values: [
                        BG_SELECT_MODE.RANDOM,
                        BG_SELECT_MODE.SPECIFIC,
                        BG_SELECT_MODE.SEQUENCE,
                        BG_SELECT_MODE.RADIO,
                    ],
                }}
            />
            <Specific onSelect={onSelect} />
            <Random />
            <Radio onSelect={onSelect} />
        </React.Fragment>
    );
}

export default memo(observer(SchedulerSection));
