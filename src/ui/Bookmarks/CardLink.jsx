import React, {
    memo,
    useEffect,
    useState,
} from 'react';
import {
    Card,
    Typography,
    CardActionArea,
    Tooltip,
    Box,
} from '@material-ui/core';
import { FavoriteRounded as FavoriteIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Image from '@/ui-components/Image';
import { BKMS_VARIANT } from '@/enum';
import useCoreService from '@/stores/app/BaseStateProvider';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import { useTranslation } from 'react-i18next';
import useAppService from '@/stores/app/AppStateProvider';
import pin from '@/utils/contextMenu/pin';
import edit from '@/utils/contextMenu/edit';
import remove from '@/utils/contextMenu/remove';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
    root: {
        width: theme.shape.dataCard.width,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        height: theme.shape.dataCard.height,
        overflow: 'unset',
        boxSizing: 'border-box',
        '&:hover $menuIconButton': {
            opacity: 1,
            pointerEvents: 'auto',
        },
    },
    middle: { height: (theme.shape.dataCard.height + theme.spacing(2)) * 2 - theme.spacing(2) },
    large: { height: (theme.shape.dataCard.height + theme.spacing(2)) * 3 - theme.spacing(2) },
    rootActionWrapper: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
    },
    icon: {
        marginRight: theme.spacing(1.25),
        width: 32,
        height: 32,
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
        fontFamily: theme.typography.primaryFontFamily,
        fontWeight: 600,
        fontSize: '0.94rem',
    },
    banner: {},
    imageWrapper: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1.5),
        paddingBottom: theme.spacing(1.25),
        height: 54,
        boxSizing: 'border-box',
    },
    extendBanner: {
        width: '100%',
        height: 84,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
    },
    extendBannerTitle: { margin: theme.spacing(0.625, 1.5) },
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
    },
    favoriteWrapper: {
        position: 'relative',
        width: '100%',
    },
    favorite: {
        borderRadius: '50%',
        padding: theme.spacing(0.375),
        border: `1px solid ${theme.palette.divider}`,
        position: 'absolute',
        display: 'flex',
        top: -14,
        right: -7,
        zIndex: 1,
        backgroundColor: theme.palette.background.default,
        '& svg': {
            color: theme.palette.error.main,
            width: 12,
            height: 12,
            transform: 'translateY(0.5px)',
        },
    },
}));

function CardLink(props) {
    const {
        id,
        name = '',
        url,
        icoVariant,
        description,
        imageUrl,
        preview = false,
        onClick,
        className: externalClassName,
        ...other
    } = props;
    const classes = useStyles();
    const appService = useAppService();
    const coreService = useCoreService();
    const bookmarksService = useBookmarksService();
    const { t } = useTranslation();
    const [isPin, setIsPin] = useState(bookmarksService.findFavorite({
        itemId: id,
        itemType: 'bookmark',
    }));

    const contextMenu = () => [
        pin({
            itemId: id,
            itemType: 'bookmark',
            t,
            bookmarksService,
        }),
        edit({
            itemId: id,
            itemType: 'bookmark',
            t,
            coreService,
        }),
        remove({
            itemId: id,
            itemType: 'bookmark',
            t,
            coreService,
        }),
    ];

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

    useEffect(() => {
        setIsPin(bookmarksService.findFavorite({
            itemId: id,
            itemType: 'bookmark',
        }));
    }, [bookmarksService.favorites.length]);

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
            open={preview ? false : undefined}
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
                    onContextMenu={!preview ? appService.contextMenu(contextMenu) : undefined}
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
                    {isPin && (
                        <Box className={classes.favoriteWrapper}>
                            <Box className={classes.favorite}>
                                <FavoriteIcon />
                            </Box>
                        </Box>
                    )}
                    {description && (
                        <Typography variant="body2" className={classes.description}>{description}</Typography>
                    )}
                </CardActionArea>
            </Card>
        </Tooltip>
    );
}

export default memo(observer(CardLink));
