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
import { makeStyles, useTheme } from '@material-ui/core/styles';
import CardLink from '@/ui/Bookmarks/CardLink';
import FullScreenStub from '@/ui-components/FullscreenStub';
import { useTranslation } from 'react-i18next';
import {BKMS_VARIANT, FETCH} from "@/enum";

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
        backgroundColor: theme.palette.type === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200],
        boxSizing: 'content-box',
        width: 182,
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
        marginTop: 'auto',
        wordBreak: 'break-word',
    },
    warnIcon: {
        marginRight: theme.spacing(1),
    },
}));


function Preview(props) {
    const {
        url,
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
    const { t } = useTranslation();
    const theme = useTheme();
    const [state, setState] = useState(FETCH.PENDING);

    useEffect(() => {
        setState(FETCH.PENDING);
        if (!imageUrl || icoVariant === BKMS_VARIANT.SYMBOL) {
            setState(FETCH.DONE);
            return;
        }

        const imgCache = document.createElement('img');
        imgCache.onload = () => {
            setState(FETCH.DONE);
        };
        imgCache.onerror = () => {
            setState(FETCH.FAILED);
        };
        imgCache.src = imageUrl;
    }, [imageUrl]);

    let pendingState;

    if (name && (state === FETCH.DONE || icoVariant === BKMS_VARIANT.SYMBOL)) {
        pendingState = "DONE";
    } else if (!url) {
        pendingState = "FAILED_URL";
    } else if (!name) {
        pendingState = "FAILED_NAME";
    }

    return (
        <CardMedia
            className={classes.cover}
        >
            {(state === FETCH.PENDING || globalState === FETCH.PENDING) && (
                <FullScreenStub>
                    <CircularProgress color="primary" />
                </FullScreenStub>
            )}
            {state !== FETCH.PENDING && globalState !== FETCH.PENDING && (
                <React.Fragment>
                    {(pendingState === 'DONE' || state === FETCH.FAILED) && (
                        <Button
                            className={classes.typeSwitcher}
                            onClick={onChangeType}
                            startIcon={isOpen ? (<CloseIcon />) : (<OpenIcon />)}
                            fullWidth
                        >
                            {t("bookmark.editor.alternativeIcons")}
                        </Button>
                    )}
                    {pendingState === 'DONE' && (
                        <CardLink
                            name={name}
                            description={description}
                            categories={categories}
                            icoVariant={icoVariant}
                            imageUrl={imageUrl}
                            preview
                        />
                    )}
                    {pendingState === "FAILED_URL" && (
                        <FullScreenStub
                            iconRender={(renderProps) => (<URLIcon {...renderProps} />)}
                            description={t("bookmark.editor.helper.writeURL")}
                        />
                    )}
                    {pendingState === "FAILED_NAME" && (
                        <FullScreenStub
                            iconRender={(renderProps) => (<URLIcon {...renderProps} />)}
                            description={t("bookmark.editor.helper.writeName")}
                        />
                    )}
                    {state === FETCH.FAILED && (
                        <Box className={classes.warnMessage}>
                            <WarnIcon  className={classes.warnIcon} />
                            {t("bookmark.editor.errorLoadIcon")}
                        </Box>
                    )}
                </React.Fragment>
            )}
        </CardMedia>
    );
}

export default Preview;
