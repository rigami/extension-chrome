import React from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { map } from 'lodash';
import MenuRow, { ROWS_TYPE } from '@/ui/Settings/MenuRow';
import { WIDGET_DTW_POSITION } from '@/enum';
import { useAppStateService } from '@/stores/app/appState';

function WidgetsPosition() {
    const { t } = useTranslation(['settingsQuietMode']);
    const { desktopService } = useAppStateService();

    return (
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
    );
}

export default observer(WidgetsPosition);
