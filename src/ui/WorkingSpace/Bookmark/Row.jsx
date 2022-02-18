import React, {
    memo,
    useEffect,
    useState,
} from 'react';
import {
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
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        border: 'none',
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
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        padding: theme.spacing(1),
        margin: theme.spacing(0, 1),
        borderRadius: theme.shape.borderRadius,
    },
    icon: {
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
        overflow: 'hidden',
        lineHeight: 1.1,
        fontFamily: theme.typography.fontFamily,
        fontWeight: 600,
        fontSize: '0.94rem',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    banner: {},
    imageWrapper: { marginRight: theme.spacing(2) },
    extendBanner: {
        width: 110,
        height: 58,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: theme.shape.borderRadius / 2,
        filter: 'brightness(0.96)',
        backgroundColor: theme.palette.background.default,
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
        fontFamily: theme.typography.fontFamily,
        fontWeight: 400,
        lineHeight: 1.2,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    infoWrapper: {
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        flexShrink: 0,
        marginTop: 'auto',
        paddingTop: theme.spacing(0.75),
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
    contentWrapper: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        // minHeight: 58,
        overflow: 'auto',
    },
}));

function Tags({ tags }) {
    const classes = useStyles();

    return (
        <Collapser className={classes.tagsWrapper}>
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
        </Collapser>
    );
}

function RowItem(props) {
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
    const { dispatchContextMenu } = useContextMenuService(contextActions);

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
        setIsPin(workingSpaceService.findFavorite({
            itemId: id,
            itemType: 'bookmark',
        }));
    }, [workingSpaceService.favorites.length]);

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
            <li
                className={clsx(
                    classes.root,
                    externalClassName,
                )}
                {...other}
            >
                <CardActionArea
                    className={classes.rootActionWrapper}
                    onMouseUp={handleClick}
                    onContextMenu={!preview ? dispatchContextMenu : undefined}
                >
                    <Box className={classes.imageWrapper}>
                        {icoVariant !== BKMS_VARIANT.POSTER && (
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
                        )}
                        {icoVariant === BKMS_VARIANT.POSTER && (
                            <Image variant={BKMS_VARIANT.POSTER} src={icoUrl} className={classes.extendBanner} />
                        )}
                    </Box>
                    <Box className={classes.contentWrapper}>
                        <Typography className={classes.title}>{name}</Typography>
                        {description && (
                            <Typography variant="body2" className={classes.description}>{description}</Typography>
                        )}
                        <Box className={clsx(classes.infoWrapper, !description && classes.alignToBottom)}>
                            {tagsFull && (<Tags tags={tagsFull} />)}
                            {isPin && (<FavoriteIcon className={classes.favorite} />)}
                        </Box>
                    </Box>
                </CardActionArea>
            </li>
        </Tooltip>
    );
}

export default memo(observer(RowItem));
