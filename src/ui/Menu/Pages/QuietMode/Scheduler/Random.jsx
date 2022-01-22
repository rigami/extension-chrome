import React, { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Collapse } from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { MoreHorizRounded as MoreIcon, WallpaperRounded as WallpaperIcon } from '@material-ui/icons';
import { captureException } from '@sentry/react';
import { BG_CHANGE_INTERVAL, BG_SELECT_MODE, BG_TYPE } from '@/enum';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import useAppStateService from '@/stores/app/AppStateProvider';
import libraryPage from '@/ui/Menu/Pages/QuietMode/Library';

function BGCard({ src }) {
    return (
        <Avatar
            src={src}
            variant="rounded"
            style={{
                width: 48,
                height: 48,
                marginRight: 8,
            }}
        >
            <WallpaperIcon />
        </Avatar>
    );
}

const MemoBGCard = memo(BGCard);

function LibraryRow({ onSelect }) {
    const { t } = useTranslation(['settingsQuietMode']);
    const { backgrounds } = useAppStateService();
    const [bgs, setBgs] = useState(null);

    useEffect(() => {
        backgrounds.getLastUsage(8)
            .then((lastBgs) => setBgs(lastBgs))
            .catch((e) => {
                captureException(e);
                console.error('Failed load bg`s from db:', e);
            });
    }, [backgrounds.count]);

    return (
        <MenuRow
            title={t('library.title')}
            description={t('library.description')}
            action={{
                type: ROWS_TYPE.LINK,
                onClick: () => onSelect(libraryPage),
            }}
        >
            {bgs && bgs.map(({ previewSrc, id }) => (
                <MemoBGCard src={previewSrc} key={id} />
            ))}
            {bgs && bgs.length > 8 && (
                <Avatar
                    variant="rounded"
                    style={{
                        width: 48,
                        height: 48,
                        marginRight: 8,
                    }}
                >
                    <MoreIcon />
                </Avatar>
            )}
        </MenuRow>
    );
}

const MemoLibraryRow = memo(LibraryRow);

function Random({ onSelect }) {
    const { backgrounds } = useAppStateService();
    const { t } = useTranslation(['settingsQuietMode']);

    return (
        <Collapse in={backgrounds.settings.selectionMethod === BG_SELECT_MODE.RANDOM} unmountOnExit>
            <MenuRow
                description={t(`selectionMethod.value.${BG_SELECT_MODE.RANDOM}`, { context: 'description' })}
            />
            <MemoLibraryRow onSelect={onSelect} />
            <MenuRow
                title={t('changeInterval.title')}
                description={t('changeInterval.description')}
                action={{
                    type: ROWS_TYPE.SELECT,
                    format: (value) => t(`changeInterval.value.${value}`),
                    value: backgrounds.settings.changeInterval,
                    onChange: (event) => backgrounds.settings.update({ changeInterval: event.target.value }),
                    values: [
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
            <MenuRow
                title={t('bgType.title')}
                description={t('bgType.description')}
                action={{
                    type: ROWS_TYPE.MULTISELECT,
                    format: (value) => t(`bgType.value.${value}`),
                    value: backgrounds.settings.type || [],
                    onChange: (event) => {
                        if (event.target.value.length === 0) return;

                        backgrounds.settings.update({ type: event.target.value });
                    },
                    values: [
                        BG_TYPE.IMAGE, BG_TYPE.ANIMATION, BG_TYPE.VIDEO,
                        // BG_TYPE.FILL_COLOR,
                    ],
                }}
            />
        </Collapse>
    );
}

export default observer(Random);
