import React, { Fragment, useEffect } from 'react';
import {
    Button,
    Box,
    CardContent,
    Typography,
    CircularProgress,
    InputBase,
    Divider,
    InputAdornment,
    IconButton,
} from '@material-ui/core';
import { DoneRounded as DoneIcon, ArrowForwardRounded as SearchIcon } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { captureException } from '@sentry/react';
import clsx from 'clsx';
import { FETCH } from '@/enum';
import TagsFiled from '@/ui/WorkingSpace/Bookmark/Editor/TagsFiled';
import Folders from '@/ui/WorkingSpace/Folders';
import Search from '@/ui/WorkingSpace/Bookmark/Editor/SearchSiteField/Search';
import Scrollbar from '@/ui-components/CustomScroll';

const useStyles = makeStyles((theme) => ({
    content: {
        backgroundColor: theme.palette.background.backdrop,
        borderRadius: theme.shape.borderRadiusButton,
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: '0 !important',
        overflow: 'auto',
    },
    contentBackdrop: {
        backgroundColor: theme.palette.background.backdropLight,
        borderRadius: theme.shape.borderRadiusButton,
        margin: theme.spacing(2),
        marginLeft: 0,
        marginBottom: 0,
        flexGrow: 1,
    },
    header: { marginBottom: theme.spacing(1) },
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
        minHeight: 500,
        overflow: 'auto',
    },
    input: {
        marginBottom: theme.spacing(2),
        marginRight: theme.spacing(-2),
        width: `calc(100% + ${theme.spacing(1)}px)`,
    },
    inputUrl: { textOverflow: 'ellipsis' },
    inputDescription: { marginBottom: theme.spacing(1) },
    addDescriptionButton: {
        marginBottom: theme.spacing(1),
        marginLeft: theme.spacing(-1),
        fontWeight: theme.typography.body1.fontWeight,
        fontSize: theme.typography.body2.fontSize,
        color: theme.palette.text.secondary,
        alignSelf: 'flex-start',
        padding: theme.spacing(0.25, 1.25),
    },
    saveIcon: {
        height: theme.spacing(2),
        width: theme.spacing(2),
        marginRight: theme.spacing(1),
        verticalAlign: 'text-bottom',
    },
    identBlock: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing(2),
    },
    folderPicker: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    identBlockIcon: { marginRight: theme.spacing(1) },
    identBlockIconTopAlign: {
        height: theme.spacing(4),
        alignSelf: 'flex-start',
    },
    inputName: { fontSize: theme.typography.h6.fontSize },
    stateCaption: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1, 2),
        justifyContent: 'flex-end',
        height: theme.spacing(2),
        boxSizing: 'content-box',
        marginTop: 'auto',
        flexShrink: 0,
    },
    saveInCurrentFolderCaption: { padding: theme.spacing(0, 0.75) },
    scrollFixedBorderRadius: { borderRadius: 'inherit' },
    scrollContainerTrack: { right: -10 },
    scrollScrollContent: {
        width: '100%',
        display: 'block !important',
    },
}));

function Fields({ editorService: service }) {
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const store = useLocalObservable(() => ({
        saveState: FETCH.WAIT,
        query: service.url,
    }));

    const save = async () => {
        store.saveState = FETCH.PENDING;

        try {
            await service.save();
            store.saveState = FETCH.DONE;
        } catch (e) {
            captureException(e);
            store.saveState = FETCH.FAILED;
        }

        if (service.unsavedChange) await save();
    };

    const handleApplySearchForce = () => {
        service.updateValues({ url: store.query });
    };

    useEffect(() => {
        if (service.isChange) store.saveState = FETCH.WAIT;
    }, [service.isChange]);

    useEffect(() => {
        if (!service.unsavedChange || store.saveState === FETCH.PENDING) return;

        save();
    }, [service.unsavedChange]);

    useEffect(() => {
        store.query = service.url;
    }, [service.url]);

    return (
        <Box className={classes.details}>
            <Box className={classes.contentBackdrop}>
                <Scrollbar
                    classes={{
                        root: classes.scrollFixedBorderRadius,
                        wrapper: classes.scrollFixedBorderRadius,
                        trackY: classes.scrollContainerTrack,
                        content: classes.scrollScrollContent,
                    }}
                >
                    <CardContent className={classes.content}>
                        <InputBase
                            placeholder={t('editor.bookmarkUrl', { context: 'placeholder' })}
                            fullWidth
                            autoFocus
                            spellCheck={false}
                            value={store.query}
                            className={classes.input}
                            classes={{ input: classes.inputUrl }}
                            onChange={(event) => {
                                store.query = event.target.value;
                            }}
                            onKeyDown={(event) => {
                                if (event.code === 'Enter') {
                                    handleApplySearchForce();
                                }
                            }}
                            endAdornment={store.query && (store.query !== service.url || !service.url) && (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleApplySearchForce}>
                                        <SearchIcon />
                                    </IconButton>
                                </InputAdornment>
                            )}
                        />
                        {(store.query !== service.url || !service.url) && (
                            <Search
                                query={store.query}
                                onSelect={(result) => {
                                    store.query = '';
                                    service.updateValues(result);
                                }}
                            />
                        )}
                        {store.query === service.url && service.url && (
                            <Fragment>
                                <InputBase
                                    placeholder={t('editor.bookmarkName', { context: 'placeholder' })}
                                    fullWidth
                                    multiline
                                    value={service.name}
                                    className={clsx(classes.inputName, classes.input)}
                                    onChange={(event) => service.updateValues({ name: event.target.value })}
                                    onKeyDown={(event) => {
                                        if (event.code === 'Enter') {
                                            event.preventDefault();
                                            event.stopPropagation();
                                        }
                                    }}
                                />
                                <TagsFiled
                                    selectedTags={service.tags}
                                    onChange={(newTags) => service.updateValues({ tags: newTags })}
                                    className={classes.input}
                                />
                                {service.useDescription && (
                                    <InputBase
                                        autoFocus
                                        placeholder={t('editor.bookmarkDescription', { context: 'placeholder' })}
                                        fullWidth
                                        value={service.description}
                                        className={clsx(classes.inputDescription)}
                                        multiline
                                        rows={1}
                                        rowsMax={6}
                                        onChange={(event) => service.updateValues({ description: event.target.value })}
                                    />
                                )}
                                {!service.useDescription && (
                                    <Button
                                        data-ui-path="editor.description.add"
                                        className={clsx(classes.addDescriptionButton)}
                                        onClick={() => service.updateValues({ useDescription: true })}
                                    >
                                        {t('editor.button.addDescription')}
                                    </Button>
                                )}
                                <Divider />
                                <Folders
                                    className={classes.folderPicker}
                                    selectFolder={service.folderId}
                                    onClickFolder={({ id }) => {
                                        service.updateValues({ folderId: id });
                                    }}
                                    actions={({ id, permanent }) => service.folderId === id && permanent && (
                                        <Typography
                                            variant="caption"
                                            className={classes.saveInCurrentFolderCaption}
                                        >
                                            {t('editor.saveInCurrentFolder')}
                                        </Typography>
                                    )}
                                />
                            </Fragment>
                        )}
                    </CardContent>
                </Scrollbar>
            </Box>
            <div className={classes.stateCaption}>
                {store.saveState === FETCH.PENDING && (
                    <Fragment>
                        <CircularProgress size={14} color="primary" className={classes.saveIcon} />
                        <Typography variant="caption">
                            {t('editor.save.saving')}
                        </Typography>
                    </Fragment>
                )}
                {store.saveState === FETCH.DONE && (
                    <Fragment>
                        <DoneIcon color="primary" className={classes.saveIcon} />
                        <Typography variant="caption">
                            {t('editor.save.success')}
                        </Typography>
                    </Fragment>
                )}
            </div>
        </Box>
    );
}

export default observer(Fields);
