import React, { useState } from 'react';
import {
    ButtonBase,
    Tooltip,
    Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import {
    BookmarkBorderRounded as PinnedFavoriteIcon,
    BookmarkRounded as UnpinnedFavoriteIcon,
    EditRounded as EditIcon,
    DeleteRounded as RemoveIcon,
} from '@material-ui/icons';
import { observer } from 'mobx-react-lite';
import Image from '@/ui-components/Image';
import { BKMS_VARIANT } from '@/enum';
import { useService as useAppService } from '@/stores/app';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
    root: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        padding: 0,
    },
    rootBlur: { backdropFilter: 'blur(10px) brightness(130%)' },
    icon: {},
    roundedIcon: { borderRadius: theme.shape.borderRadiusBold },
}));

function LinkButton({
    id, name, url, imageUrl, icoVariant, isBlurBackdrop,
}) {
    const classes = useStyles();
    const appStore = useAppService();
    const bookmarksStore = useBookmarksService();
    const { t } = useTranslation();

    const isPin = () => bookmarksStore.favorites.find((fav) => fav.type === 'bookmark' && fav.id === id);

    const handlerContextMenu = (event) => {
        event.preventDefault();
        openMenu({
            top: event.nativeEvent.clientY,
            left: event.nativeEvent.clientX,
        });
    };

    const openMenu = (position) => {
        appStore.eventBus.dispatch('contextMenu', {
            actions: [
                {
                    type: 'button',
                    title: isPin() ? t('fap.unpin') : t('fap.pin'),
                    icon: isPin() ? UnpinnedFavoriteIcon : PinnedFavoriteIcon,
                    onClick: () => {
                        if (isPin()) {
                            bookmarksStore.removeFromFavorites({
                                type: 'bookmark',
                                id,
                            });
                        } else {
                            bookmarksStore.addToFavorites({
                                type: 'bookmark',
                                id,
                            });
                        }
                    },
                },
                {
                    type: 'button',
                    title: t('edit'),
                    icon: EditIcon,
                    onClick: () => {
                        bookmarksStore.eventBus.dispatch('editbookmark', { id });
                    },
                },
                {
                    type: 'button',
                    title: t('remove'),
                    icon: RemoveIcon,
                    onClick: () => {
                        bookmarksStore.eventBus.dispatch('removebookmark', { id });
                    },
                },
            ],
            position,
        });
    };

    const handleClick = (event) => {
        if (!url) return;

        if (event.button === 1) {
            window.open(url);
        } else if (event.button === 0) {
            window.open(url, '_self');
        }
    };

    return (
        <Tooltip
            title={(
                <React.Fragment>
                    {name}
                    <br />
                    <Typography variant="caption">{url}</Typography>
                </React.Fragment>
            )}
            enterDelay={400}
            enterNextDelay={400}
        >
            <ButtonBase
                className={clsx(
                    classes.root,
                    isBlurBackdrop && classes.rootBlur,
                    classes.roundedIcon,
                )}
                onMouseUp={handleClick}
                onContextMenu={handlerContextMenu}
            >
                <Image
                    src={imageUrl}
                    className={classes.icon}
                    alternativeIcon={icoVariant === BKMS_VARIANT.SYMBOL ? name[0].toUpperCase() : undefined}
                />
            </ButtonBase>
        </Tooltip>
    );
}

export default observer(LinkButton);
