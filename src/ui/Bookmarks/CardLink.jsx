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
    Divider,
} from '@material-ui/core';
import { StarRounded as FavoriteIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import Image from '@/ui-components/Image';
import { BKMS_VARIANT } from '@/enum';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import useContextMenu from '@/stores/app/ContextMenuProvider';
import { observer } from 'mobx-react-lite';
import { getDomain } from '@/utils/localSiteParse';

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
        alignSelf: 'flex-start',
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
        '-webkit-line-clamp': 3,
        overflow: 'hidden',
        lineHeight: 1.1,
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
        minHeight: 54,
        boxSizing: 'border-box',
        flexShrink: 0,
    },
    extendBanner: {
        width: '100%',
        height: 109,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
    },
    extendBannerTitle: { margin: theme.spacing(1, 1.5) },
    description: {
        color: theme.palette.text.secondary,
        overflow: 'hidden',
        marginTop: theme.spacing(-0.25),
        margin: theme.spacing(0, 1.5),
        lineHeight: 1.2,
        wordBreak: 'break-word',
        height: '100%',
        marginBottom: theme.spacing(-1.5),
        '-webkit-mask': 'linear-gradient(to top, #0000 10px, #000 34px)',
    },
    infoWrapper: {
        display: 'flex',
        width: '100%',
        height: 24,
        alignItems: 'center',
        padding: theme.spacing(0, 1.5),
        flexShrink: 0,
        marginTop: 'auto',
    },
    favorite: {
        color: theme.palette.favorite.main,
        width: 16,
        height: 16,
        marginLeft: 'auto',
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
    const bookmarksService = useBookmarksService();
    const [isPin, setIsPin] = useState(bookmarksService.findFavorite({
        itemId: id,
        itemType: 'bookmark',
    }));
    const contextMenu = useContextMenu({
        itemId: id,
        itemType: 'bookmark',
    });

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
                    onContextMenu={!preview ? contextMenu : undefined}
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
                            <Divider />
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
                    <Box className={classes.infoWrapper}>
                        <Typography variant="caption" color="textSecondary">
                            {getDomain(url)}
                        </Typography>
                        {isPin && (<FavoriteIcon className={classes.favorite} />)}
                    </Box>
                </CardActionArea>
            </Card>
        </Tooltip>
    );
}

export default memo(observer(CardLink));
