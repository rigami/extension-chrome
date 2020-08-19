import React, { useState, useEffect } from 'react';
import {
    Avatar,
    CardMedia,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { LinkRounded as LinkIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { BKMS_VARIANT } from '@/enum';

const useStyles = makeStyles((theme) => ({
    roundedIconStub: { borderRadius: theme.shape.borderRadiusBold },
    roundedIcon: {
        borderRadius: theme.shape.borderRadiusBold,
        backgroundColor: theme.palette.common.white,
        color: theme.palette.getContrastText(theme.palette.common.white),
        fontWeight: 800,
    },
}));

function Image({ variant = BKMS_VARIANT.SMALL, src, className: externalClassName, alternativeIcon }) {
    const classes = useStyles();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (variant === BKMS_VARIANT.SYMBOL) {
            setIsLoading(false);
            return;
        }

        const imgCache = document.createElement('img');
        imgCache.onload = imgCache.onerror = () => {
            setIsLoading(false);
        };
        imgCache.src = src;
    }, []);

    if (variant === BKMS_VARIANT.POSTER) {
        return (
            <React.Fragment>
                {isLoading && (
                    <Skeleton
                        variant="rect"
                        animation="wave"
                        width={180}
                        height={90}
                        className={externalClassName}
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
                    <Skeleton
                        variant="rect"
                        animation="wave"
                        width={40}
                        height={40}
                        className={clsx(classes.roundedIconStub, externalClassName)}
                    />
                )}
                {!isLoading && (
                    <Avatar
                        className={clsx(classes.roundedIcon, externalClassName)}
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
