import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    CircularProgress,
    Box,
    Typography,
} from '@material-ui/core';
import {
    ToggleButtonGroup,
    ToggleButton,
} from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import CardLink from '@/ui/Bookmarks/CardLink';
import { getImageRecalc } from "@/utils/siteSearch"
import { BKMS_VARIANT } from "@/enum";
import FullScreenStub from "@/ui-components/FullscreenStub";
import { useLocalStore, useObserver } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
    root: {
        marginBottom: theme.spacing(2),
        position: 'relative',
    },
    headerActions: {
        marginRight: 0,
        marginTop: 0,
    },
    content: {
        padding: theme.spacing(2),
        paddingTop: 0,
        paddingRight: 0,
        paddingBottom: '0 !important',
        display: 'flex',
        flexWrap: 'wrap',
    },
    card: {
        marginRight: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    loadStatus: {
        position: 'absolute',
        zIndex: 1,
        right: theme.spacing(1),
        bottom: theme.spacing(1),
        padding: theme.spacing(0.5, 1.5),
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
    },
    progressIcon: {
        color: theme.palette.common.white,
        marginRight: theme.spacing(1),
    },
    fullscreenStub: {
        margin: theme.spacing(4),
        marginLeft: theme.spacing(2),
    },
}));


function PreviewSelector(props) {
    const {
        name,
        description,
        categories,
        onChange,
        images: defaultImages,
    } = props;
    const classes = useStyles();
    const store = useLocalStore(() => ({
        loadedImages: [],
        size: defaultImages.length,
    }));

    useEffect(() => {
        store.loadedImages = defaultImages
                .filter(({ score }) => score !== 0)
                .sort(({ score: scoreA }, { score: scoreB }) => {
                    if (scoreA < scoreB) return 1;
                    if (scoreA > scoreB) return -1;
                    return 0;
                });
        store.size = defaultImages.length;

        defaultImages.filter(({ score }) => score === 0).forEach((image) => {
            getImageRecalc(image.name)
                .then((newData) => {
                    const insertIndex = store.loadedImages.findIndex(({score}) => score < newData.score);
                    store.loadedImages.splice(insertIndex === -1 ? store.loadedImages.length : insertIndex, 0, newData)
                })
                .catch(() => {
                    store.size -= 1;
                })
        })
    }, [defaultImages.length]);

    useEffect(() => console.log(store.loadedImages), [store.loadedImages.length]);

    return useObserver(() => (
        <Card className={classes.root} elevation={8}>
            <CardHeader
                title="Другие варианты карточек"
                classes={{
                    action: classes.headerActions,
                }}
            />
            <CardContent className={classes.content}>
                {store.loadedImages.map(({ url, type, score }) => (
                    <CardLink
                        key={url}
                        name={"["+score+"] "+name}
                        description={description}
                        categories={categories}
                        icoVariant={type}
                        imageUrl={url}
                        preview
                        className={classes.card}
                        onClick={() => {
                            console.log("onClick")
                            onChange(url, type);
                        }}
                    />
                ))}
                {store.loadedImages.length === 0 && (
                    <FullScreenStub className={classes.fullscreenStub}>
                        <CircularProgress />
                    </FullScreenStub>
                )}
            </CardContent>
            {store.size !== store.loadedImages.length && (
                <Box className={classes.loadStatus}>
                    <Typography variant="caption">
                        Загрузка {store.loadedImages.length} из {store.size}...
                    </Typography>
                </Box>
            )}
        </Card>
    ));
}

export default PreviewSelector;
