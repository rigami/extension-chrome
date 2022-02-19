import React from 'react';
import { useTranslation } from 'react-i18next';
import { Collapse } from '@material-ui/core';
import { map } from 'lodash';
import { observer } from 'mobx-react-lite';
import SectionHeader from '@/ui/Settings/SectionHeader';
import MenuRow, { ROWS_TYPE } from '@/ui/Settings/MenuRow';
import { WIDGET_DTW_POSITION, WIDGET_DTW_SIZE } from '@/enum';
import { useAppStateService } from '@/stores/app/appState';

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

function WidgetsSettings() {
    const { desktopService } = useAppStateService();
    const { t } = useTranslation(['settingsQuietMode']);

    return (
        <React.Fragment>
            <SectionHeader title={t('widgets')} />
            <MenuRow
                title={t('useWidgetsOnDesktop.title')}
                description={t('useWidgetsOnDesktop.description')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    value: desktopService.settings.useWidgets,
                    onChange: (event, value) => {
                        desktopService.settings.update({ useWidgets: value });
                    },
                }}
                type={ROWS_TYPE.CHECKBOX}
            />
            <Collapse in={desktopService.settings.useWidgets}>
                <MenuRow
                    title={t('dtwPlace.title')}
                    // description={t('dtwPlace.description')}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => t(`dtwPlace.value.${value}`),
                        value: desktopService.settings.widgetsPosition,
                        onChange: (event) => {
                            desktopService.settings.update({ widgetsPosition: event.target.value });
                        },
                        values: map(WIDGET_DTW_POSITION, (key) => WIDGET_DTW_POSITION[key]),
                    }}
                />
                <MenuRow
                    title={t('dtwSize.title')}
                    // description={t('dtwSize.description')}
                    action={{
                        type: ROWS_TYPE.SLIDER,
                        value: enumSizeToNumber(desktopService.settings.widgetsSize),
                        onChange: (event, value) => {
                            console.log('onChange', value, numberToEnumSize(value));
                            desktopService.settings.update({ widgetsSize: numberToEnumSize(value) });
                        },
                        onChangeCommitted: (event, value) => {
                            desktopService.settings.update({ widgetsSize: numberToEnumSize(value) });
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
            </Collapse>
        </React.Fragment>
    );
}

export default observer(WidgetsSettings);
