import React, { memo, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import {
    Avatar,
    Collapse, Fade,
    LinearProgress,
    Tab,
    Tabs,
} from '@material-ui/core';
import { captureException } from '@sentry/react';
import { MoreHorizRounded as MoreIcon, WallpaperRounded as WallpaperIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { BG_SELECT_MODE, BG_SHOW_STATE, BG_TYPE } from '@/enum';
import SectionHeader from '@/ui/Menu/SectionHeader';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import useAppStateService from '@/stores/app/AppStateProvider';
import Stream from './Stream';
import Random from './Random';
import Specific from './Specific';
import libraryPage from '@/ui/Menu/Pages/QuietMode/Library';

const useStyles = makeStyles((theme) => ({
    tabs: {
        margin: theme.spacing(0, 4),
        marginBottom: theme.spacing(1),
    },
    linearProgress: {
        marginTop: theme.spacing(-0.25),
        marginBottom: theme.spacing(-0.25),
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

function SchedulerSection({ onSelect }) {
    const { backgrounds } = useAppStateService();
    const { t } = useTranslation(['settingsQuietMode']);
    const classes = useStyles();

    return (
        <React.Fragment>
            <SectionHeader h={2} title={t('scheduler')} />
            <Tabs
                className={classes.tabs}
                indicatorColor="primary"
                variant="fullWidth"
                value={backgrounds.settings.selectionMethod}
                onChange={(event, newValue) => {
                    if (newValue === BG_SELECT_MODE.STREAM) {
                        backgrounds.settings.update({
                            type: backgrounds.settings.type.filter((type) => (
                                type !== BG_TYPE.ANIMATION
                                && type !== BG_TYPE.FILL_COLOR
                            )),
                        });
                    }
                    backgrounds.settings.update({ selectionMethod: newValue });
                }}
            >
                <Tab value={BG_SELECT_MODE.STREAM} label={t(`selectionMethod.value.${BG_SELECT_MODE.STREAM}`)} />
                <Tab value={BG_SELECT_MODE.RANDOM} label={t(`selectionMethod.value.${BG_SELECT_MODE.RANDOM}`)} />
                <Tab value={BG_SELECT_MODE.SPECIFIC} label={t(`selectionMethod.value.${BG_SELECT_MODE.SPECIFIC}`)} />
            </Tabs>
            <Collapse in={backgrounds.settings.selectionMethod === BG_SELECT_MODE.RANDOM}>
                <MemoLibraryRow onSelect={onSelect} />
            </Collapse>
            <Fade in={backgrounds.bgState === BG_SHOW_STATE.SEARCH} unmountOnExit>
                <LinearProgress className={classes.linearProgress} />
            </Fade>
            <Random />
            <Specific onSelect={onSelect} />
            <Stream onSelect={onSelect} />
        </React.Fragment>
    );
}

export default memo(observer(SchedulerSection));
