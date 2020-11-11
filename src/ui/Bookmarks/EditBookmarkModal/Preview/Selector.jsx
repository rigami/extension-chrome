import React, { useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardContent,
    Box,
    Typography,
    Button,
    Badge,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import CardLink from '@/ui/Bookmarks/CardLink';
import { getImageRecalc } from '@/utils/siteSearch';
import { BKMS_VARIANT } from '@/enum';
import { useLocalObservable, useObserver } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
    root: { position: 'relative' },
    headerTitle: { wordBreak: 'break-word' },
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
    badgeButton: { width: '100%' },
}));

function PreviewSelectorToggleButton({ isOpen, onOpen, onClose, imagesCount }) {
    const { t } = useTranslation();
    const classes = useStyles();

    return (
        <Badge badgeContent={imagesCount} color="primary" className={classes.badgeButton}>
            <Button onClick={() => (isOpen ? onClose() : onOpen())} fullWidth variant="outlined">
                {!isOpen && t('bookmark.editor.alternativeIconsOpen')}
                {isOpen && t('bookmark.editor.alternativeIconsClose')}
            </Button>
        </Badge>
    );
}

function PreviewSelector(props) {
    const {
        name,
        description,
        categories,
        onSelect,
        images: defaultImages = [],
        onFailedLoadImage = () => {},
        onLoadImage = () => {},
        ...other
    } = props;
    const classes = useStyles();
    const { t } = useTranslation();
    const store = useLocalObservable(() => ({
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
        store.size = defaultImages.filter(({ failedLoad }) => !failedLoad).length;

        defaultImages.filter(({ score, failedLoad }) => score === 0 && !failedLoad).forEach((image) => {
            getImageRecalc(image.url)
                .then((newData) => {
                    const insertIndex = store.loadedImages.findIndex(({ score }) => score < newData.score);
                    store.loadedImages.splice(insertIndex === -1 ? store.loadedImages.length : insertIndex, 0, newData);
                    onLoadImage(image.url, newData);
                })
                .catch(() => {
                    store.size -= 1;
                    onFailedLoadImage(image.url);
                });
        });
    }, [defaultImages.length]);

    return useObserver(() => (
        <Card className={classes.root} elevation={8} {...other}>
            <CardHeader
                title={t('bookmark.editor.alternativeIconsTitle')}
                classes={{
                    title: classes.headerTitle,
                    action: classes.headerActions,
                }}
            />
            <CardContent className={classes.content}>
                {store.loadedImages.map(({ url, type, score }) => (
                    <CardLink
                        key={url}
                        name={PRODUCTION_MODE ? name : `[${score}] ${name}`}
                        description={description}
                        categories={categories}
                        icoVariant={type}
                        imageUrl={url}
                        preview
                        className={classes.card}
                        onClick={() => onSelect(url, type)}
                    />
                ))}
                <CardLink
                    name={name}
                    description={description}
                    imageUrl={null}
                    categories={categories}
                    icoVariant={BKMS_VARIANT.SYMBOL}
                    preview
                    className={classes.card}
                    onClick={() => onSelect(null, BKMS_VARIANT.SYMBOL)}
                />
            </CardContent>
            {store.size !== store.loadedImages.length && (
                <Box className={classes.loadStatus}>
                    <Typography variant="caption">
                        {t('loading')}
                        {' '}
                        {store.loadedImages.length}
                        {' '}
                        {t('from')}
                        {' '}
                        {store.size}
                        ...
                    </Typography>
                </Box>
            )}
        </Card>
    ));
}

export default PreviewSelector;
export { PreviewSelectorToggleButton };
