import React, { useState, useEffect, memo } from 'react';
import { observer } from 'mobx-react-lite';
import { Avatar } from '@material-ui/core';
import {
    WallpaperRounded as WallpaperIcon,
    MoreHorizRounded as MoreIcon,
} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import SectionHeader from '@/ui/Menu/SectionHeader';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import useAppStateService from '@/stores/app/AppStateProvider';
import { captureException } from '@sentry/react';
import libraryPage from './Library';
import SchedulerSection from './Scheduler';

const headerProps = { title: 'settings:backgrounds' };
const pageProps = { width: 750 };

function BGCard({ src }) {
    return (
        <Avatar
            src={src} variant="rounded" style={{
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

function LibraryRow({ bgs, onSelect }) {
    const { t } = useTranslation(['settingsBackground']);

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
                    variant="rounded" style={{
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

function BackgroundsSection({ onSelect }) {
    const { backgrounds } = useAppStateService();
    const { t } = useTranslation(['settingsBackground']);
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
        <React.Fragment>
            <SectionHeader title={t('general')} />
            <MemoLibraryRow bgs={bgs} onSelect={onSelect} />
            <MenuRow
                title={t('dimmingPower.title')}
                description={t('dimmingPower.description')}
                action={{
                    type: ROWS_TYPE.SLIDER,
                    value: typeof backgrounds.settings.dimmingPower === 'number'
                        ? backgrounds.settings.dimmingPower
                        : 0,
                    onChange: (event, value) => {
                        backgrounds.settings.update({ dimmingPower: value });
                    },
                    onChangeCommitted: (event, value) => {
                        backgrounds.settings.update({ dimmingPower: value });
                    },
                    min: 0,
                    max: 90,
                }}
                type={ROWS_TYPE.SLIDER}
            />
        </React.Fragment>
    );
}

const MemoBackgroundsSection = memo(observer(BackgroundsSection));

function BackgroundsMenu({ onSelect }) {
    return (
        <React.Fragment>
            <MemoBackgroundsSection onSelect={onSelect} />
            <SchedulerSection onSelect={onSelect} />
        </React.Fragment>
    );
}

const ObserverBackgroundsMenu = observer(BackgroundsMenu);

export {
    headerProps as header,
    ObserverBackgroundsMenu as content,
    pageProps as props,
};

export default {
    header: headerProps,
    content: ObserverBackgroundsMenu,
    props: pageProps,
};
