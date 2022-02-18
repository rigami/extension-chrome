import React, { memo, useEffect, useState } from 'react';
import {
    Box,
    Typography,
    CardActionArea,
    Avatar,
} from '@material-ui/core';
import {
    SettingsRounded as SettingsIcon,
    ArrowForward as GoToIcon,
    AddPhotoAlternateRounded as UploadFromComputerIcon,
    WallpaperRounded as WallpaperIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { captureException } from '@sentry/react';
import { ACTIVITY, BKMS_DISPLAY_VARIANT } from '@/enum';
import MouseDistanceFade from '@/ui-components/MouseDistanceFade';
import { useCoreService } from '@/stores/app/core';
import { useAppStateService } from '@/stores/app/appState';
import { ExtendButton, ExtendButtonGroup } from '@/ui-components/ExtendButton';
import { useContextMenuService } from '@/stores/app/contextMenu';
import { ContextMenuDivider, ContextMenuItem, ContextMenuCustomItem } from '@/stores/app/contextMenu/entities';
import DisplayCardsImage from '@/images/display_cards.svg';
import DisplayRowsImage from '@/images/display_rows.svg';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';
import { useContextEdit } from '@/stores/app/contextActions';

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'absolute',
        top: theme.spacing(2),
        right: theme.spacing(2),
        zIndex: 2,
        display: 'grid',
        gridGap: theme.spacing(2),
        pointerEvents: 'none',
        gridAutoFlow: 'column',
    },
    group: { flexDirection: 'row' },
    button: { pointerEvents: 'all' },
    displayImage: {
        color: theme.palette.text.secondary,
        marginBottom: theme.spacing(1),
    },
    displayImageSelected: { color: theme.palette.primary.main },
    displayImageContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: theme.spacing(0.5),
        padding: theme.spacing(0.5),
        borderRadius: theme.shape.borderRadius,
        width: 'unset',
    },
    displayImageWrapper: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
    },
    contextMenu: { width: 290 },
    bgCard: {
        borderRadius: theme.shape.borderRadius,
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),
        width: 'auto',
    },
}));

function DisplayVariant({ image: Image, label, selected, onClick }) {
    const classes = useStyles();

    return (
        <CardActionArea className={classes.displayImageContainer} onClick={onClick}>
            <Image className={clsx(classes.displayImage, selected && classes.displayImageSelected)} />
            <Typography variant="caption" color="textSecondary">{label}</Typography>
        </CardActionArea>
    );
}

function BGCard({ src, onClick }) {
    const classes = useStyles();

    return (
        <CardActionArea className={classes.bgCard} onClick={onClick}>
            <Avatar
                src={src}
                variant="rounded"
                style={{
                    width: 48,
                    height: 48,
                }}
            >
                <WallpaperIcon />
            </Avatar>
        </CardActionArea>
    );
}

const MemoBGCard = memo(BGCard);

function BackgroundSelector() {
    const { wallpapersService } = useAppStateService();
    const [bgs, setBgs] = useState(null);

    useEffect(() => {
        wallpapersService.getLastUsage(15)
            .then((lastBgs) => setBgs(lastBgs))
            .catch((e) => {
                captureException(e);
                console.error('Failed load bg`s from db:', e);
            });
    }, [wallpapersService.count]);

    return (
        <Box
            display="flex" flexWrap="wrap" pl={1}
            pt={1}
        >
            {bgs && bgs.map((wallpaper) => (
                <MemoBGCard
                    src={wallpaper.previewSrc}
                    key={wallpaper.id}
                    onClick={() => wallpapersService.setWallpaper(wallpaper)}
                />
            ))}
        </Box>
    );
}

function FabMenu() {
    const classes = useStyles();
    const { t } = useTranslation(['bookmark', 'settings', 'background']);
    const coreService = useCoreService();
    const appStateService = useAppStateService();
    const workingSpaceService = useWorkingSpaceService();
    const { dispatchEdit } = useContextEdit();
    const { dispatchContextMenu } = useContextMenuService((event, position, next) => [
        ...(appStateService.activity !== ACTIVITY.DESKTOP ? [
            new ContextMenuItem({ title: t('settings:display.title') }),
            new ContextMenuCustomItem({
                render: () => (
                    <Box className={classes.displayImageWrapper}>
                        <DisplayVariant
                            image={DisplayCardsImage}
                            label={t('settings:display.variant.cards')}
                            selected={workingSpaceService.settings.displayVariant === BKMS_DISPLAY_VARIANT.CARDS}
                            onClick={() => workingSpaceService.settings.update({ displayVariant: BKMS_DISPLAY_VARIANT.CARDS })}
                        />
                        <DisplayVariant
                            image={DisplayRowsImage}
                            label={t('settings:display.variant.rows')}
                            selected={workingSpaceService.settings.displayVariant === BKMS_DISPLAY_VARIANT.ROWS}
                            onClick={() => workingSpaceService.settings.update({ displayVariant: BKMS_DISPLAY_VARIANT.ROWS })}
                        />
                    </Box>
                ),
            }),
        ] : [
            new ContextMenuItem({ title: t('settings:changeBackground.title') }),
            new ContextMenuCustomItem({
                render: () => (
                    <BackgroundSelector />
                ),
            }),
            new ContextMenuItem({
                title: t('background:button.add'),
                icon: UploadFromComputerIcon,
                onClick: () => {
                    const shadowInput = document.createElement('input');
                    shadowInput.setAttribute('multiple', 'true');
                    shadowInput.setAttribute('type', 'file');
                    shadowInput.setAttribute('accept', 'video/*,image/*');
                    shadowInput.onchange = (uploadEvent) => {
                        const form = uploadEvent.target;
                        if (form.files.length === 0) return;

                        appStateService.wallpapersService.addToUploadQueue(form.files)
                            .finally(() => {
                                form.value = '';
                            });
                    };
                    shadowInput.click();
                },
            }),
            new ContextMenuDivider(),
            new ContextMenuItem({
                title: t('bookmark:button.add'),
                icon: AddBookmarkIcon,
                onClick: () => dispatchEdit({ itemType: 'bookmark' }, event, position, next),
            }),
        ]),
        new ContextMenuDivider(),
        new ContextMenuItem({
            title: t('settings:advancedSettings'),
            icon: SettingsIcon,
            onClick: async () => {
                coreService.localEventBus.call('settings/open');

                await new Promise((resolve) => setTimeout(resolve, 2000));
            },
            action: (
                <GoToIcon />
            ),
        }),
    ], { className: classes.contextMenu });

    return (
        <Box className={classes.root}>
            <MouseDistanceFade
                unionKey="desktop-fab"
                show={appStateService.activity === ACTIVITY.DESKTOP ? undefined : true}
                distanceMax={750}
                distanceMin={300}
            >
                <ExtendButtonGroup variant="blurBackdrop" className={clsx(classes.group, classes.button)}>
                    <ExtendButton
                        tooltip={t('settings:title')}
                        data-ui-path="settings.open"
                        onClick={dispatchContextMenu}
                        icon={SettingsIcon}
                    />
                </ExtendButtonGroup>
            </MouseDistanceFade>
        </Box>
    );
}

export default memo(observer(FabMenu));
