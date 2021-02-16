import React from 'react';
import { useTranslation } from 'react-i18next';
import { Collapse } from '@material-ui/core';
import { BG_CHANGE_INTERVAL, BG_SELECT_MODE, BG_TYPE } from '@/enum';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import { observer } from 'mobx-react-lite';
import useAppStateService from '@/stores/app/AppStateProvider';

function Random() {
    const { backgrounds } = useAppStateService();
    const { t } = useTranslation();

    return (
        <Collapse in={backgrounds.settings.selectionMethod === BG_SELECT_MODE.RANDOM}>
            <MenuRow
                title={t('settings.bg.scheduler.changeInterval.title')}
                description={t('settings.bg.scheduler.changeInterval.description')}
                action={{
                    type: ROWS_TYPE.SELECT,
                    format: (value) => t(`settings.bg.scheduler.changeInterval.interval.${value}`),
                    value: backgrounds.settings.changeInterval,
                    onChange: (event) => backgrounds.settings.update({ changeInterval: event.target.value }),
                    values: [
                        BG_CHANGE_INTERVAL.OPEN_TAB,
                        BG_CHANGE_INTERVAL.MINUTES_5,
                        BG_CHANGE_INTERVAL.MINUTES_30,
                        BG_CHANGE_INTERVAL.HOURS_1,
                        BG_CHANGE_INTERVAL.HOURS_6,
                        BG_CHANGE_INTERVAL.HOURS_12,
                        BG_CHANGE_INTERVAL.DAY_1,
                    ],
                }}
            />
            <MenuRow
                title={t('settings.bg.scheduler.BGType.title')}
                description={t('settings.bg.scheduler.BGType.description')}
                action={{
                    type: ROWS_TYPE.MULTISELECT,
                    format: (value) => t(`settings.bg.scheduler.BGType.type.${value}`),
                    value: backgrounds.settings.type || [],
                    onChange: (event) => {
                        if (event.target.value.length === 0) return;

                        backgrounds.settings.update({ type: event.target.value });
                    },
                    values: [
                        BG_TYPE.IMAGE,
                        BG_TYPE.ANIMATION,
                        BG_TYPE.VIDEO,
                        BG_TYPE.FILL_COLOR,
                    ],
                }}
            />
        </Collapse>
    );
}

export default observer(Random);
