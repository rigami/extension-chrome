import React from 'react';
import { Collapse } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import SectionHeader from '@/ui/Menu/SectionHeader';
import useAppStateService from '@/stores/app/AppStateProvider';
import { WIDGET_DTW_POSITION, WIDGET_DTW_SIZE } from '@/enum';
import { map } from 'lodash';
import { observer } from 'mobx-react-lite';
import TimeWidget from './Time';
import DateWidget from './Date';
import WeatherWidget from './Weather';

const headerProps = { title: 'settings:widgets' };
const pageProps = { width: 750 };

const numberToEnumSize = (value) => [
    WIDGET_DTW_SIZE.SMALLER,
    WIDGET_DTW_SIZE.SMALL,
    WIDGET_DTW_SIZE.MIDDLE,
    WIDGET_DTW_SIZE.BIG,
    WIDGET_DTW_SIZE.BIGGER,
][value - 1];

const enumSizeToNumber = (value) => [
    WIDGET_DTW_SIZE.SMALLER,
    WIDGET_DTW_SIZE.SMALL,
    WIDGET_DTW_SIZE.MIDDLE,
    WIDGET_DTW_SIZE.BIG,
    WIDGET_DTW_SIZE.BIGGER,
].findIndex((size) => size === value) + 1;

function Widgets({ onSelect }) {
    const { t } = useTranslation(['settingsWidget']);
    const { widgets } = useAppStateService();

    return (
        <React.Fragment>
            <MenuRow
                title={t('useWidgets.title')}
                description={t('useWidgets.description')}
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
                <SectionHeader title={t('dtw')} />
                <MenuRow
                    title={t('dtwPlace.title')}
                    // description={t('dtwPlace.description')}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => t(`dtwPlace.value.${value}`),
                        value: widgets.settings.dtwPosition,
                        onChange: (event) => {
                            widgets.settings.update({ dtwPosition: event.target.value });
                        },
                        values: map(WIDGET_DTW_POSITION, (key) => WIDGET_DTW_POSITION[key]),
                    }}
                />
                <MenuRow
                    title={t('dtwSize.title')}
                    // description={t('dtwSize.description')}
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
                        max: 5,
                        marks: [
                            {
                                value: 1,
                                label: t('dtwSize.value.smaller'),
                            },
                            { value: 2 },
                            { value: 3 },
                            { value: 4 },
                            {
                                value: 5,
                                label: t('dtwSize.value.bigger'),
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

export {
    headerProps as header,
    ObserverWidgets as content,
    pageProps as props,
};

export default {
    header: headerProps,
    content: ObserverWidgets,
    props: pageProps,
};
