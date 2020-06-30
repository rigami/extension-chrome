import React, { useState, useEffect } from 'react';
import {
    Avatar,
    CardMedia,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import {
    LinkRounded as LinkIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    roundedIconStub: {
        borderRadius: theme.shape.borderRadiusBold,
    },
    roundedIcon: {
        padding: theme.spacing(0.5),
        borderRadius: theme.shape.borderRadiusBold,
        backgroundColor: theme.palette.common.white,
    },
}));

function Image({ variant='small', src, className: externalClassName }) {
    const classes = useStyles();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const imgCache = document.createElement('img');
        imgCache.onload = imgCache.onerror = () => {
            setIsLoading(false);
        };
        imgCache.src = src;
    }, []);

    if (variant === 'poster'){
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
                    <Avatar className={clsx(classes.roundedIcon, externalClassName)} src={src} variant={"rounded"}>
                        <LinkIcon />
                    </Avatar>
                )}
            </React.Fragment>
        );
    }
}

export default Image;
