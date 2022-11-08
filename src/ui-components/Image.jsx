import React, { useState, useEffect } from 'react';
import {
    Avatar,
    CardMedia,
    Box,
} from '@material-ui/core';
import { LinkRounded as LinkIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { BKMS_VARIANT } from '@/enum';

const useStyles = makeStyles((theme) => ({
    roundedIconStub: { borderRadius: theme.shape.borderRadiusButtonBold },
    roundedIcon: {
        borderRadius: theme.shape.borderRadiusButtonBold,
        color: theme.palette.getContrastText(theme.palette.background.backdrop),
        fontWeight: 800,
        fontFamily: theme.typography.specialFontFamily,
    },
    roundedIconDefault: { backgroundColor: theme.palette.background.backdrop },
    skeleton: { backgroundColor: theme.palette.background.backdrop },
}));

function Image(props) {
    const {
        variant = BKMS_VARIANT.SMALL,
        src,
        className: externalClassName,
        classes: externalClasses = {},
        alternativeIcon,
        dense,
    } = props;
    const classes = useStyles();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (variant === BKMS_VARIANT.SYMBOL) {
            setIsLoading(false);
            return;
        }

        const imgCache = document.createElement('img');
        // eslint-disable-next-line no-multi-assign
        imgCache.onload = imgCache.onerror = () => {
            setIsLoading(false);
        };
        imgCache.src = src;
    }, []);

    if (variant === BKMS_VARIANT.POSTER || variant === BKMS_VARIANT.COVER) {
        return (
            <React.Fragment>
                {isLoading && (
                    <Box
                        width={180}
                        height={variant === BKMS_VARIANT.COVER ? 180 : 84}
                        className={clsx(classes.skeleton, externalClassName)}
                    />
                )}
                {!isLoading && (
                    <CardMedia className={externalClassName} image={src} />
                )}
            </React.Fragment>
        );
    } else {
        return (
            <React.Fragment>
                {isLoading && (
                    <Box
                        width={dense ? 28 : 32}
                        height={dense ? 28 : 32}
                        className={clsx(classes.skeleton, classes.roundedIconStub, externalClassName)}
                    />
                )}
                {!isLoading && (
                    <Avatar
                        className={clsx(classes.roundedIcon, externalClassName)}
                        classes={{
                            colorDefault: classes.roundedIconDefault,
                            img: externalClasses.rootImage,
                        }}
                        src={(variant !== BKMS_VARIANT.SYMBOL && src) || undefined}
                        variant="rounded"
                    >
                        {alternativeIcon || (<LinkIcon />)}
                    </Avatar>
                )}
            </React.Fragment>
        );
    }
}

export default Image;
