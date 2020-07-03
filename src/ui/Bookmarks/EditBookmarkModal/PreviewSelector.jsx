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
    const [icoVariant, setIcoVariant] = useState(BKMS_VARIANT.SMALL);
    const [images, setImages] = useState([]);
    const [size, setSize] = useState(defaultImages.length);

    useEffect(() => {
        setImages(
            defaultImages
                .filter(({ score }) => score !== 0)
                .sort(({ score: scoreA }, { score: scoreB }) => {
                    if (scoreA < scoreB) return 1;
                    if (scoreA > scoreB) return -1;
                    return 0;
                })
        );

        defaultImages.filter(({ score }) => score === 0).forEach((image) => {
            getImageRecalc(image.name)
                .then((newData) => {
                    setImages((oldImages) => {
                        const insertIndex = Math.max(oldImages.findIndex(({score}) => score < newData.score), 0);
                        oldImages.splice(insertIndex, 0, newData)

                        return oldImages;
                    });
                })
                .catch(() => {
                    setSize((oldSize) => oldSize - 1);
                })
        })
    }, [defaultImages.length]);

    return (
        <Card className={classes.root} elevation={8}>
            <CardHeader
                title="Другие варианты карточек"
                classes={{
                    action: classes.headerActions,
                }}
                action={(
                    <ToggleButtonGroup
                        exclusive
                        value={icoVariant}
                        onChange={(event, newType) => newType && setIcoVariant(newType)}
                    >
                        <ToggleButton value={BKMS_VARIANT.SMALL}>
                            Мальнкая иконка
                        </ToggleButton>
                        <ToggleButton value={BKMS_VARIANT.POSTER}>
                            Постер
                        </ToggleButton>
                    </ToggleButtonGroup>
                )}
            />
            <CardContent className={classes.content}>
                {images.map(({ url, type, score }) => (
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
                            onChange(url, icoVariant);
                        }}
                    />
                ))}
                {images.length === 0 && (
                    <FullScreenStub className={classes.fullscreenStub}>
                        <CircularProgress />
                    </FullScreenStub>
                )}
            </CardContent>
            {size !== images.length && (
                <Box className={classes.loadStatus}>
                    <Typography variant="caption">
                        Загрузка {images.length} из {size}...
                    </Typography>
                </Box>
            )}
        </Card>
    );
}

export default PreviewSelector;
