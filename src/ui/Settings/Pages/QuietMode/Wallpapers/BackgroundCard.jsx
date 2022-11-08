import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Avatar,
    Box,
    Button,
    Link,
    Tooltip,
    Typography,
} from '@material-ui/core';
import {
    OpenInNewRounded as OpenOriginalIcon,
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
        padding: theme.spacing(0.75),
        backgroundColor: alpha(theme.palette.common.black, 0),
        transition: theme.transitions.create('', {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.shortest,
        }),
        '&:hover': { backgroundColor: alpha(theme.palette.common.black, 0.2) },
        '&:hover $actionsWrapper': { opacity: 1 },
        '&:hover $originalLink': { opacity: 1 },
    },
    actionsWrapper: {
        marginTop: 'auto',
        display: 'flex',
        width: `calc(100% + ${theme.spacing(0.5)}px)`,
        marginLeft: theme.spacing(-0.5),
        justifyContent: 'flex-end',
        opacity: 0,
    },
    setIcon: {
        color: theme.palette.primary.main,
        width: '100%',
        height: '100%',
        borderRadius: 0,
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
    originalLink: {
        opacity: 0,
        fontSize: theme.typography.caption.fontSize,
        fontWeight: 500,
        fontFamily: theme.typography.caption.fontFamily,
        marginTop: theme.spacing(0.5),
        marginRight: 'auto',
        padding: theme.spacing(0.5, 1),
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadiusButton,
        color: theme.palette.text.primary,
        bottom: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        overflow: 'auto',
        width: '100%',
        '&:hover': { backgroundColor: theme.palette.background.backdrop },
        '& span': {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            width: '100%',
            textOverflow: 'ellipsis',
            font: 'inherit',
        },
        '& svg': {
            marginLeft: theme.spacing(0.5),
            width: theme.spacing(2),
            height: theme.spacing(2),
            marginRight: theme.spacing(-0.5),
        },
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
    chipButton: {
        borderRadius: theme.shape.borderRadiusButton,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        minWidth: 'auto',
        overflow: 'auto',
        marginLeft: theme.spacing(0.5),
        flexGrow: 1,
    },
    chipButtonLabel: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        display: 'inline-block',
        textAlign: 'left',
        textOverflow: 'ellipsis',
        wordBreak: 'normal',
        verticalAlign: 'middle',
    },
    chipButtonIcon: {
        display: 'inline-flex',
        alignItems: 'center',
        verticalAlign: 'sub',
    },
    chipButtonOnlyIcon: { marginRight: theme.spacing(-0.5) },
    chipSelected: {
        fontSize: theme.typography.caption.fontSize,
        fontWeight: 500,
        fontFamily: theme.typography.caption.fontFamily,
        marginBottom: theme.spacing(0.5),
        marginRight: 'auto',
        padding: theme.spacing(0.5, 1),
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadiusButton,
        bottom: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        '& svg': {
            marginLeft: theme.spacing(-0.5),
            width: theme.spacing(2),
            height: theme.spacing(2),
            marginRight: theme.spacing(0.5),
        },
    },
    addButton: {
        flexGrow: 0,
        flexShrink: 0,
    },
    deleteButton: {
        backgroundColor: theme.palette.error.main,
        color: theme.palette.error.contrastText,
        flexGrow: 0,
        flexShrink: 0,
        '&:hover': { backgroundColor: theme.palette.error.dark },
    },
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
            <Box className={classes.bgActionsWrapper}>
                {select && (
                    <Box className={classes.chipSelected}>
                        <SetIcon />
                        {t('selected')}
                    </Box>
                )}
                <Box className={classes.actionsWrapper}>
                    {onSet && !select && (
                        <Tooltip title={t('button.apply')} placement="top">
                            <Button
                                data-ui-path="bgCard.apply"
                                className={classes.chipButton}
                                classes={{
                                    label: classes.chipButtonLabel,
                                    startIcon: classes.chipButtonIcon,
                                }}
                                onClick={onSet}
                                startIcon={<SetIcon />}
                                variant="contained"
                                fullWidth
                            >
                                {t('button.apply', { context: 'short' })}
                            </Button>
                        </Tooltip>
                    )}
                    {onAdd && (
                        <Tooltip title={t('button.addToLibrary')}>
                            <Button
                                data-ui-path="bgCard.addToLibrary"
                                className={clsx(classes.chipButton, classes.addButton)}
                                classes={{
                                    label: classes.chipButtonLabel,
                                    startIcon: clsx(classes.chipButtonIcon, classes.chipButtonOnlyIcon),
                                }}
                                onClick={onAdd}
                                startIcon={<AddIcon />}
                                variant="contained"
                            />
                        </Tooltip>
                    )}
                    {onRemove && (
                        <Tooltip title={t('button.remove')}>
                            <Button
                                data-ui-path="bgCard.remove"
                                className={clsx(classes.chipButton, classes.deleteButton)}
                                classes={{
                                    label: classes.chipButtonLabel,
                                    startIcon: clsx(classes.chipButtonIcon, classes.chipButtonOnlyIcon),
                                }}
                                onClick={onRemove}
                                startIcon={<DeleteIcon />}
                                variant="contained"
                            />
                        </Tooltip>
                    )}
                </Box>
                {source !== BG_SOURCE.USER && (
                    <Tooltip title={t('button.openSource')} placement="top">
                        <Link
                            className={classes.originalLink}
                            underline="none"
                            href={sourceLink}
                            target="_blank"
                        >
                            <Typography component="span">
                                {t('backgroundSource', {
                                    author,
                                    source,
                                })}
                            </Typography>
                            <OpenOriginalIcon />
                        </Link>
                    </Tooltip>
                )}
            </Box>
        </Box>
    );
}

export default memo(BackgroundCard);
