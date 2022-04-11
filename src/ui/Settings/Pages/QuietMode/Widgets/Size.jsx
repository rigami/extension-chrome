import React from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import MenuRow, { ROWS_TYPE } from '@/ui/Settings/MenuRow';
import { WIDGET_SIZE } from '@/enum';
import { useAppStateService } from '@/stores/app/appState';

const numberToEnumSize = (value) => [
    WIDGET_SIZE.SMALLER,
    WIDGET_SIZE.SMALL,
    WIDGET_SIZE.MIDDLE,
    WIDGET_SIZE.BIG,
    WIDGET_SIZE.BIGGER,
][value - 1];

const enumSizeToNumber = (value) => [
    WIDGET_SIZE.SMALLER,
    WIDGET_SIZE.SMALL,
    WIDGET_SIZE.MIDDLE,
    WIDGET_SIZE.BIG,
    WIDGET_SIZE.BIGGER,
].findIndex((size) => size === value) + 1;

function WidgetsSize() {
    const { t } = useTranslation(['settingsQuietMode']);
    const { desktopService } = useAppStateService();

    return (
        <MenuRow
            title={t('widgets.size.title')}
            // description={t('widgets.size.description')}
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
                        label: t('widgets.size.value.smaller'),
                    },
                    { value: 2 },
                    { value: 3 },
                    { value: 4 },
                    {
                        value: 5,
                        label: t('widgets.size.value.bigger'),
                    },
                ],
                step: 1,
                valueLabelDisplay: 'off',
            }}
        />
    );
}

export default observer(WidgetsSize);
