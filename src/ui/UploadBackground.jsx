import React, {
    useEffect,
    useRef,
    useState,
    memo,
} from 'react';
import {
    Button,
    Card,
    CardContent,
    CardMedia,
    CircularProgress,
    Container,
    Drawer,
    FormControlLabel,
    Switch,
    Tooltip,
    Typography,
    Box,
    IconButton,
} from '@material-ui/core';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { makeStyles, useTheme, alpha } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import {
    WarningRounded as WarningIcon,
    AddPhotoAlternateRounded as DropIcon,
    CloseRounded as CloseIcon,
} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import Scrollbar from '@/ui-components/CustomScroll';
import BeautifulFileSize from '@/utils/beautifulFileSize';
import useAppStateService from '@/stores/app/AppStateProvider';
import { captureException } from '@sentry/react';

const useStyles = makeStyles((theme) => ({
    preview: {
        height: 100,
        width: 177,
        backgroundSize: 'cover',
        backgroundPosition: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cellStickyHeader: { backgroundColor: theme.palette.common.white },
    bgCardRoot: { display: 'flex' },
    details: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
    },
    content: { flex: '1 0 auto' },
    cover: {
        width: 320,
        minHeight: 240,
        backgroundColor: theme.palette.primary.main,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    controls: {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        justifyContent: 'flex-end',
    },
    button: {
        marginRight: theme.spacing(1),
        position: 'relative',
    },
    buttonProgress: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -12,
        marginLeft: -12,
    },
    dragFile: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: theme.zIndex.dropFiles,
        backgroundColor: alpha(theme.palette.common.black, 0.65),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color: theme.palette.common.white,
        '& *': { pointerEvents: 'none' },
    },
    closeIcon: {
        position: 'absolute',
        top: theme.spacing(2),
        right: theme.spacing(2),
        color: theme.palette.common.white,
        zIndex: theme.zIndex.modal + 1,
    },
}));

function BGCard(props) {
    const {
        name,
        previewUrl,
        preview,
        size,
        type,
        format,
        antiAliasing: defaultAntiAliasing,
        onRemove,
        onDone,
        ...other
    } = props;
    const { t } = useTranslation(['background']);
    const classes = useStyles();
    const theme = useTheme();

    const [save, setSave] = useState(false);
    const [antiAliasing, setAntiAliasing] = useState(defaultAntiAliasing);

    return (
        <Card className={classes.bgCardRoot} elevation={8} {...other}>
            <CardMedia
                className={classes.cover}
                image={previewUrl}
            >
                {preview === 'pending' && (
                    <CircularProgress style={{ color: theme.palette.common.white }} />
                )}
                {preview === 'failed' && (
                    <WarningIcon style={{ color: theme.palette.common.white }} />
                )}
            </CardMedia>
            <div className={classes.details}>
                <CardContent className={classes.content}>
                    <Typography component="h5" variant="h5">
                        {t(`type.${type}`)}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        {`${t('upload.file')}: ${name}`}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        {`${t('upload.size')}: ${BeautifulFileSize(size)[0]}${BeautifulFileSize(size)[1]}`}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        {`${t('upload.fileType')}: ${format}`}
                    </Typography>
                    <Tooltip title={t('upload.button.antiAliasing', { context: 'helper' })}>
                        <FormControlLabel
                            control={(
                                <Switch
                                    onChange={(e) => setAntiAliasing(e.target.checked)}
                                    disabled={save}
                                    color="primary"
                                    defaultChecked={antiAliasing}
                                />
                            )}
                            label={t('upload.button.antiAliasing')}
                        />
                    </Tooltip>
                </CardContent>
                <div className={classes.controls}>
                    <Button
                        data-ui-path="uploadBG.bg.cancel"
                        variant="text"
                        color="default"
                        disabled={save}
                        // startIcon={<DeleteIcon/>}
                        className={classes.button}
                        onClick={onRemove}
                    >
                        {t('common:button.cancel')}
                    </Button>
                    <div className={classes.button}>
                        <Button
                            data-ui-path="uploadBG.bg.addToLibrary"
                            variant="contained"
                            color="primary"
                            disabled={save}
                            // startIcon={<SuccessIcon/>}
                            onClick={() => {
                                setSave(true);
                                onDone({ antiAliasing });
                            }}
                        >
                            {t('button.addToLibrary')}
                        </Button>
                        {save && <CircularProgress size={24} className={classes.buttonProgress} />}
                    </div>
                </div>
            </div>
        </Card>
    );
}

const MemoBGCard = memo(BGCard);

function UploadBackground({ children }) {
    const { backgrounds } = useAppStateService();
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslation(['background']);

    const classes = useStyles();
    const theme = useTheme();

    const dragRef = useRef(null);
    const [dragFiles, setDragFiles] = useState(null);
    const store = useLocalObservable(() => ({
        requireScrollToBottom: false,
        uploadQueueSize: 0,
    }));

    useEffect(() => {
        addEventListener('dragenter', (event) => {
            setDragFiles(Array.prototype.filter.call(
                event.dataTransfer.items,
                (file) => (~file.type.indexOf('image/') || ~file.type.indexOf('video/')),
            ));
        });
    }, []);

    useEffect(() => {
        if (!dragRef.current) return;

        dragRef.current.ondragleave = () => {
            setDragFiles(null);
        };

        dragRef.current.ondragover = (event) => {
            event.preventDefault();
        };

        dragRef.current.ondrop = (event) => {
            event.preventDefault();
            setDragFiles(null);
            backgrounds.addToUploadQueue(event.dataTransfer.files)
                .catch((e) => {
                    captureException(e);
                    enqueueSnackbar({
                        ...t(`upload.error.${e}`),
                        variant: 'error',
                    });
                });
        };
    }, [dragFiles]);

    useEffect(() => {
        if (store.uploadQueueSize === 0) {
            store.requireScrollToBottom = true;
        }
        store.uploadQueueSize = backgrounds.uploadQueue.length;
    }, [backgrounds.uploadQueue.length]);

    return (
        <React.Fragment>
            {children}
            {dragFiles && dragFiles.length > 0 && (
                <Box className={classes.dragFile} ref={dragRef}>
                    <DropIcon style={{
                        marginBottom: theme.spacing(2),
                        fontSize: 48,
                    }}
                    />
                    <Typography variant="h6">
                        {t('upload.dropToAdd', { count: dragFiles.length })}
                    </Typography>
                </Box>
            )}
            <Drawer
                anchor="bottom"
                open={backgrounds.uploadQueue.length !== 0}
                PaperProps={{
                    elevation: 0,
                    style: {
                        background: 'none',
                        height: '100%',
                    },
                }}
                disableEnforceFocus
            >
                <Scrollbar
                    refScroll={(ref) => {
                        if (ref && store.requireScrollToBottom) {
                            store.requireScrollToBottom = false;
                            ref.scrollToBottom();
                        }
                    }}
                >
                    <Container
                        maxWidth="md"
                        style={{
                            paddingBottom: theme.spacing(3),
                            paddingTop: theme.spacing(3),
                            minHeight: '100vh',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                        }}
                    >
                        {backgrounds.uploadQueue.slice().reverse().map((row, index) => (
                            <MemoBGCard
                                key={row.id}
                                {...row}
                                style={{ marginTop: index === 0 ? 0 : theme.spacing(3) }}
                                onRemove={() => backgrounds.removeFromUploadQueue(row.id)}
                                onDone={(options) => backgrounds.saveFromUploadQueue(row.id, options)}
                            />
                        ))}
                    </Container>
                </Scrollbar>
            </Drawer>
            {(backgrounds.uploadQueue.length !== 0) && (
                <Tooltip title={t('upload.button.discardAll')}>
                    <IconButton
                        data-ui-path="uploadBG.discardAll"
                        className={classes.closeIcon}
                        onClick={() => backgrounds.resetUploadQueue()}
                    >
                        <CloseIcon />
                    </IconButton>
                </Tooltip>
            )}
        </React.Fragment>
    );
}

export default observer(UploadBackground);
