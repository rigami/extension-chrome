import React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Collapse } from '@material-ui/core';
import { BrokenImageRounded as BrokenIcon } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';
import { BG_SELECT_MODE } from '@/enum';
import MenuRow, { ROWS_TYPE } from '@/ui/Settings/MenuRow';
import { useAppStateService } from '@/stores/app/appState';
import libraryPage from '../Library';
import { useCoreService } from '@/stores/app/core';

function Specific({ onSelect }) {
    const coreService = useCoreService();
    const { wallpapersService } = useAppStateService();
    const { t } = useTranslation(['settingsQuietMode', 'wallpaper']);

    return (
        <Collapse in={wallpapersService.settings.kind === BG_SELECT_MODE.SPECIFIC} unmountOnExit>
            <MenuRow
                description={t(`kind.value.${BG_SELECT_MODE.SPECIFIC}`, { context: 'description' })}
            />
            <MenuRow
                title={t('specificBg')}
                description={t('wallpaper:button.change')}
                action={{
                    type: ROWS_TYPE.LINK,
                    onClick: () => onSelect(libraryPage),
                    component: (
                        <Avatar
                            src={coreService.storage.data.bgCurrent?.previewSrc}
                            variant="rounded"
                            style={{
                                width: 48,
                                height: 48,
                                marginRight: 8,
                            }}
                        >
                            <BrokenIcon />
                        </Avatar>
                    ),
                }}
            />
        </Collapse>
    );
}

export default observer(Specific);
