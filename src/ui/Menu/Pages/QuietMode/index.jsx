import React, { useState, useEffect, memo } from 'react';
import { observer } from 'mobx-react-lite';
import { Avatar, Collapse, Divider } from '@material-ui/core';
import {
    WallpaperRounded as WallpaperIcon,
    MoreHorizRounded as MoreIcon,
} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { captureException } from '@sentry/react';
import { map } from 'lodash';
import SectionHeader from '@/ui/Menu/SectionHeader';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import useAppStateService from '@/stores/app/AppStateProvider';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import useAppService from '@/stores/app/AppStateProvider';
import {
    BKMS_FAP_ALIGN, BKMS_FAP_POSITION, BKMS_FAP_STYLE, WIDGET_DTW_POSITION, WIDGET_DTW_SIZE,
} from '@/enum';
import MenuInfo from '@/ui/Menu/MenuInfo';
import SchedulerSection from './Scheduler';
import libraryPage from './Library';

const headerProps = { title: 'settings:quietMode' };
const pageProps = { width: 750 };

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

function LibraryRow({ bgs, onSelect }) {
    const { t } = useTranslation(['settingsQuietMode']);

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

function BackgroundsSection({ onSelect }) {
    const { backgrounds } = useAppStateService();
    const { t } = useTranslation(['settingsQuietMode']);
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
            <SectionHeader title={t('backgrounds')} />
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

const numberToEnumSize = (value) => [
    WIDGET_DTW_SIZE.SMALLER,
    WIDGET_DTW_SIZE.SMALL,
    WIDGET_DTW_SIZE.MIDDLE,
    WIDGET_DTW_SIZE.BIG,
    WIDGET_DTW_SIZE.BIGGER,
][value - 1];

const enumSizeToNumber = (value) => [
    WIDGET_DTW_SIZE.SMALLER,
    WIDGET_DTW_SIZE.SMALL,
    WIDGET_DTW_SIZE.MIDDLE,
    WIDGET_DTW_SIZE.BIG,
    WIDGET_DTW_SIZE.BIGGER,
].findIndex((size) => size === value) + 1;

function WidgetsSettings() {
    const bookmarksService = useBookmarksService();
    const { widgets } = useAppService();
    const { t } = useTranslation(['settingsQuietMode']);

    return (
        <React.Fragment>
            <SectionHeader title={t('widgets')} />
            <MenuRow
                title={t('useWidgetsOnDesktop.title')}
                description={t('useWidgetsOnDesktop.description')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    value: widgets.settings.useWidgets,
                    onChange: (event, value) => {
                        widgets.settings.update({ useWidgets: value });
                    },
                }}
                type={ROWS_TYPE.CHECKBOX}
            />
            <Collapse in={widgets.settings.useWidgets}>
                <MenuRow
                    title={t('dtwPlace.title')}
                    // description={t('dtwPlace.description')}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => t(`dtwPlace.value.${value}`),
                        value: widgets.settings.dtwPosition,
                        onChange: (event) => {
                            widgets.settings.update({ dtwPosition: event.target.value });
                        },
                        values: map(WIDGET_DTW_POSITION, (key) => WIDGET_DTW_POSITION[key]),
                    }}
                />
                <MenuRow
                    title={t('dtwSize.title')}
                    // description={t('dtwSize.description')}
                    action={{
                        type: ROWS_TYPE.SLIDER,
                        value: enumSizeToNumber(widgets.settings.dtwSize),
                        onChange: (event, value) => {
                            console.log('onChange', value, numberToEnumSize(value));
                            widgets.settings.update({ dtwSize: numberToEnumSize(value) });
                        },
                        onChangeCommitted: (event, value) => {
                            widgets.settings.update({ dtwSize: numberToEnumSize(value) });
                        },
                        min: 1,
                        max: 5,
                        marks: [
                            {
                                value: 1,
                                label: t('dtwSize.value.smaller'),
                            },
                            { value: 2 },
                            { value: 3 },
                            { value: 4 },
                            {
                                value: 5,
                                label: t('dtwSize.value.bigger'),
                            },
                        ],
                        step: 1,
                        valueLabelDisplay: 'off',
                    }}
                />
            </Collapse>
        </React.Fragment>
    );
}

const ObserverWidgetsSettings = observer(WidgetsSettings);

function FAPSettings() {
    const bookmarksService = useBookmarksService();
    const { widgets } = useAppService();
    const { t } = useTranslation(['settingsQuietMode']);

    return (
        <React.Fragment>
            <SectionHeader title={t('fap')} />
            <MenuRow
                title={t('useFap.title')}
                description={t('useFap.description')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    value: bookmarksService.settings.fapStyle !== BKMS_FAP_STYLE.HIDDEN,
                    onChange: (event, value) => bookmarksService.settings
                        .update({ fapStyle: value ? BKMS_FAP_STYLE.CONTAINED : BKMS_FAP_STYLE.HIDDEN }),
                }}
            />
            <MenuInfo
                show={(
                    bookmarksService.settings.fapStyle !== BKMS_FAP_STYLE.HIDDEN
                    && bookmarksService.favorites.length === 0
                )}
                message={t('fapEmptyWarningMessage')}
            />
            <Collapse in={bookmarksService.settings.fapStyle !== BKMS_FAP_STYLE.HIDDEN}>
                <MenuRow
                    title={t('fapStyle.title')}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => t(`fapStyle.value.${value}`),
                        value: bookmarksService.settings.fapStyle,
                        onChange: (event) => bookmarksService.settings.update({ fapStyle: event.target.value }),
                        values: [BKMS_FAP_STYLE.CONTAINED, BKMS_FAP_STYLE.TRANSPARENT, BKMS_FAP_STYLE.PRODUCTIVITY],
                    }}
                />
                <MenuRow
                    title={t('fapPosition.title')}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => t(`fapPosition.value.${value}`),
                        value: bookmarksService.settings.fapPosition,
                        onChange: (event) => bookmarksService.settings.update({ fapPosition: event.target.value }),
                        values: [BKMS_FAP_POSITION.TOP, BKMS_FAP_POSITION.BOTTOM],
                    }}
                />
                <MenuRow
                    title={t('fapAlign.title')}
                    action={{
                        type: ROWS_TYPE.SELECT,
                        format: (value) => t(`fapAlign.value.${value}`),
                        value: bookmarksService.settings.fapAlign,
                        onChange: (event) => bookmarksService.settings.update({ fapAlign: event.target.value }),
                        values: [BKMS_FAP_ALIGN.LEFT, BKMS_FAP_ALIGN.CENTER],
                    }}
                />
            </Collapse>
        </React.Fragment>
    );
}

const ObserverFAPSettings = observer(FAPSettings);

function BackgroundsMenu({ onSelect }) {
    return (
        <React.Fragment>
            <ObserverWidgetsSettings />
            <Divider variant="middle" />
            <ObserverFAPSettings />
            <Divider variant="middle" />
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
    id: 'quietMode',
    header: headerProps,
    content: ObserverBackgroundsMenu,
    props: pageProps,
};
