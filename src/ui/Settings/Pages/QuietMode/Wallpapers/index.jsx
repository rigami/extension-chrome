import { useTranslation } from 'react-i18next';
import React, { memo } from 'react';
import { observer } from 'mobx-react-lite';
import { useAppStateService } from '@/stores/app/appState';
import SectionHeader from '@/ui/Settings/SectionHeader';
import MenuRow, { ROWS_TYPE } from '@/ui/Settings/MenuRow';

function WallpapersSettings({ onSelect }) {
    const { t } = useTranslation(['settingsQuietMode']);
    const { wallpapersService } = useAppStateService();

    return (
        <React.Fragment>
            <SectionHeader title={t('wallpapers')} />
            <MenuRow
                title={t('dimmingPower.title')}
                description={t('dimmingPower.description')}
                action={{
                    type: ROWS_TYPE.SLIDER,
                    value: typeof wallpapersService.settings.dimmingPower === 'number'
                        ? wallpapersService.settings.dimmingPower
                        : 0,
                    onChange: (event, value) => {
                        wallpapersService.settings.update({ dimmingPower: value });
                    },
                    onChangeCommitted: (event, value) => {
                        wallpapersService.settings.update({ dimmingPower: value });
                    },
                    min: 0,
                    max: 90,
                }}
                type={ROWS_TYPE.SLIDER}
            />
        </React.Fragment>
    );
}

export default memo(observer(WallpapersSettings));
