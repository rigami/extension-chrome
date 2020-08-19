import React, { useRef, useState, useEffect } from 'react';
import {
    Card,
    Typography,
    CardActionArea,
    Tooltip,
    Box,
    IconButton,
} from '@material-ui/core';
import {
    BookmarkBorderRounded as PinnedFavoriteIcon,
    BookmarkRounded as UnpinnedFavoriteIcon,
    EditRounded as EditIcon,
    DeleteRounded as RemoveIcon,
    MoreVertRounded as MoreIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Image from '@/ui-components/Image';
import { BKMS_VARIANT } from '@/enum';
import { useService as useAppService } from '@/stores/app';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
    root: {
        width: 180,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        '&:hover $menuIcon': {
            opacity: 1,
            pointerEvents: 'auto',
        },
    },
    rootActionWrapper: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-end',
    },
    icon: { margin: 'auto' },
    body: {
        width: '100%',
        padding: theme.spacing(1, 2),
        paddingTop: 0,
        boxSizing: 'border-box',
    },
    categoriesWrapper: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    category: {
        width: theme.spacing(1),
        height: theme.spacing(1),
        borderRadius: theme.spacing(0.5),
        marginRight: theme.spacing(0.6),
        marginBottom: theme.spacing(0.5),
    },
    title: {
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': 2,
        overflow: 'hidden',
        lineHeight: 1.2,
        wordBreak: 'break-word',
    },
    banner: {
        width: '100%',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    extendBanner: {
        width: '100%',
        height: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing(1),
    },
    description: {
        color: theme.palette.text.secondary,
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': 4,
        overflow: 'hidden',
        marginTop: theme.spacing(0.6),
        wordBreak: 'break-word',
    },
    menuIcon: {
        position: 'absolute',
        right: theme.spacing(0.5),
        top: theme.spacing(0.5),
        opacity: 0,
        pointerEvents: 'none',
    },
    borderIcon: { boxShadow: '0 0 0 1px #e0e0e0' },
}));

function CardLink(props) {
    const {
        id,
        name = '',
        url,
        categories,
        icoVariant,
        description,
        imageUrl,
        preview = false,
        onClick,
        className: externalClassName,
        ...other
    } = props;
    const classes = useStyles();
    const appStore = useAppService();
    const bookmarksStore = useBookmarksService();
    const buttonRef = useRef(null);
    const { t } = useTranslation();

    const isPin = () => bookmarksStore.favorites.find((fav) => fav.type === 'bookmark' && fav.id === id);

    const handlerContextMenu = (event) => {
        event.preventDefault();
        openMenu({
            top: event.nativeEvent.clientY,
            left: event.nativeEvent.clientX,
        });
    };

    const handleOpenMenu = () => {
        const { top, left } = buttonRef.current.getBoundingClientRect();
        openMenu({
            top,
            left,
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
        if (onClick) {
            onClick();
            return;
        }
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
            <Card className={clsx(classes.root, externalClassName)} variant="outlined" {...other}>
                <CardActionArea
                    className={classes.rootActionWrapper}
                    onMouseUp={handleClick}
                    onContextMenu={!preview ? handlerContextMenu : undefined}
                >
                    {icoVariant === BKMS_VARIANT.POSTER && (
                        <Image variant={BKMS_VARIANT.POSTER} src={imageUrl} className={classes.extendBanner} />
                    )}
                    {icoVariant !== BKMS_VARIANT.POSTER && (
                        <Box className={classes.banner}>
                            <Image
                                variant={icoVariant}
                                src={imageUrl}
                                alternativeIcon={icoVariant === BKMS_VARIANT.SYMBOL ? name[0]?.toUpperCase() : undefined}
                                className={clsx(classes.icon, classes.borderIcon)}
                            />
                        </Box>
                    )}
                    <div className={classes.body}>
                        <div className={classes.categoriesWrapper}>
                            {categories && categories.map(({ name: categoryName, color, id: categoryId }) => (
                                <Tooltip key={categoryId} title={categoryName}>
                                    <div className={classes.category} style={{ backgroundColor: color }} />
                                </Tooltip>
                            ))}
                        </div>
                        <Typography className={classes.title}>{name}</Typography>
                        {description && (
                            <Typography variant="body2" className={classes.description}>{description}</Typography>
                        )}
                    </div>
                </CardActionArea>
                {!preview && (
                    <React.Fragment>
                        <IconButton
                            className={classes.menuIcon}
                            onClick={handleOpenMenu}
                            ref={buttonRef}
                        >
                            <MoreIcon />
                        </IconButton>
                    </React.Fragment>
                )}
            </Card>
        </Tooltip>
    );
}

export default CardLink;
