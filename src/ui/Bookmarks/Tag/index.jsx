import React, { useEffect, useState } from 'react';
import {
    Box, ButtonBase, Typography, IconButton, Tooltip,
} from '@material-ui/core';
import clsx from 'clsx';
import { alpha, makeStyles, lighten } from '@material-ui/core/styles';
import { CloseRounded as CloseIcon, StarRounded as FavoriteIcon } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import { useContextMenuService } from '@/stores/app/contextMenu';
import getUniqueColor from '@/utils/generate/uniqueColor';

const useStyles = makeStyles((theme) => ({
    root: {
        maxWidth: 180,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    colorIcon: {
        width: theme.spacing(1.5),
        height: theme.spacing(1.5),
        borderRadius: '50%',
        marginLeft: theme.spacing(1),
        flexShrink: 0,
        marginRight: theme.spacing(1),
    },
    text: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        fontSize: '0.9rem',
        marginRight: theme.spacing(2),
    },
    active: {},
    favorite: {
        color: theme.palette.favorite.main,
        width: 18,
        height: 18,
        display: 'flex',
        justifyContent: 'center',
        marginLeft: theme.spacing(-1.25),
        marginRight: theme.spacing(0.75),
    },
    favoriteWrapper: { width: theme.spacing(2.5) },
    normal: {
        boxShadow: 'none !important',
        display: 'inline-flex',
        border: '1px solid #000',
        flexDirection: 'row',
        height: 'fit-content',
        minHeight: theme.spacing(4),
        alignItems: 'center',
        borderRadius: theme.shape.borderRadiusButton,
        borderColor: theme.palette.divider,
        boxSizing: 'border-box',
        textAlign: 'right',
    },
    dense: {
        color: theme.palette.text.primary,
        padding: theme.spacing(0.25, 0.75),
        // marginRight: theme.spacing(0.5),
        borderRadius: theme.shape.borderRadiusButton,
        fontSize: 12,
        fontWeight: '400',
        fontFamily: theme.typography.fontFamily,
        whiteSpace: 'nowrap',
        lineHeight: '14px',
        '&:hover $deleteDense': { opacity: 1 },
    },
    denseWithDelete: {
        height: 26,
        minWidth: 26,
        lineHeight: '22px',
        position: 'relative',
        textAlign: 'center',
    },
    deleteDenseWrapper: { marginLeft: 'auto' },
    deleteDense: {
        margin: '-10px -14px',
        marginLeft: -28,
        opacity: 0,
        position: 'absolute',
        right: 6,
    },
    deleteIconDense: {
        width: 18,
        height: 18,
    },
}));

function Tag(props) {
    const {
        id,
        name,
        colorKey,
        isSelect,
        dense = false,
        onClick,
        onDelete,
        className: externalClassName,
    } = props;
    const classes = useStyles();
    const { t } = useTranslation(['tag']);
    const workingSpaceService = useWorkingSpaceService();
    const { dispatchContextMenu } = useContextMenuService((baseContextMenu) => baseContextMenu({
        itemId: id,
        itemType: 'tag',
    }));
    const [isPin, setIsPin] = useState(workingSpaceService.findFavorite({
        itemId: id,
        itemType: 'tag',
    }));

    const repairColor = colorKey ? getUniqueColor(colorKey) || '#686868' : '#686868';

    useEffect(() => {
        setIsPin(workingSpaceService.findFavorite({
            itemId: id,
            itemType: 'tag',
        }));
    }, [workingSpaceService.favorites.length]);

    if (dense) {
        const repairColorTransparent = alpha(repairColor, 0.14);
        const repairColorDeleteBtn = alpha(lighten(repairColor, 0.86), 0.84);

        return (
            <Box
                className={clsx(classes.root, classes.dense, onDelete && classes.denseWithDelete, externalClassName)}
                style={{ backgroundColor: repairColorTransparent }}
                onClick={onClick}
            >
                {name}
                {onDelete && (
                    <Tooltip title={t('editor.button.remove_description')}>
                        <IconButton
                            className={classes.deleteDense}
                            style={{ backgroundColor: repairColorDeleteBtn }}
                            onClick={onDelete}
                        >
                            <CloseIcon className={classes.deleteIconDense} />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>
        );
    }

    return (
        <ButtonBase
            className={clsx(classes.root, classes.normal, isSelect && classes.active, externalClassName)}
            style={{
                backgroundColor: isSelect && alpha(repairColor, 0.14),
                borderColor: isSelect && repairColor,
            }}
            onClick={onClick}
            onContextMenu={dispatchContextMenu}
        >
            <div className={classes.colorIcon} style={{ backgroundColor: repairColor }} />
            <Typography component="span" className={classes.text}>
                {name}
            </Typography>
            {isPin && (
                <FavoriteIcon className={classes.favorite} />
            )}
        </ButtonBase>
    );
}

export default observer(Tag);
