import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Avatar,
    Box,
    Button,
    ImageListItemBar,
    IconButton,
    Link,
    Tooltip,
} from '@material-ui/core';
import {
    ArrowForwardRounded as LeftIcon,
    CheckRounded as SetIcon,
    DeleteForeverRounded as DeleteIcon,
    WallpaperRounded as WallpaperIcon,
    AddRounded as AddIcon,
} from '@material-ui/icons';
import { makeStyles, alpha } from '@material-ui/core/styles';
import clsx from 'clsx';
import { BG_SOURCE } from '@/enum';

const useStyles = makeStyles((theme) => ({
    bgCard: {
        position: 'relative',
        backgroundSize: 'cover',
        backgroundPosition: '50%',
        height: '100%',
        width: '100%',
        backgroundColor: theme.palette.background.backdrop,
    },
    bgActionsWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: alpha(theme.palette.common.black, 0.7),
        opacity: 0,
        transition: theme.transitions.create('', {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.shortest,
        }),
        '&:hover': { opacity: 1 },
    },
    setIcon: {
        color: theme.palette.primary.main,
        width: '100%',
        height: '100%',
        '& svg': {
            width: 36,
            height: 36,
        },
    },
    deleteIcon: {
        color: theme.palette.common.white,
        opacity: 0.7,
        position: 'absolute',
        top: theme.spacing(1),
        right: theme.spacing(1),
        '&:hover': {
            opacity: 1,
            color: theme.palette.error.main,
        },
    },
    bgStub: {
        position: 'absolute',
        zIndex: -1,
        height: '100%',
        width: '100%',
    },
    titleBar: {
        position: 'relative',
        width: '100%',
        height: 'auto',
        padding: theme.spacing(1, 0),
        paddingRight: theme.spacing(2),
        background: 'none',
        borderTop: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
    },
    icon: {
        display: 'flex',
        color: theme.palette.common.white,
    },
    link: {
        position: 'relative',
        width: '100%',
    },
    selectIcon: {
        backgroundColor: theme.palette.common.white,
        color: theme.palette.common.black,
    },
    addIcon: {
        color: theme.palette.common.white,
        opacity: 0.7,
        position: 'absolute',
        top: theme.spacing(1),
        right: theme.spacing(1),
        '&:hover': {
            opacity: 1,
            color: theme.palette.primary.main,
        },
    },
    addIconOffset: { right: theme.spacing(3) },
}));

function BackgroundCard(props) {
    const {
        sourceLink,
        previewSrc,
        source,
        author,
        select,
        onSet,
        onRemove,
        onAdd,
    } = props;
    const { t } = useTranslation(['wallpaper']);
    const classes = useStyles();

    return (
        <Box
            className={classes.bgCard}
            style={{ backgroundImage: `url('${previewSrc}')` }}
        >
            <Avatar variant="square" className={classes.bgStub}>
                <WallpaperIcon fontSize="large" />
            </Avatar>
            {select && (
                <SetIcon className={classes.selectIcon} />
            )}
            <Box className={classes.bgActionsWrapper}>
                {onSet && !select && (
                    <Tooltip title={t('button.apply')} placement="top">
                        <Button
                            data-ui-path="bgCard.apply"
                            className={classes.setIcon}
                            onClick={onSet}
                        >
                            <SetIcon />
                        </Button>
                    </Tooltip>
                )}
                {onRemove && (
                    <Tooltip title={t('button.remove')}>
                        <IconButton
                            data-ui-path="bgCard.remove"
                            className={classes.deleteIcon}
                            onClick={onRemove}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                )}
                {onAdd && (
                    <Tooltip title={t('button.addToLibrary')}>
                        <IconButton
                            data-ui-path="bgCard.addToLibrary"
                            className={clsx(classes.addIcon, onRemove && classes.addIconOffset)}
                            onClick={onAdd}
                        >
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                )}
                {source !== BG_SOURCE.USER && (
                    <Tooltip title={t('button.openSource')} placement="top">
                        <Link
                            className={classes.link}
                            underline="none"
                            href={sourceLink}
                            target="_blank"
                        >
                            <ImageListItemBar
                                className={classes.titleBar}
                                classes={{ actionIcon: classes.icon }}
                                subtitle={t('backgroundSource', {
                                    author,
                                    source,
                                })}
                                actionIcon={(<LeftIcon />)}
                            />
                        </Link>
                    </Tooltip>
                )}
            </Box>
        </Box>
    );
}

export default memo(BackgroundCard);
