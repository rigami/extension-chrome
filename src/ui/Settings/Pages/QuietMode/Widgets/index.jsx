import React from 'react';
import { useTranslation } from 'react-i18next';
import { Collapse } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import SectionHeader from '@/ui/Settings/SectionHeader';
import MenuRow, { ROWS_TYPE } from '@/ui/Settings/MenuRow';
import { useAppStateService } from '@/stores/app/appState';
import WidgetsSize from './Size';
import WidgetsPosition from './Position';

function WidgetsSettings() {
    const { desktopService } = useAppStateService();
    const { t } = useTranslation(['settingsQuietMode']);

    return (
        <React.Fragment>
            <SectionHeader title={t('widgets.title')} />
            <MenuRow
                title={t('widgets.useOnDesktop.title')}
                description={t('widgets.useOnDesktop.description')}
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
                <WidgetsPosition />
                <WidgetsSize />
            </Collapse>
        </React.Fragment>
    );
}

export default observer(WidgetsSettings);
