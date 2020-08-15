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
    MoreVertRounded as MoreIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import EditMenu from './ContextEditMenu';
import clsx from 'clsx';
import Image from "@/ui-components/Image";
import {BKMS_VARIANT} from "@/enum";

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
    borderIcon: {
        boxShadow: `0 0 0 1px #e0e0e0`,
    },
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
    const buttonRef = useRef(null);
    const [isOpenMenu, setIsOpenMenu] = useState(false);
    const [position, setPosition] = useState(null);

    const handlerContextMenu = (event) => {
        event.preventDefault();
        setPosition({
            top: event.nativeEvent.clientY,
            left: event.nativeEvent.clientX,
        });
        setIsOpenMenu(true);
    };

    const handleOpenMenu = () => {
        const { top, left } = buttonRef.current.getBoundingClientRect();
        setPosition({ top, left });
        setIsOpenMenu(true);
    };

    const handleCloseMenu = () => {
        setIsOpenMenu(false);
    };

    const handleClick = (event) => {
        if (onClick) {
            onClick();
            return;
        }
        if (event.button === 1) {
            window.open(url);
        } else if (event.button === 0) {
            window.open(url, "_self");
        }
    };

    useEffect(() => console.log('NEW IMAGE:', { imageUrl, icoVariant }), [imageUrl, icoVariant]);

    console.log('RENDER CARD');

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
                                variant={BKMS_VARIANT.SMALL}
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
                        <EditMenu
                            id={id}
                            type="bookmark"
                            isOpen={isOpenMenu}
                            onClose={handleCloseMenu}
                            position={position}
                        />
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
