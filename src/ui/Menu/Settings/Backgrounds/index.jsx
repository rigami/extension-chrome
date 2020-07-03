import React, { useState, useEffect, memo } from 'react';
import { useObserver, observer } from 'mobx-react-lite';
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
import locale from '@/i18n/RU';
import SectionHeader from '@/ui/Menu/SectionHeader';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import FSConnector from '@/utils/fsConnector';
import { useService as useBackgroundsService } from '@/stores/backgrounds';
import { content as LibraryPageContent, header as LibraryPageHeader } from './Library';

const headerProps = { title: locale.settings.backgrounds.title };

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
    return (
        <MenuRow
            title={locale.settings.backgrounds.general.library.title}
            description={locale.settings.backgrounds.general.library.description(bgs && bgs.length)}
            action={{
                type: ROWS_TYPE.LINK,
                onClick: () => onSelect({
                    content: LibraryPageContent,
                    header: LibraryPageHeader,
                }),
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
            <SectionHeader title={locale.settings.backgrounds.general.title} />
            <MemoLibraryRow bgs={bgs} onSelect={onSelect} />
            <MenuRow
                title={locale.settings.backgrounds.general.dimming_power.title}
                description={locale.settings.backgrounds.general.dimming_power.description}
                action={{
                    type: ROWS_TYPE.SLIDER,
                    value: typeof backgroundsStore.dimmingPower === 'number' ? backgroundsStore.dimmingPower : 0,
                    onChange: (event, value) => {
                        backgroundsStore.setDimmingPower(value, false);
                    },
                    onChangeCommitted: (event, value) => {
                        backgroundsStore.setDimmingPower(value, true);
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

    return useObserver(() => (
        <React.Fragment>
            <SectionHeader title={locale.settings.backgrounds.scheduler.title} />
            <MenuRow
                title={locale.settings.backgrounds.scheduler.selection_method.title}
                description={locale.settings.backgrounds.scheduler.selection_method.description}
                action={{
                    type: ROWS_TYPE.SELECT,
                    locale: locale.settings.backgrounds.scheduler.selection_method,
                    value: backgroundsStore.selectionMethod,
                    onChange: (event) => backgroundsStore.setSelectionMethod(event.target.value),
                    values: [BG_SELECT_MODE.RANDOM, BG_SELECT_MODE.SPECIFIC],
                }}
            />
            <Collapse in={backgroundsStore.selectionMethod === BG_SELECT_MODE.SPECIFIC}>
                <MenuRow
                    title="Фон рабочего стола"
                    description="Измените фон рабочего стола"
                    action={{
                        type: ROWS_TYPE.LINK,
                        onClick: () => onSelect({
                            content: LibraryPageContent,
                            header: LibraryPageHeader,
                        }),
                        component: (
                            <Avatar
                                src={
                                    backgroundsStore.currentBGId
                                    && FSConnector.getURL(backgroundsStore.getCurrentBG().fileName, 'preview')
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
            <Collapse in={backgroundsStore.selectionMethod === BG_SELECT_MODE.RANDOM}>
                <MenuRow
                    title={locale.settings.backgrounds.scheduler.change_interval.title}
                    description={locale.settings.backgrounds.scheduler.change_interval.description}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        locale: locale.settings.backgrounds.scheduler.change_interval,
                        value: backgroundsStore.changeInterval,
                        onChange: (event) => backgroundsStore.setChangeInterval(event.target.value),
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
                    title={locale.settings.backgrounds.scheduler.bg_type.title}
                    description={locale.settings.backgrounds.scheduler.bg_type.description}
                    action={{
                        type: ROWS_TYPE.MULTISELECT,
                        locale: locale.settings.backgrounds.scheduler.bg_type,
                        value: backgroundsStore.bgType || [],
                        onChange: (event) => backgroundsStore.setBgType(event.target.value),
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
    ));
}

const MemoSchedulerSection = memo(SchedulerSection);

function BackgroundsMenu({ onSelect }) {
    return useObserver(() => (
        <React.Fragment>
            <MemoBackgroundsSection onSelect={onSelect} />
            <MemoSchedulerSection onSelect={onSelect} />
        </React.Fragment>
    ));
}

export { headerProps as header, BackgroundsMenu as content };
