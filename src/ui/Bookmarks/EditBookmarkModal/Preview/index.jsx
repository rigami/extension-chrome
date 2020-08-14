import React, { useEffect, useState } from 'react';
import {
    Button,
    CardMedia,
    Box,
    CircularProgress,
} from '@material-ui/core';
import {
    ExpandLessRounded as OpenIcon,
    ExpandMoreRounded as CloseIcon,
    WarningRounded as WarnIcon,
} from '@material-ui/icons';
import {
    LinkRounded as URLIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import CardLink from '@/ui/Bookmarks/CardLink';
import FullScreenStub from '@/ui-components/FullscreenStub';
import { useTranslation } from 'react-i18next';
import {BKMS_VARIANT, FETCH} from "@/enum";

const useStyles = makeStyles((theme) => ({
    cover: {
        padding: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'column',
        flexGrow: 0,
        flexShrink: 0,
        backgroundColor: theme.palette.type === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200],
        boxSizing: 'content-box',
        width: 182,
    },
    typeSwitcher: { marginBottom: theme.spacing(2) },
    warnMessage: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1, 0),
        color: theme.palette.warning.main,
        marginTop: 'auto',
        wordBreak: 'break-word',
    },
    warnIcon: {
        marginRight: theme.spacing(1),
    },
    card: {
        marginTop: theme.spacing(2),
    },
}));

const STAGE = {
    PARSING_SITE: 'PARSING_SITE',
    WAIT_REQUEST: 'WAIT_REQUEST',
    WAIT_RESULT: 'WAIT_RESULT',
    WAIT_NAME: 'WAIT_NAME',
    DONE: 'DONE',
};


function Preview(props) {
    const {
        stage = STAGE.WAIT_REQUEST,
        name,
        imageUrl,
        icoVariant,
        description,
        categories,
        header,
        onErrorLoadImage = () => {},
    } = props;
    const classes = useStyles();
    const { t } = useTranslation();
    const [stateImageLoad, setStateImageLoad] = useState(FETCH.PENDING);

    useEffect(() => {
        setStateImageLoad(FETCH.PENDING);
        if (!imageUrl || icoVariant === BKMS_VARIANT.SYMBOL) {
            setStateImageLoad(FETCH.DONE);
            return;
        }

        const imgCache = document.createElement('img');
        imgCache.onload = () => {
            setStateImageLoad(FETCH.DONE);
        };
        imgCache.onerror = () => {
            setStateImageLoad(FETCH.FAILED);
            onErrorLoadImage();
        };
        imgCache.src = imageUrl;
    }, [imageUrl]);

    return (
        <CardMedia
            className={classes.cover}
        >
            {stage === STAGE.WAIT_REQUEST && (
                <FullScreenStub
                    iconRender={(renderProps) => (<URLIcon {...renderProps} />)}
                    description={t("bookmark.editor.helper.writeURL")}
                />
            )}
            {stage === STAGE.WAIT_RESULT && (
                <FullScreenStub
                    iconRender={(renderProps) => (<URLIcon {...renderProps} />)}
                    description={t("bookmark.editor.helper.selectResult")}
                />
            )}
            {stage === STAGE.WAIT_NAME && (
                <FullScreenStub
                    iconRender={(renderProps) => (<URLIcon {...renderProps} />)}
                    description={t("bookmark.editor.helper.writeName")}
                />
            )}
            {stage === STAGE.DONE && header}
            {(stage === STAGE.PARSING_SITE || stateImageLoad === FETCH.PENDING) && (
                <FullScreenStub>
                    <CircularProgress color="primary" />
                </FullScreenStub>
            )}
            {stage === STAGE.DONE && stateImageLoad === FETCH.DONE && (
                <CardLink
                    name={name}
                    description={description}
                    categories={categories}
                    icoVariant={icoVariant}
                    imageUrl={imageUrl}
                    preview
                    className={classes.card}
                />
            )}
            {stage === STAGE.DONE && stateImageLoad === FETCH.FAILED && (
                <Box className={classes.warnMessage}>
                    <WarnIcon  className={classes.warnIcon} />
                    {t("bookmark.editor.errorLoadIcon")}
                </Box>
            )}
        </CardMedia>
    );
}

export default Preview;
export { STAGE };
