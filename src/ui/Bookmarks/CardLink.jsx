import React, {
    memo,
    useCallback,
    useEffect,
    useState,
    useRef,
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
import { useResizeDetector } from 'react-resize-detector';
import Image from '@/ui-components/Image';
import { BKMS_VARIANT } from '@/enum';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import useContextMenu from '@/stores/app/ContextMenuProvider';
import Tag from './Tag';

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
        marginTop: theme.spacing(0.75),
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
        fontFamily: theme.typography.primaryFontFamily,
        fontWeight: 600,
        fontSize: '0.94rem',
        marginTop: theme.spacing(-0.5),
        marginBottom: theme.spacing(-0.5),
    },
    banner: {},
    imageWrapper: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1, 1.5),
        paddingBottom: theme.spacing(0),
        minHeight: 54,
        boxSizing: 'border-box',
        flexShrink: 0,
    },
    extendBanner: {
        width: `calc(100% - ${theme.spacing(1)}px)`,
        height: 108,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.shape.borderRadius / 2,
        margin: theme.spacing(0.5),
        filter: 'brightness(0.96)',
    },
    extendBannerTitleContainer: {
        margin: theme.spacing(1, 1.5),
        marginBottom: theme.spacing(0.5),
        height: 32,
        display: 'flex',
        alignItems: 'center',
    },
    extendBannerTitle: { '-webkit-line-clamp': 2 },
    description: {
        color: theme.palette.text.secondary,
        marginTop: 0,
        margin: theme.spacing(0, 1.5),
        fontFamily: theme.typography.secondaryFontFamily,
        fontWeight: 400,
        lineHeight: 1.2,
        wordBreak: 'break-word',
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': 6,
        overflow: 'hidden',
    },
    infoWrapper: {
        display: 'flex',
        width: '100%',
        height: 24,
        alignItems: 'center',
        flexShrink: 0,
        padding: theme.spacing(0.5, 0.75),
        marginTop: theme.spacing(0.5),
        marginBottom: theme.spacing(0.25),
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
    tagsContainer: {
        display: 'flex',
        overflow: 'hidden',
    },
    tagsWrapper: {
        flexGrow: 1,
        overflow: 'auto',
        position: 'relative',
        paddingRight: theme.shape.borderRadiusButton,
    },
    tag: {
        color: theme.palette.text.primary,
        padding: theme.spacing(0.25, 0.75),
        marginRight: theme.spacing(0.5),
        borderRadius: theme.shape.borderRadiusButton,
        fontSize: 12,
        fontWeight: '400',
        fontFamily: theme.typography.secondaryFontFamily,
        whiteSpace: 'nowrap',
        lineHeight: '14px',
    },
    tagOffset: {
        marginRight: theme.spacing(0.5),
        flexShrink: 0,
    },
    overloadTagsChip: {
        backgroundColor: theme.palette.background.backdrop,
        position: 'absolute',
        right: 0,
        top: 0,
        marginRight: 0,
        boxShadow: '0px 1px 6px 6px #fff',
    },
}));

function Tags({ tags }) {
    const classes = useStyles();
    const ref = useRef();
    const [isOverload, setIsOverload] = useState(false);
    const [notVisible, setNotVisible] = useState(0);

    const onResize = useCallback(() => {
        let i = 0;
        let sumWidth = 0;

        while (
            i < ref.current.children.length
            && sumWidth + ref.current.children[i].clientWidth + 4 <= ref.current.clientWidth
        ) {
            sumWidth += ref.current.children[i].clientWidth + 4;
            i += 1;
        }

        setIsOverload(ref.current.scrollWidth > ref.current.clientWidth);
        setNotVisible(ref.current.children.length - i);
    }, []);

    useResizeDetector({
        onResize,
        targetRef: ref,
    });

    useEffect(() => { onResize(); }, [tags.length]);

    return (
        <Box className={classes.tagsWrapper}>
            <Box ref={ref} className={classes.tagsContainer}>
                {tags.map((tag) => (
                    <Tag
                        key={tag.id}
                        id={tag.id}
                        name={tag.name}
                        colorKey={tag.colorKey}
                        dense
                        className={classes.tagOffset}
                    />
                ))}
            </Box>
            {isOverload && (
                <Box className={clsx(classes.tag, classes.overloadTagsChip)}>
                    +
                    {notVisible}
                </Box>
            )}
        </Box>
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
                                src={icoUrl}
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
                            <Image variant={BKMS_VARIANT.POSTER} src={icoUrl} className={classes.extendBanner} />
                            <Box className={classes.extendBannerTitleContainer}>
                                <Typography className={clsx(classes.title, classes.extendBannerTitle)}>
                                    {name}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                    <Box className={clsx(classes.infoWrapper, !description && classes.alignToBottom)}>
                        {tagsFull && (<Tags tags={tagsFull} />)}
                        {isPin && (<FavoriteIcon className={classes.favorite} />)}
                    </Box>
                    {description && (
                        <Typography variant="body2" className={classes.description}>{description}</Typography>
                    )}
                </CardActionArea>
            </Card>
        </Tooltip>
    );
}

export default memo(observer(CardLink));
