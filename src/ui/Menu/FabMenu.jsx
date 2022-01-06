import React, { memo } from 'react';
import { Box, Typography, CardActionArea } from '@material-ui/core';
import {
    SettingsRounded as SettingsIcon,
    StarBorderRounded as AddFavoriteIcon,
    StarRounded as RemoveFavoriteIcon,
    ArrowForward as GoToIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { ACTIVITY, BKMS_DISPLAY_VARIANT, BKMS_FAP_STYLE } from '@/enum';
import MouseDistanceFade from '@/ui-components/MouseDistanceFade';
import useCoreService from '@/stores/app/BaseStateProvider';
import useAppService from '@/stores/app/AppStateProvider';
import { ExtendButton, ExtendButtonGroup } from '@/ui-components/ExtendButton';
import useContextMenu from '@/stores/app/ContextMenuProvider';
import { ContextMenuDivider, ContextMenuItem, ContextMenuCustomItem } from '@/stores/app/entities/contextMenu';
import Favorite from '@/stores/universal/bookmarks/entities/favorite';
import DisplayCardsImage from '@/images/display_cards.svg';
import DisplayRowsImage from '@/images/display_rows.svg';
import useBookmarksService from '@/stores/app/BookmarksProvider';

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
    contextMenu: { width: 280 },
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

function FabMenu() {
    const classes = useStyles();
    const coreService = useCoreService();
    const appService = useAppService();
    const bookmarksService = useBookmarksService();
    const { t } = useTranslation(['bookmark', 'settings', 'background']);
    const contextMenu = useContextMenu(() => [
        new ContextMenuItem({ title: t('settings:display.title') }),
        new ContextMenuCustomItem({
            render: () => (
                <Box className={classes.displayImageWrapper}>
                    <DisplayVariant
                        image={DisplayCardsImage}
                        label={t('settings:display.variant.cards')}
                        selected={bookmarksService.settings.displayVariant === BKMS_DISPLAY_VARIANT.CARDS}
                        onClick={() => bookmarksService.settings.update({ displayVariant: BKMS_DISPLAY_VARIANT.CARDS })}
                    />
                    <DisplayVariant
                        image={DisplayRowsImage}
                        label={t('settings:display.variant.rows')}
                        selected={bookmarksService.settings.displayVariant === BKMS_DISPLAY_VARIANT.ROWS}
                        onClick={() => bookmarksService.settings.update({ displayVariant: BKMS_DISPLAY_VARIANT.ROWS })}
                    />
                </Box>
            ),
        }),
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
                show={appService.activity === ACTIVITY.DESKTOP ? undefined : true}
                distanceMax={750}
                distanceMin={300}
            >
                <ExtendButtonGroup variant="blurBackdrop" className={clsx(classes.group, classes.button)}>
                    <ExtendButton
                        tooltip={t('settings:title')}
                        data-ui-path="settings.open"
                        onClick={(event) => contextMenu(event)}
                        icon={SettingsIcon}
                    />
                </ExtendButtonGroup>
            </MouseDistanceFade>
        </Box>
    );
}

export default memo(observer(FabMenu));
