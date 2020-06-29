import React, { useState, useEffect } from 'react';
import {
    Avatar,
    CardMedia,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import {
    LinkRounded as LinkIcon,
} from '@material-ui/icons';

function Image({ type='circe', src, className: externalClassName }) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const imgCache = document.createElement('img');
        imgCache.onload = imgCache.onerror = () => {
            setIsLoading(false);
        };
        imgCache.src = src;
    }, []);

    if (type === 'circle') {
        return (
            <React.Fragment>
                {isLoading && (
                    <Skeleton
                        variant="circle"
                        animation="wave"
                        width={40}
                        height={40}
                        className={externalClassName}
                    />
                )}
                {!isLoading && (
                    <Avatar className={externalClassName} src={src}>
                        <LinkIcon />
                    </Avatar>
                )}
            </React.Fragment>
        );
    } else if (type === 'rect') {
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
    }
}

export default Image;
