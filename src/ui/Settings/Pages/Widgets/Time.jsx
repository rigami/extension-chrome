import React from 'react';
import { useTranslation } from 'react-i18next';
import { Collapse } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { useAppStateService } from '@/stores/app/appState';
import SectionHeader from '@/ui/Settings/SectionHeader';
import MenuRow, { ROWS_TYPE } from '@/ui/Settings/MenuRow';

function TimeWidget() {
    const { t } = useTranslation(['settingsWidget']);
    const { widgetsService } = useAppStateService();

    return (
        <React.Fragment>
            <SectionHeader title={t('time.title')} />
            <MenuRow
                title={t('time.useTime')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    value: widgetsService.settings.useTime,
                    onChange: (event, value) => {
                        widgetsService.settings.update({ useTime: value });
                    },
                }}
            />
            <Collapse in={widgetsService.settings.useTime}>
                <MenuRow
                    title={t('time.format12')}
                    action={{
                        type: ROWS_TYPE.CHECKBOX,
                        value: widgetsService.settings.timeFormat12,
                        onChange: (event, value) => {
                            widgetsService.settings.update({ timeFormat12: value });
                        },
                    }}
                />
            </Collapse>
        </React.Fragment>
    );
}

export default observer(TimeWidget);
