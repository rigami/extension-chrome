import React from 'react';
import { alpha, makeStyles, useTheme } from '@material-ui/core/styles';
import { Box, Typography } from '@material-ui/core';
import { first } from 'lodash';
import { FolderRounded as FolderIcon, LabelRounded as TagIcon } from '@material-ui/icons';
import clsx from 'clsx';
import { BKMS_VARIANT } from '@/enum';
import Image from '@/ui-components/Image';

const useStyles = makeStyles((theme) => ({
    favoriteItem: {
        display: 'flex',
        alignItems: 'center',
        minHeight: 36,
        padding: theme.spacing(0.5),
        borderRadius: 'inherit',
    },
    icon: {
        marginRight: theme.spacing(1),
        width: 28,
        height: 28,
        flexShrink: 0,
        borderRadius: 6,
    },
    title: {
        overflow: 'hidden',
        lineHeight: 1.1,
        wordBreak: 'break-word',
        fontWeight: 600,
        fontSize: '0.94rem',
        marginRight: theme.spacing(1),
        maxWidth: 360,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
}));

function FavoriteItem(props) {
    const {
        type,
        name,
        icoUrl,
        icoVariant,
        color,
        className: externalClassName,
    } = props;
    const classes = useStyles();
    const theme = useTheme();

    return (
        <Box className={clsx(classes.favoriteItem, externalClassName)}>
            {type === 'bookmark' && (
                <Image
                    src={icoUrl}
                    alternativeIcon={first(name)?.toUpperCase()}
                    variant={icoVariant === BKMS_VARIANT.POSTER ? BKMS_VARIANT.SYMBOL : icoVariant}
                    className={classes.icon}
                    dense
                />
            )}
            {type === 'folder' && (
                <FolderIcon className={classes.icon} style={{ color: alpha(theme.palette.text.secondary, 0.23) }} />
            )}
            {type === 'tag' && (
                <TagIcon className={classes.icon} style={{ color }} />
            )}
            <Typography className={classes.title}>
                {name}
            </Typography>
        </Box>
    );
}

export default FavoriteItem;
