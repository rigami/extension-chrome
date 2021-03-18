import React from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Collapse } from '@material-ui/core';
import { BG_SELECT_MODE } from '@/enum';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import FSConnector from '@/utils/fsConnector';
import { BrokenImageRounded as BrokenIcon } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';
import useAppStateService from '@/stores/app/AppStateProvider';
import libraryPage from '../Library';

function Specific({ onSelect }) {
    const { backgrounds } = useAppStateService();
    const { t } = useTranslation(['settingsBackground', 'background']);

    return (
        <Collapse in={backgrounds.settings.selectionMethod === BG_SELECT_MODE.SPECIFIC}>
            <MenuRow
                title={t('specificBg')}
                description={t('background:button.change')}
                action={{
                    type: ROWS_TYPE.LINK,
                    onClick: () => onSelect(libraryPage),
                    component: (
                        <Avatar
                            src={
                                backgrounds.currentBGId
                                && FSConnector.getBGURL(backgrounds.currentBG.fileName, 'preview')
                            }
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
