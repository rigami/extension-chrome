import React, { useEffect, useState } from 'react';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import { Box, ButtonBase, Typography } from '@material-ui/core';
import clsx from 'clsx';
import { fade, makeStyles } from '@material-ui/core/styles';
import { FavoriteRounded as FavoriteIcon } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';
import useContextMenu from '@/stores/app/ContextMenuProvider';

const useStyles = makeStyles((theme) => ({
    root: {
        maxWidth: 290,
        boxShadow: 'none !important',
        display: 'inline-flex',
        border: '1px solid #000',
        flexDirection: 'row',
        height: 'fit-content',
        minHeight: theme.spacing(4),
        alignItems: 'center',
        borderRadius: theme.spacing(2),
        borderColor: theme.palette.divider,
        boxSizing: 'border-box',
    },
    colorIcon: {
        width: theme.spacing(1.5),
        height: theme.spacing(1.5),
        borderRadius: '50%',
        marginLeft: theme.spacing(1),
        flexShrink: 0,
        marginRight: theme.spacing(1),
        opacity: 0.6,
    },
    text: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        fontSize: '0.9rem',
    },
    active: {},
    favorite: {
        color: theme.palette.error.main,
        width: 12,
        height: 12,
    },
    favoriteWrapper: {
        width: theme.spacing(2.5),
        display: 'flex',
        justifyContent: 'center',
        marginRight: theme.spacing(0.625),
    },
}));

function Tag(props) {
    const {
        id,
        name,
        color,
        onClick,
        isSelect,
        className: externalClassName,
    } = props;
    const classes = useStyles();
    const bookmarksService = useBookmarksService();
    const contextMenu = useContextMenu({
        itemId: id,
        itemType: 'tag',
    });
    const [isPin, setIsPin] = useState(bookmarksService.findFavorite({
        itemId: id,
        itemType: 'tag',
    }));

    const repairColor = color || '#000';

    useEffect(() => {
        setIsPin(bookmarksService.findFavorite({
            itemId: id,
            itemType: 'tag',
        }));
    }, [bookmarksService.favorites.length]);

    return (
        <ButtonBase
            className={clsx(classes.root, isSelect && classes.active, externalClassName)}
            style={{
                backgroundColor: isSelect && fade(repairColor, 0.14),
                borderColor: isSelect && repairColor,
            }}
            onClick={onClick}
            onContextMenu={contextMenu}
        >
            <div className={classes.colorIcon} style={{ backgroundColor: repairColor }} />
            <Typography component="span" className={classes.text}>
                {name}
            </Typography>
            <Box className={classes.favoriteWrapper}>
                {isPin && (
                    <FavoriteIcon className={classes.favorite} />
                )}
            </Box>
        </ButtonBase>
    );
}

export default observer(Tag);
