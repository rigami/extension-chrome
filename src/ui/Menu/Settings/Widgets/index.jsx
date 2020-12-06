import React from 'react';
import { Collapse } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import SectionHeader from '@/ui/Menu/SectionHeader';
import useAppStateService from '@/stores/AppStateProvider';
import { WIDGET_DTW_POSITION, WIDGET_DTW_SIZE } from '@/enum';
import { map } from 'lodash';
import { observer } from 'mobx-react-lite';
import TimeWidget from './Time';
import DateWidget from './Date';
import WeatherWidget from './Weather';

const headerProps = { title: 'settings.widgets.title' };

const numberToEnumSize = (value) => (
    value === 3
        ? WIDGET_DTW_SIZE.BIG
        : value === 2
            ? WIDGET_DTW_SIZE.MIDDLE
            : WIDGET_DTW_SIZE.SMALL
);
const enumSizeToNumber = (value) => (
    value === WIDGET_DTW_SIZE.BIG
        ? 3
        : value === WIDGET_DTW_SIZE.MIDDLE
            ? 2
            : 1
);

function Widgets({ onSelect }) {
    const { t } = useTranslation();
    const { widgets } = useAppStateService();

    return (
        <React.Fragment>
            <MenuRow
                title={t('settings.widgets.useWidgets.title')}
                description={t('settings.widgets.useWidgets.description')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    value: widgets.settings.useWidgets,
                    onChange: (event, value) => {
                        widgets.settings.update({ useWidgets: value });
                    },
                }}
                type={ROWS_TYPE.CHECKBOX}
            />
            <Collapse in={widgets.settings.useWidgets}>
                <SectionHeader title={t('settings.widgets.dtw.title')} />
                <MenuRow
                    title={t('settings.widgets.dtw.dtwPlace.title')}
                    // description={t('settings.widgets.dtw.dtwPlace.description')}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => t(`settings.widgets.dtw.dtwPlace.place.${value}`),
                        value: widgets.settings.dtwPosition,
                        onChange: (event) => {
                            widgets.settings.update({ dtwPosition: event.target.value });
                        },
                        values: map(WIDGET_DTW_POSITION, (key) => WIDGET_DTW_POSITION[key]),
                    }}
                />
                <MenuRow
                    title={t('settings.widgets.dtw.dtwSize.title')}
                    // description={t('settings.widgets.dtw.dtwSize.description')}
                    action={{
                        type: ROWS_TYPE.SLIDER,
                        value: enumSizeToNumber(widgets.settings.dtwSize),
                        onChange: (event, value) => {
                            console.log('onChange', value, numberToEnumSize(value));
                            widgets.settings.update({ dtwSize: numberToEnumSize(value) });
                        },
                        onChangeCommitted: (event, value) => {
                            widgets.settings.update({ dtwSize: numberToEnumSize(value) });
                        },
                        min: 1,
                        max: 3,
                        marks: [
                            {
                                value: 1,
                                label: t(`settings.widgets.dtw.dtwSize.size.${WIDGET_DTW_SIZE.SMALL}`),
                            },
                            {
                                value: 2,
                                label: t(`settings.widgets.dtw.dtwSize.size.${WIDGET_DTW_SIZE.MIDDLE}`),
                            },
                            {
                                value: 3,
                                label: t(`settings.widgets.dtw.dtwSize.size.${WIDGET_DTW_SIZE.BIG}`),
                            },
                        ],
                        step: 1,
                        valueLabelDisplay: 'off',
                    }}
                />
                <TimeWidget />
                <DateWidget />
                <WeatherWidget onSelect={onSelect} />
            </Collapse>
        </React.Fragment>
    );
}

const ObserverWidgets = observer(Widgets);

export { headerProps as header, ObserverWidgets as content };
