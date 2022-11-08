import React, { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Avatar, Box, Chip, Collapse,
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { alpha, makeStyles } from '@material-ui/core/styles';
import {
    ArrowForwardRounded as CreateCustomQueryIcon, BrokenImageRounded as BrokenIcon,
    MoreHorizRounded as MoreIcon,
    WallpaperRounded as WallpaperIcon,
    WifiOffRounded as SavedIcon,
} from '@material-ui/icons';
import clsx from 'clsx';
import { captureException } from '@sentry/react';
import {
    BG_CHANGE_INTERVAL,
    BG_SELECT_MODE,
    BG_TYPE,
} from '@/enum';
import { AutoAwesomeRounded as EditorsChoiceIcon } from '@/icons';
import MenuRow, { ROWS_TYPE } from '@/ui/Settings/MenuRow';
import { useCoreService } from '@/stores/app/core';
import { useAppStateService } from '@/stores/app/appState';
import appVariables from '@/config/config';
import Banner from '@/ui-components/Banner';
import ChangeQueryModal from './ChangeQuery';
import libraryPage from '@/ui/Settings/Pages/QuietMode/Wallpapers/Library';

const useStyles = makeStyles((theme) => ({
    chipsWrapper: {
        paddingRight: theme.spacing(1),
        overflow: 'auto',
        width: '100%',
    },
    chip: {
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),
        borderRadius: theme.shape.borderRadiusBolder,
        border: 'none',
        backgroundColor: theme.palette.background.backdrop,
        overflow: 'auto',
        maxWidth: `calc(100% - ${theme.spacing(2)}px)`,
    },
    chipLabel: { overflow: 'hidden' },
    selected: {
        borderColor: theme.palette.primary.main,
        backgroundColor: `${alpha(theme.palette.primary.main, 0.21)} !important`,
    },
    recommendedChip: {
        height: 48,
        padding: theme.spacing(1.5),
        fontFamily: theme.typography.specialFontFamily,
        fontWeight: theme.typography.body1.fontWeight,
        fontSize: theme.typography.body2.fontSize,
        '& $chipIcon': { marginRight: 0 },
    },
    chipIcon: { },
    editorChoiceChip: {
        '& $chipIcon': { color: theme.palette.favorite.main },
        '&$selected': {
            borderColor: theme.palette.favorite.main,
            backgroundColor: `${alpha(theme.palette.favorite.main, 0.14)} !important`,
        },
    },
    customQueryChip: {
        display: 'inline-flex',
        flexDirection: 'row-reverse',
        '& $chipIcon': {
            marginLeft: 0,
            marginRight: theme.spacing(0.5),
        },
    },
    bodyWrapper: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
}));

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
    const { wallpapersService } = useAppStateService();
    const [bgs, setBgs] = useState(null);

    useEffect(() => {
        wallpapersService.getLastUsage(8)
            .then((lastBgs) => setBgs(lastBgs))
            .catch((e) => {
                captureException(e);
                console.error('Failed load bg`s from db:', e);
            });
    }, [wallpapersService.count]);

    return (
        <MenuRow
            title={t('savedLibrary.title')}
            description={t('savedLibrary.description')}
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

function Stream({ onSelect }) {
    const classes = useStyles();
    const coreService = useCoreService();
    const { wallpapersService } = useAppStateService();
    const { t } = useTranslation(['settingsQuietMode']);
    const [isCustomQueryEdit, setIsCustomQueryEdit] = useState(false);

    const selected = coreService.storage.data.wallpapersStreamQuery;

    return (
        <Collapse in={wallpapersService.settings.kind === BG_SELECT_MODE.STREAM} unmountOnExit>
            <MenuRow
                description={t(`kind.value.${BG_SELECT_MODE.STREAM}`, { context: 'description' })}
            />
            <Collapse in={coreService.isOffline}>
                <MenuRow>
                    <Banner
                        variant="warn"
                        message={t('notConnectionUseLocal')}
                        description={t('notConnectionUseLocal', { context: 'description' })}
                    />
                </MenuRow>
            </Collapse>
            <MenuRow
                title={t('changeInterval.title')}
                description={t('changeInterval.description')}
                action={{
                    type: ROWS_TYPE.SELECT,
                    format: (value) => t(`changeInterval.value.${value}`),
                    value: wallpapersService.settings.changeInterval,
                    onChange: (event) => wallpapersService.settings.update({ changeInterval: event.target.value }),
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
            <Collapse in={wallpapersService.settings.changeInterval === BG_CHANGE_INTERVAL.NEVER}>
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
            <Collapse in={wallpapersService.settings.changeInterval !== BG_CHANGE_INTERVAL.NEVER}>
                <MenuRow
                    title={t('bgType.title')}
                    description={t('bgType.description')}
                    action={{
                        type: ROWS_TYPE.MULTISELECT,
                        format: (value) => t(`bgType.value.${value}`),
                        value: wallpapersService.settings.type || [],
                        onChange: (event) => {
                            if (event.target.value.length === 0) return;

                            wallpapersService.settings.update({ type: event.target.value });
                        },
                        values: [BG_TYPE.IMAGE, BG_TYPE.VIDEO, BG_TYPE.ANIMATION],
                    }}
                />
                <MenuRow
                    title={t('query.title')}
                    description={t('query.description')}
                    classes={{ bodyWrapper: classes.bodyWrapper }}
                >
                    <Box className={classes.chipsWrapper}>
                        <Chip
                            className={clsx(
                                classes.chip,
                                classes.recommendedChip,
                                classes.editorChoiceChip,
                                selected?.type === 'collection' && selected?.value === 'editors-choice' && classes.selected,
                            )}
                            classes={{
                                icon: classes.chipIcon,
                                label: classes.chipLabel,
                            }}
                            variant="outlined"
                            label={t('query.value.EDITORS_CHOICE')}
                            icon={<EditorsChoiceIcon />}
                            onClick={() => {
                                coreService.storage.update({
                                    wallpapersStreamQuery: {
                                        type: 'collection',
                                        value: 'editors-choice',
                                    },
                                    bgsStream: [],
                                    prepareBGStream: null,
                                });
                            }}
                        />
                        <Chip
                            className={clsx(
                                classes.chip,
                                classes.recommendedChip,
                                classes.savedOnlyChip,
                                selected?.type === 'saved-only' && classes.selected,
                            )}
                            classes={{
                                icon: classes.chipIcon,
                                label: classes.chipLabel,
                            }}
                            variant="outlined"
                            label={t('query.value.SAVED_ONLY')}
                            icon={<SavedIcon />}
                            onClick={() => {
                                coreService.storage.update({
                                    wallpapersStreamQuery: {
                                        type: 'saved-only',
                                        value: 'saved-only',
                                    },
                                    bgsStream: [],
                                    prepareBGStream: null,
                                });
                            }}
                        />
                        <Chip
                            className={clsx(
                                classes.chip,
                                classes.recommendedChip,
                                classes.customQueryChip,
                                selected?.type === 'custom-query' && classes.selected,
                            )}
                            classes={{
                                icon: classes.chipIcon,
                                label: classes.chipLabel,
                            }}
                            variant="outlined"
                            label={
                                selected?.type === 'custom-query'
                                    ? t(
                                        'query.custom.button.change',
                                        { query: coreService.storage.data.wallpapersStreamQuery?.value || t('unknown') },
                                    )
                                    : t('query.value.CUSTOM_QUERY')
                            }
                            icon={<CreateCustomQueryIcon />}
                            onClick={() => {
                                setIsCustomQueryEdit(true);
                            }}
                        />
                        <ChangeQueryModal
                            isOpen={isCustomQueryEdit}
                            onClose={() => { setIsCustomQueryEdit(false); }}
                        />
                    </Box>
                    <Box className={classes.chipsWrapper}>
                        {(appVariables.wallpapers.stream.queryPresets.map((query) => (
                            <Chip
                                className={clsx(
                                    classes.chip,
                                    selected?.type === 'query' && selected?.value === query && classes.selected,
                                )}
                                variant="outlined"
                                key={query}
                                label={t(`query.value.${query.toUpperCase().replaceAll(' ', '_')}`)}
                                onClick={() => {
                                    coreService.storage.update({
                                        wallpapersStreamQuery: {
                                            type: 'query',
                                            value: query,
                                        },
                                        bgsStream: [],
                                        prepareBGStream: null,
                                    });
                                }}
                            />
                        )))}
                    </Box>
                </MenuRow>
                <MemoLibraryRow onSelect={onSelect} />
            </Collapse>
        </Collapse>
    );
}

export default observer(Stream);
