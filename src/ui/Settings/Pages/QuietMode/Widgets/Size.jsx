import React from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import MenuRow, { ROWS_TYPE } from '@/ui/Settings/MenuRow';
import { WIDGET_DTW_SIZE } from '@/enum';
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

function WidgetsSize() {
    const { t } = useTranslation(['settingsQuietMode']);
    const { desktopService } = useAppStateService();

    return (
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
    );
}

export default observer(WidgetsSize);
