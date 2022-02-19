import React from 'react';
import { useTranslation } from 'react-i18next';
import { Collapse } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import { useAppStateService } from '@/stores/app/appState';
import SectionHeader from '@/ui/Settings/SectionHeader';
import MenuRow, { ROWS_TYPE } from '@/ui/Settings/MenuRow';
import { BKMS_FAP_ALIGN, BKMS_FAP_POSITION, BKMS_FAP_STYLE } from '@/enum';
import Banner from '@/ui-components/Banner';

function FAPSettings() {
    const workingSpaceService = useWorkingSpaceService();
    const { desktopService } = useAppStateService();
    const { t } = useTranslation(['settingsQuietMode']);

    return (
        <React.Fragment>
            <SectionHeader title={t('fap')} />
            <MenuRow
                title={t('useFap.title')}
                description={t('useFap.description')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    value: desktopService.settings.fapStyle !== BKMS_FAP_STYLE.HIDDEN,
                    onChange: (event, value) => desktopService.settings
                        .update({ fapStyle: value ? BKMS_FAP_STYLE.CONTAINED : BKMS_FAP_STYLE.HIDDEN }),
                }}
            />
            <Collapse
                in={(
                    desktopService.settings.fapStyle !== BKMS_FAP_STYLE.HIDDEN
                    && workingSpaceService.favorites.length === 0
                )}
            >
                <MenuRow>
                    <Banner message={t('fapEmptyWarningMessage')} />
                </MenuRow>
            </Collapse>
            <Collapse in={desktopService.settings.fapStyle !== BKMS_FAP_STYLE.HIDDEN}>
                <MenuRow
                    title={t('fapStyle.title')}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => t(`fapStyle.value.${value}`),
                        value: desktopService.settings.fapStyle,
                        onChange: (event) => desktopService.settings.update({ fapStyle: event.target.value }),
                        values: [BKMS_FAP_STYLE.CONTAINED, BKMS_FAP_STYLE.TRANSPARENT, BKMS_FAP_STYLE.PRODUCTIVITY],
                    }}
                />
                <MenuRow
                    title={t('fapPosition.title')}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => t(`fapPosition.value.${value}`),
                        value: desktopService.settings.fapPosition,
                        onChange: (event) => desktopService.settings.update({ fapPosition: event.target.value }),
                        values: [BKMS_FAP_POSITION.TOP, BKMS_FAP_POSITION.BOTTOM],
                    }}
                />
                <MenuRow
                    title={t('fapAlign.title')}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => t(`fapAlign.value.${value}`),
                        value: desktopService.settings.fapAlign,
                        onChange: (event) => desktopService.settings.update({ fapAlign: event.target.value }),
                        values: [BKMS_FAP_ALIGN.LEFT, BKMS_FAP_ALIGN.CENTER],
                    }}
                />
            </Collapse>
        </React.Fragment>
    );
}

export default observer(FAPSettings);
