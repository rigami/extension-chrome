import React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Collapse } from '@material-ui/core';
import { BrokenImageRounded as BrokenIcon } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';
import { BG_SELECT_MODE } from '@/enum';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import useAppStateService from '@/stores/app/AppStateProvider';
import libraryPage from '../Library';

function Specific({ onSelect }) {
    const { backgrounds } = useAppStateService();
    const { t } = useTranslation(['settingsQuietMode', 'background']);

    return (
        <Collapse in={backgrounds.settings.selectionMethod === BG_SELECT_MODE.SPECIFIC} unmountOnExit>
            <MenuRow
                description={t(`selectionMethod.value.${BG_SELECT_MODE.SPECIFIC}`, { context: 'description' })}
            />
            <MenuRow
                title={t('specificBg')}
                description={t('background:button.change')}
                action={{
                    type: ROWS_TYPE.LINK,
                    onClick: () => onSelect(libraryPage),
                    component: (
                        <Avatar
                            src={backgrounds.currentBG?.previewSrc}
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
