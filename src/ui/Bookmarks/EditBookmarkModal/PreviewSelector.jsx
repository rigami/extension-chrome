import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    Fade,
    Collapse,
} from '@material-ui/core';
import {
    ToggleButtonGroup,
    ToggleButton,
} from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import CardLink from '@/ui/Bookmarks/CardLink';
import { getImageRecalc } from "@/utils/siteSearch"

const useStyles = makeStyles((theme) => ({
    root: {
        marginBottom: theme.spacing(2),
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
}));


function PreviewSelector(props) {
    const {
        isOpen,
        name,
        description,
        categories,
        onChange,
        images: defaultImages,
    } = props;
    const classes = useStyles();
    const [icoVariant, setIcoVariant] = useState('small');
    const [images, setImages] = useState([]);

    useEffect(() => {
        console.log(defaultImages, defaultImages
            .filter(({ score }) => score !== 0)
            .sort(({ score: scoreA }, { score: scoreB }) => {
                if (scoreA < scoreB) return 1;
                if (scoreA > scoreB) return -1;
                return 0;
            }))
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
            getImageRecalc(`http://localhost:8080/icon_parse/recalc/${image.name}`)
                .then((newData) => {
                    setImages((oldImages) => {
                        const insertIndex = Math.max(oldImages.findIndex(({score}) => score < newData.score), 0);
                        oldImages.splice(insertIndex, 0, newData)
                        console.log("NEW DATA ICON", newData, insertIndex, oldImages)

                        return oldImages;
                    })
                })
        })
    }, [defaultImages.length]);

    return (
        <Collapse in={isOpen} unmountOnExit>
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
                            <ToggleButton value="small">
                                Мальнкая иконка
                            </ToggleButton>
                            <ToggleButton value="poster">
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
                            icoVariant={type.toLowerCase()}
                            imageUrl={url}
                            preview
                            className={classes.card}
                            onClick={() => {
                                console.log("onClick")
                                onChange(url, icoVariant);
                            }}
                        />
                    ))}
                </CardContent>
            </Card>
        </Collapse>
    );
}

export default PreviewSelector;
