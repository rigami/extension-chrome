import React, { useState, useEffect, memo } from 'react';
import { observer } from 'mobx-react-lite';
import { BG_CHANGE_INTERVAL, BG_TYPE, BG_SELECT_MODE } from '@/enum';
import {
    Avatar,
    Collapse,
} from '@material-ui/core';
import {
    WallpaperRounded as WallpaperIcon,
    MoreHorizRounded as MoreIcon,
    BrokenImageRounded as BrokenIcon,
} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import SectionHeader from '@/ui/Menu/SectionHeader';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import FSConnector from '@/utils/fsConnector';
import useBackgroundsService from '@/stores/BackgroundsStateProvider';
import libraryPage from './Library';

const headerProps = { title: 'settings.bg.title' };
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
    const { t } = useTranslation();

    return (
        <MenuRow
            title={t('settings.bg.general.library.title')}
            description={t('settings.bg.general.library.description', bgs && bgs.length)}
            action={{
                type: ROWS_TYPE.LINK,
                onClick: () => onSelect(libraryPage),
            }}
        >
            {bgs && bgs.slice(0, 8).map((src) => (
                <MemoBGCard src={src} key={src} />
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
    const backgroundsStore = useBackgroundsService();
    const { t } = useTranslation();
    const [bgs, setBgs] = useState(null);

    useEffect(() => {
        backgroundsStore.getSrcs({ type: 'preview' })
            .then((links) => setBgs(links))
            .catch((e) => {
                console.error('Failed load bg`s from db:', e);
            });
    }, [backgroundsStore.count]);

    return (
        <React.Fragment>
            <SectionHeader title={t('settings.bg.general.title')} />
            <MemoLibraryRow bgs={bgs} onSelect={onSelect} />
            <MenuRow
                title={t('settings.bg.general.dimmingPower.title')}
                description={t('settings.bg.general.dimmingPower.description')}
                action={{
                    type: ROWS_TYPE.SLIDER,
                    value: typeof backgroundsStore.settings.dimmingPower === 'number'
                        ? backgroundsStore.settings.dimmingPower
                        : 0,
                    onChange: (event, value) => {
                        backgroundsStore.settings.update({ dimmingPower: value });
                    },
                    onChangeCommitted: (event, value) => {
                        backgroundsStore.settings.update({ dimmingPower: value });
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

function SchedulerSection({ onSelect }) {
    const backgroundsStore = useBackgroundsService();
    const { t } = useTranslation();

    return (
        <React.Fragment>
            <SectionHeader title={t('settings.bg.scheduler.title')} />
            <MenuRow
                title={t('settings.bg.scheduler.selectionMethod.title')}
                description={t('settings.bg.scheduler.selectionMethod.description')}
                action={{
                    type: ROWS_TYPE.SELECT,
                    format: (value) => t(`settings.bg.scheduler.selectionMethod.method.${value}`),
                    value: backgroundsStore.settings.selectionMethod,
                    onChange: (event) => backgroundsStore.settings.update({ selectionMethod: event.target.value }),
                    values: [BG_SELECT_MODE.RANDOM, BG_SELECT_MODE.SPECIFIC],
                }}
            />
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
            <Collapse in={backgroundsStore.settings.selectionMethod === BG_SELECT_MODE.RANDOM}>
                <MenuRow
                    title={t('settings.bg.scheduler.changeInterval.title')}
                    description={t('settings.bg.scheduler.changeInterval.description')}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => t(`settings.bg.scheduler.changeInterval.interval.${value}`),
                        value: backgroundsStore.settings.changeInterval,
                        onChange: (event) => backgroundsStore.settings.update({ changeInterval: event.target.value }),
                        values: [
                            BG_CHANGE_INTERVAL.OPEN_TAB,
                            BG_CHANGE_INTERVAL.MINUTES_30,
                            BG_CHANGE_INTERVAL.HOURS_1,
                            BG_CHANGE_INTERVAL.HOURS_6,
                            BG_CHANGE_INTERVAL.HOURS_12,
                            BG_CHANGE_INTERVAL.DAY_1,
                        ],
                    }}
                />
                <MenuRow
                    title={t('settings.bg.scheduler.BGType.title')}
                    description={t('settings.bg.scheduler.BGType.description')}
                    action={{
                        type: ROWS_TYPE.MULTISELECT,
                        format: (value) => t(`settings.bg.scheduler.BGType.type.${value}`),
                        value: backgroundsStore.settings.type || [],
                        onChange: (event) => {
                            if (event.target.value.length === 0) return;

                            backgroundsStore.settings.update({ type: event.target.value })
                        },
                        values: [
                            BG_TYPE.IMAGE,
                            BG_TYPE.ANIMATION,
                            BG_TYPE.VIDEO,
                            BG_TYPE.FILL_COLOR,
                        ],
                    }}
                />
            </Collapse>
        </React.Fragment>
    );
}

const MemoSchedulerSection = memo(observer(SchedulerSection));

function BackgroundsMenu({ onSelect }) {
    return (
        <React.Fragment>
            <MemoBackgroundsSection onSelect={onSelect} />
            <MemoSchedulerSection onSelect={onSelect} />
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

