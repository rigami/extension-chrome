import React from 'react';
import { useTranslation } from 'react-i18next';
import useAppStateService from '@/stores/app/AppStateProvider';
import SectionHeader from '@/ui/Menu/SectionHeader';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import { Collapse } from '@material-ui/core';
import { observer } from 'mobx-react-lite';

function TimeWidget() {
    const { t } = useTranslation(['settingsWidget']);
    const { widgets } = useAppStateService();

    return (
        <React.Fragment>
            <SectionHeader title={t('time.title')} />
            <MenuRow
                title={t('time.useTime')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    value: widgets.settings.dtwUseTime,
                    onChange: (event, value) => {
                        widgets.settings.update({ dtwUseTime: value });
                    },
                }}
            />
            <Collapse in={widgets.settings.dtwUseTime}>
                <MenuRow
                    title={t('time.format12')}
                    action={{
                        type: ROWS_TYPE.CHECKBOX,
                        value: widgets.settings.dtwTimeFormat12,
                        onChange: (event, value) => {
                            widgets.settings.update({ dtwTimeFormat12: value });
                        },
                    }}
                />
            </Collapse>
        </React.Fragment>
    );
}

export default observer(TimeWidget);
