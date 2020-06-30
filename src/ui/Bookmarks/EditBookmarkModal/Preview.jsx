import React, { useEffect, useState } from 'react';
import {
    Button,
    CardMedia,
    ButtonGroup,
    CircularProgress,
} from '@material-ui/core';
import {
    ExpandLessRounded as OpenIcon,
    ExpandMoreRounded as CloseIcon,
} from '@material-ui/icons';
import {
    LinkRounded as URLIcon,
} from '@material-ui/icons';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import CardLink from '@/ui/Bookmarks/CardLink';
import FullScreenStub from '@/ui-components/FullscreenStub';
import { AbortController, getSiteInfo } from "@/utils/siteSearch";

const useStyles = makeStyles((theme) => ({
    bgCardRoot: { display: 'flex' },
    content: { flex: '1 0 auto' },
    cover: {
        padding: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'column',
        flexGrow: 0,
        flexShrink: 0,
        backgroundColor: theme.palette.grey[900],
        boxSizing: 'content-box',
        minWidth: 180,
    },
    typeSwitcher: { marginBottom: theme.spacing(2) },
    controls: {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        justifyContent: 'flex-end',
    },
    button: {
        marginRight: theme.spacing(2),
        position: 'relative',
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
    },
    input: { marginTop: theme.spacing(2) },
    chipContainer: { marginTop: theme.spacing(2) },
    addDescriptionButton: { marginTop: theme.spacing(2) },
    warnMessage: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1, 0),
        color: theme.palette.warning.main,
    },
    warnIcon: {
        marginRight: theme.spacing(1),
    },
}));


function Preview(props) {
    const {
        imageUrl,
        isOpen,
        name,
        icoVariant,
        state: globalState,
        description,
        categories,
        onChangeType,
    } = props;
    const classes = useStyles();
    const theme = useTheme();
    const [state, setState] = useState('pending');

    useEffect(() => {
        setState('pending');
        if (!imageUrl) {
            setState('done');
            return;
        }

        const imgCache = document.createElement('img');
        imgCache.onload = () => {
            setState('done');
        };
        imgCache.onerror = () => {
            setState('failed');
        };
        imgCache.src = imageUrl;
    }, [imageUrl]);

    return (
        <CardMedia
            className={classes.cover}
        >
            {(state === 'pending' || globalState === 'loading_images') && (
                <CircularProgress style={{ color: theme.palette.common.white }} />
            )}
            {state !== 'pending' && globalState !== 'loading_images' && (
                <React.Fragment>
                    {state === 'done' && name && imageUrl && (
                        <React.Fragment>
                            <Button
                                className={classes.typeSwitcher}
                                onClick={onChangeType}
                                startIcon={isOpen ? (<CloseIcon />) : (<OpenIcon />)}
                                fullWidth
                            >
                                Ещё варианты
                            </Button>
                            <CardLink
                                name={name}
                                description={description}
                                categories={categories}
                                icoVariant={icoVariant}
                                imageUrl={imageUrl}
                                preview
                            />
                        </React.Fragment>
                    )}
                    {state === 'done' && !imageUrl && (
                        <FullScreenStub
                            iconRender={(renderProps) => (<URLIcon {...renderProps} />)}
                            description="Укажите адрес"
                        />
                    )}
                    {state === 'done' && !name && imageUrl && (
                        <FullScreenStub
                            iconRender={(renderProps) => (<URLIcon {...renderProps} />)}
                            description="Дайте закладке имя"
                        />
                    )}
                    {state === 'failed' && (
                        "Ошибка загрузки иконок, попробуйте другой адрес"
                    )}
                </React.Fragment>
            )}
        </CardMedia>
    );
}

export default Preview;
