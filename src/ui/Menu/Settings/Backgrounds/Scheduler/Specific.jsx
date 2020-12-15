import React from 'react';
import useBackgroundsService from '@/stores/BackgroundsStateProvider';
import { useTranslation } from 'react-i18next';
import { Avatar, Collapse } from '@material-ui/core';
import { BG_SELECT_MODE } from '@/enum';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import libraryPage from '../Library';
import FSConnector from '@/utils/fsConnector';
import { BrokenImageRounded as BrokenIcon } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';

function Specific({ onSelect }) {
    const backgroundsStore = useBackgroundsService();
    const { t } = useTranslation();

    return (
        <Collapse in={backgroundsStore.settings.selectionMethod === BG_SELECT_MODE.SPECIFIC}>
            <MenuRow
                title={t('bg.title')}
                description={t('bg.change')}
                action={{
                    type: ROWS_TYPE.LINK,
                    onClick: () => onSelect(libraryPage),
                    component: (
                        <Avatar
                            src={
                                backgroundsStore.currentBGId
                                && FSConnector.getBGURL(backgroundsStore.getCurrentBG().fileName, 'preview')
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
