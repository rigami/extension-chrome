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
import { StarRounded as FavoriteIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import Image from '@/ui-components/Image';
import { BKMS_VARIANT } from '@/enum';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import { useContextMenuService } from '@/stores/app/contextMenu';
import Tag from '../Tag';
import Collapser from '@/ui/WorkingSpace/Tag/Collapser';
import { useContextActions } from '@/stores/app/contextActions';

const useStyles = makeStyles((theme) => ({
    root: {
        width: theme.shape.dataCard.width,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        height: theme.shape.dataCard.height,
        overflow: 'hidden',
        boxSizing: 'border-box',
        border: 'none',
        boxShadow: `inset 0px 0px 0px 1px ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadiusButton,
        '&:hover $menuIconButton': {
            opacity: 1,
            pointerEvents: 'auto',
        },
    },
    selected: { backgroundColor: theme.palette.action.selected },
    middle: { height: (theme.shape.dataCard.height + theme.spacing(2)) * 2 - theme.spacing(2) },
    large: { height: (theme.shape.dataCard.height + theme.spacing(2)) * 3 - theme.spacing(2) },
    largest: { height: (theme.shape.dataCard.height + theme.spacing(2)) * 4 - theme.spacing(2) },
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
        marginTop: theme.spacing(0.5),
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
        '-webkit-line-clamp': 2,
        overflow: 'hidden',
        lineHeight: 1.1,
        wordBreak: 'break-word',
        fontFamily: theme.typography.specialFontFamily,
        fontWeight: 600,
        fontSize: '0.94rem',
        marginTop: theme.spacing(0.5),
        marginBottom: theme.spacing(0.5),
    },
    banner: {},
    imageWrapper: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(0.75, 1),
        paddingBottom: theme.spacing(0.25),
        paddingRight: theme.spacing(1.5),
        minHeight: 49,
        maxHeight: 68,
        boxSizing: 'border-box',
        flexShrink: 0,
    },
    extendBanner: {
        width: `calc(100% - ${theme.spacing(1)}px)`,
        height: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.shape.borderRadiusButton / 2,
        margin: theme.spacing(0.5),
        filter: 'brightness(0.96)',
        backgroundColor: theme.palette.background.default,
    },
    coverBanner: { height: 192 },
    extendBannerTitleContainer: {
        margin: theme.spacing(0.75, 1.5),
        minHeight: 25,
        display: 'flex',
        alignItems: 'center',
    },
    extendBannerTitle: {
        '-webkit-line-clamp': 1,
        margin: 0,
    },
    description: {
        color: theme.palette.text.secondary,
        marginTop: theme.spacing(1.25),
        margin: theme.spacing(0, 1.5),
        fontFamily: theme.typography.fontFamily,
        fontWeight: 400,
        lineHeight: 1.3,
        wordBreak: 'break-word',
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': 4,
        overflow: 'hidden',
    },
    descriptionBig: {
        '-webkit-line-clamp': 5,
        marginTop: 0,
    },
    descriptionIcon: { marginTop: theme.spacing(0.5) },
    infoWrapper: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        width: '100%',
        height: 26,
        flexShrink: 0,
        padding: theme.spacing(0.75),
        paddingTop: theme.spacing(0.5),
    },
    favorite: {
        color: theme.palette.favorite.main,
        width: 16,
        height: 16,
        marginLeft: theme.spacing(0.5),
    },
    url: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    tagsWrapper: { flexGrow: 1 },
    tag: {
        color: theme.palette.text.primary,
        padding: theme.spacing(0.25, 0.75),
        marginRight: theme.spacing(0.5),
        borderRadius: theme.shape.borderRadiusButton,
        fontSize: 12,
        fontWeight: '400',
        fontFamily: theme.typography.fontFamily,
        whiteSpace: 'nowrap',
        lineHeight: '14px',
    },
    tagOffset: {
        marginRight: theme.spacing(0.5),
        flexShrink: 0,
    },
    titleBig: { '-webkit-line-clamp': 3 },
}));

function Tags({ tags }) {
    const classes = useStyles();

    return (
        <Collapser className={classes.tagsWrapper}>
            {tags.map((tag) => tag && (
                <Tag
                    key={tag.id}
                    id={tag.id}
                    name={tag.name}
                    colorKey={tag.colorKey}
                    dense
                    className={classes.tagOffset}
                />
            ))}
        </Collapser>
    );
}

function CardLink(props) {
    const {
        id,
        name = '',
        url,
        icoVariant,
        description,
        icoUrl,
        preview = false,
        tags,
        tagsFull,
        onClick,
        className: externalClassName,
        ...other
    } = props;
    const classes = useStyles();
    const workingSpaceService = useWorkingSpaceService();
    const [isPin, setIsPin] = useState(workingSpaceService.findFavorite({
        itemId: id,
        itemType: 'bookmark',
    }));
    const contextActions = useContextActions({
        itemId: id,
        itemType: 'bookmark',
    });
    const { dispatchContextMenu, isOpen } = useContextMenuService(contextActions);

    const handleClick = () => {
        if (onClick) {
            onClick();
            return;
        }

        window.open(url, '_self');
    };

    const handleClickAlternative = (event) => {
        if (event.button === 1 && !onClick) {
            window.open(url);
        }
    };

    useEffect(() => {
        setIsPin(workingSpaceService.findFavorite({
            itemId: id,
            itemType: 'bookmark',
        }));
    }, [workingSpaceService.favorites.length]);

    const infoRow = tagsFull?.length > 0 || isPin;

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
                    icoVariant === BKMS_VARIANT.COVER && !description && classes.large,
                    icoVariant === BKMS_VARIANT.COVER && description && classes.largest,
                    externalClassName,
                    isOpen && classes.selected,
                )}
                variant="outlined"
                {...other}
            >
                <CardActionArea
                    className={classes.rootActionWrapper}
                    onClick={handleClick}
                    onMouseUp={handleClickAlternative}
                    onContextMenu={!preview ? dispatchContextMenu : undefined}
                >
                    {icoVariant !== BKMS_VARIANT.POSTER && icoVariant !== BKMS_VARIANT.COVER && (
                        <Box className={classes.imageWrapper}>
                            <Image
                                variant={icoVariant}
                                src={icoUrl}
                                alternativeIcon={
                                    icoVariant === BKMS_VARIANT.SYMBOL
                                        ? name[0]?.toUpperCase()
                                        : undefined
                                }
                                className={classes.icon}
                            />
                            <Typography
                                className={clsx(classes.title, !infoRow && classes.titleBig)}
                            >
                                {name}
                            </Typography>
                        </Box>
                    )}
                    {icoVariant === BKMS_VARIANT.POSTER && (
                        <Box className={classes.banner}>
                            <Image
                                variant={BKMS_VARIANT.POSTER}
                                src={icoUrl}
                                className={classes.extendBanner}
                            />
                            <Box className={classes.extendBannerTitleContainer}>
                                <Typography
                                    className={clsx(
                                        classes.title,
                                        !infoRow && classes.titleBig,
                                        classes.extendBannerTitle,
                                    )}
                                >
                                    {name}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                    {icoVariant === BKMS_VARIANT.COVER && (
                        <Box className={classes.banner}>
                            <Image
                                variant={BKMS_VARIANT.COVER}
                                src={icoUrl}
                                className={clsx(classes.extendBanner, classes.coverBanner)}
                            />
                            <Box className={classes.extendBannerTitleContainer}>
                                <Typography
                                    className={clsx(
                                        classes.title,
                                        !infoRow && classes.titleBig,
                                        classes.extendBannerTitle,
                                    )}
                                >
                                    {name}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                    {infoRow && (
                        <Box className={clsx(classes.infoWrapper, !description && classes.alignToBottom)}>
                            {tagsFull?.length > 0 && (<Tags tags={tagsFull} />)}
                            {isPin && (<FavoriteIcon className={classes.favorite} />)}
                        </Box>
                    )}
                    {description && (
                        <Typography
                            variant="body2"
                            className={clsx(
                                classes.description,
                                !infoRow && classes.descriptionBig,
                                icoVariant !== BKMS_VARIANT.POSTER && icoVariant !== BKMS_VARIANT.COVER && classes.descriptionIcon,
                            )}
                        >
                            {description}
                        </Typography>
                    )}
                </CardActionArea>
            </Card>
        </Tooltip>
    );
}

export default memo(observer(CardLink));
