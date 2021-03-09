import React, { useRef } from 'react';
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
import useCoreService from '@/stores/app/BaseStateProvider';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import { useTranslation } from 'react-i18next';
import Favorite from '@/stores/universal/bookmarks/entities/favorite';

const useStyles = makeStyles((theme) => ({
    root: {
        width: 180,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        height: 62,
        '&:hover $menuIconButton': {
            opacity: 1,
            pointerEvents: 'auto',
        },
    },
    middle: { height: 140 },
    large: { height: 218 },
    rootActionWrapper: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
    },
    icon: {
        marginRight: theme.spacing(1.5),
        width: 36,
        height: 36,
        flexShrink: 0,
    },
    body: {
        width: '100%',
        padding: theme.spacing(1, 2),
        paddingTop: 0,
        boxSizing: 'border-box',
    },
    title: {
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': 2,
        overflow: 'hidden',
        lineHeight: 1.2,
        wordBreak: 'break-word',
    },
    banner: {},
    imageWrapper: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1.5),
        paddingBottom: theme.spacing(1.25),
        height: 60,
        boxSizing: 'border-box',
    },
    extendBanner: {
        width: '100%',
        height: 84,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    extendBannerTitle: { margin: theme.spacing(1, 1.5) },
    description: {
        color: theme.palette.text.secondary,
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': 4,
        overflow: 'hidden',
        marginTop: theme.spacing(-0.5),
        margin: theme.spacing(1.25, 1.5),
        lineHeight: 1.357,
        wordBreak: 'break-word',
        height: 72,
    },
    menuIconButton: {
        position: 'absolute',
        right: theme.spacing(0.5),
        top: theme.spacing(0.75),
        opacity: 0,
        pointerEvents: 'none',
    },
    menuIcon: { '& path': { backdropFilter: 'invert(1)' } },
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
    const coreService = useCoreService();
    const bookmarksService = useBookmarksService();
    const buttonRef = useRef(null);
    const { t } = useTranslation();

    const isPin = () => bookmarksService.findFavorite({
        itemType: 'bookmark',
        itemId: id,
    });

    const openMenu = (position) => {
        coreService.localEventBus.call('system/contextMenu', {
            actions: [
                {
                    type: 'button',
                    title: isPin() ? t('fap.unpin') : t('fap.pin'),
                    icon: isPin() ? UnpinnedFavoriteIcon : PinnedFavoriteIcon,
                    onClick: () => {
                        if (isPin()) {
                            bookmarksService.removeFromFavorites(bookmarksService.findFavorite({
                                itemType: 'bookmark',
                                itemId: id,
                            })?.id);
                        } else {
                            bookmarksService.addToFavorites(new Favorite({
                                itemType: 'bookmark',
                                itemId: id,
                            }));
                        }
                    },
                },
                {
                    type: 'button',
                    title: t('edit'),
                    icon: EditIcon,
                    onClick: () => {
                        coreService.localEventBus.call('bookmark/edit', { id });
                    },
                },
                {
                    type: 'button',
                    title: t('remove'),
                    icon: RemoveIcon,
                    onClick: () => {
                        coreService.localEventBus.call('bookmark/remove', { id });
                    },
                },
            ],
            position,
        });
    };

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
            <Card
                className={clsx(
                    classes.root,
                    icoVariant !== BKMS_VARIANT.POSTER && description && classes.middle,
                    icoVariant === BKMS_VARIANT.POSTER && !description && classes.middle,
                    icoVariant === BKMS_VARIANT.POSTER && description && classes.large,
                    externalClassName,
                )}
                variant="outlined" {...other}
            >
                <CardActionArea
                    className={classes.rootActionWrapper}
                    onMouseUp={handleClick}
                    onContextMenu={!preview ? handlerContextMenu : undefined}
                >
                    {icoVariant !== BKMS_VARIANT.POSTER && (
                        <Box className={classes.imageWrapper}>
                            <Image
                                variant={icoVariant}
                                src={imageUrl}
                                alternativeIcon={
                                    icoVariant === BKMS_VARIANT.SYMBOL
                                        ? name[0]?.toUpperCase()
                                        : undefined
                                }
                                className={classes.icon}
                            />
                            <Typography className={classes.title}>{name}</Typography>
                        </Box>
                    )}
                    {icoVariant === BKMS_VARIANT.POSTER && (
                        <Box className={classes.banner}>
                            <Image variant={BKMS_VARIANT.POSTER} src={imageUrl} className={classes.extendBanner} />
                            <Typography
                                className={clsx(classes.title, classes.extendBannerTitle)}
                            >
                                {name}
                            </Typography>
                        </Box>
                    )}
                    {description && (
                        <Typography variant="body2" className={classes.description}>{description}</Typography>
                    )}
                </CardActionArea>
                {!preview && (
                    <React.Fragment>
                        <IconButton
                            data-ui-path="bookmark.menu"
                            className={classes.menuIconButton}
                            onClick={handleOpenMenu}
                            ref={buttonRef}
                        >
                            <MoreIcon className={classes.menuIcon} />
                        </IconButton>
                    </React.Fragment>
                )}
            </Card>
        </Tooltip>
    );
}

export default CardLink;
