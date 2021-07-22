import React from 'react';
import { alpha, makeStyles, useTheme } from '@material-ui/core/styles';
import { Card, Typography } from '@material-ui/core';
import Image from '@/ui-components/Image';
import { first } from 'lodash';
import { BKMS_VARIANT } from '@/enum';
import { FolderRounded as FolderIcon, LabelRounded as TagIcon } from '@material-ui/icons';
import clsx from 'clsx';

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
        fontFamily: theme.typography.primaryFontFamily,
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
        <Card className={clsx(classes.favoriteItem, externalClassName)} variant="outlined">
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
        </Card>
    );
}

export default FavoriteItem;
