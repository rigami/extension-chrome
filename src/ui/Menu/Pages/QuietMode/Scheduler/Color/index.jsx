import { useTranslation } from 'react-i18next';
import {
    Collapse,
    ImageList,
    ImageListItem,
} from '@material-ui/core';
import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { BG_CHANGE_INTERVAL, BG_SELECT_MODE } from '@/enum';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import useAppStateService from '@/stores/app/AppStateProvider';
import colors from '@/config/colors';
import { eventToBackground } from '@/stores/universal/serviceBus';
import gradientsLibraryPage, { ColorPreview } from './Library';
import useCoreService from '@/stores/app/BaseStateProvider';

const useStyles = makeStyles((theme) => ({
    grid: { width: '100%' },
    rowBody: { flexDirection: 'column' },
}));

function Gradient({ onSelect }) {
    const classes = useStyles();
    const { backgrounds } = useAppStateService();
    const { t } = useTranslation(['settingsQuietMode', 'background']);
    const coreService = useCoreService();

    return (
        <Collapse in={backgrounds.settings.kind === BG_SELECT_MODE.COLOR} unmountOnExit>
            <MenuRow
                description={t(`kind.value.${BG_SELECT_MODE.COLOR}`, { context: 'description' })}
            />
            <MenuRow
                title={t('changeInterval.title')}
                description={t('changeInterval.description')}
                action={{
                    type: ROWS_TYPE.SELECT,
                    format: (value) => t(`changeInterval.value.${value}`),
                    value: backgrounds.settings.changeInterval,
                    onChange: (event) => backgrounds.settings.update({ changeInterval: event.target.value }),
                    values: [
                        BG_CHANGE_INTERVAL.NEVER,
                        BG_CHANGE_INTERVAL.OPEN_TAB,
                        BG_CHANGE_INTERVAL.MINUTES_5,
                        BG_CHANGE_INTERVAL.MINUTES_30,
                        BG_CHANGE_INTERVAL.HOURS_1,
                        BG_CHANGE_INTERVAL.HOURS_6,
                        BG_CHANGE_INTERVAL.HOURS_12,
                        BG_CHANGE_INTERVAL.DAY_1,
                    ],
                }}
            />
            <MenuRow classes={{ bodyWrapper: classes.rowBody }}>
                <ImageList
                    className={classes.grid}
                    cellHeight={120}
                    cols={3}
                    gap={8}
                >
                    {colors.slice(0, 12).map((color) => (
                        <ImageListItem key={`${color.angle}-${color.colors.join(', ')}`}>
                            <ColorPreview
                                angle={color.angle}
                                name={color.name}
                                contrastColor={color.contrastColor}
                                colors={color.colors}
                                select={coreService.storage.persistent.data.bgCurrent?.id === color.id}
                                onSet={() => {
                                    eventToBackground('wallpapers/set', {
                                        kind: 'color',
                                        ...color,
                                    });
                                }}
                            />
                        </ImageListItem>
                    ))}
                </ImageList>
            </MenuRow>
            <MenuRow
                title={t('showMore')}
                action={{
                    type: ROWS_TYPE.LINK,
                    onClick: () => { onSelect(gradientsLibraryPage); },
                }}
            />
        </Collapse>
    );
}

export default observer(Gradient);
