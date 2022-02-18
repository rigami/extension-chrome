import React, { Fragment, useEffect } from 'react';
import {
    Button,
    Box,
    CardContent,
    Typography,
    TextField,
    CircularProgress,
    InputAdornment, Paper,
    InputBase, Divider,
} from '@material-ui/core';
import {
    AddRounded as AddIcon,
    DoneRounded as DoneIcon,
} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { captureException } from '@sentry/react';
import clsx from 'clsx';
import { FETCH } from '@/enum';
import TagsFiled from '@/ui/Bookmarks/Bookmark/Editor/TagsFiled';
import Folders from '@/ui/Bookmarks/Folders';
import Search from '@/ui/Bookmarks/Bookmark/Editor/SearchSiteField/Search';

const useStyles = makeStyles((theme) => ({
    content: {
        flex: '1 0 auto',
        minHeight: 450,
        backgroundColor: theme.palette.background.backdropLight,
        borderRadius: theme.shape.borderRadius,
        margin: theme.spacing(2),
        marginLeft: 0,
        marginBottom: 0,
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
        // overflow: 'auto',
    },
    input: {
        // marginTop: theme.spacing(1)
    },
    inputUrl: { textOverflow: 'ellipsis' },
    inputDescription: { marginBottom: theme.spacing(1) },
    addDescriptionButton: {
        marginBottom: theme.spacing(1),
        marginLeft: theme.spacing(-1),
        fontWeight: theme.typography.body1.fontWeight,
        fontSize: theme.typography.body1.fontSize,
        color: theme.palette.text.secondary,
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
    folderPicker: { marginTop: theme.spacing(1) },
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
    },
}));

function Fields(props) {
    const {
        editorService: service,
        marginThreshold = 24,
        onSave,
        onCancel,
    } = props;
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
            <CardContent className={classes.content}>
                {/* <Typography variant="h6" className={classes.header}>
                    {t('editor', { context: service.editBookmarkId ? 'edit' : 'add' })}
                </Typography> */}
                {/* <SearchSiteField
                    url={service.url}
                    marginThreshold={marginThreshold}
                    onSelect={(selectProps) => service.updateValues(selectProps)}
                /> */}
                <InputBase
                    placeholder={t('editor.bookmarkUrl', { context: 'placeholder' })}
                    fullWidth
                    value={store.query}
                    className={classes.input}
                    classes={{ input: classes.inputUrl }}
                    onChange={(event) => {
                        store.query = event.target.value;
                    }}
                    onKeyDown={(event) => {
                        if (event.code === 'Enter') {
                            service.updateValues({ url: store.query });
                        }
                    }}
                />
                {(store.query !== service.url || !service.url) && (
                    <Fragment>
                        <Divider />
                        <Search
                            query={store.query}
                            onSelect={(result) => {
                                store.query = '';
                                service.updateValues(result);
                            }}
                        />
                    </Fragment>
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
                                className={clsx(classes.inputDescription, classes.input)}
                                multiline
                                rows={3}
                                rowsMax={6}
                                onChange={(event) => service.updateValues({ description: event.target.value })}
                            />
                        )}
                        {!service.useDescription && (
                            <Button
                                data-ui-path="editor.description.add"
                                className={clsx(classes.addDescriptionButton, classes.input)}
                                onClick={() => service.updateValues({ useDescription: true })}
                            >
                                {t('editor.button.addDescription')}
                            </Button>
                        )}
                        <Divider />
                        <Folders
                            className={classes.folderPicker}
                            selectFolder={service.folderId}
                            onClickFolder={({ id }) => { }}
                            actions={({ id, name, permanent }) => service.folderId !== id && !permanent && (
                                <Fragment>
                                    <Button
                                        onClick={() => {
                                            service.updateValues({ folderId: id });
                                        }}
                                    >
                                        {service.editBookmarkId ? 'Переместить' : 'Сохранить'}
                                    </Button>
                                </Fragment>
                            )}
                        />
                    </Fragment>
                )}
            </CardContent>
            {/* <div className={classes.controls}>
                <FolderSelector
                    className={classes.folderPicker}
                    value={service.folderId}
                    onChange={(newFolder) => service.updateValues({ folderId: newFolder })}
                />
                {onCancel && (
                    <Button
                        data-ui-path="cancel"
                        variant="text"
                        color="default"
                        className={classes.button}
                        onClick={onCancel}
                    >
                        {t('common:button.cancel')}
                    </Button>
                )}
                <div className={classes.button}>
                    {store.saveState === FETCH.WAIT && (
                        <Button
                            data-ui-path="save"
                            variant="contained"
                            color="primary"
                            disabled={!service.url || !service.name?.trim()}
                            onClick={() => {
                                service.save()
                                    .then(() => { store.saveState = FETCH.DONE; onSave(); })
                                    .catch((e) => {
                                        captureException(e);
                                        store.saveState = FETCH.FAILED;
                                    });
                            }}
                        >
                            {t('editor.button.saveBookmark')}
                        </Button>
                    )}
                    {store.saveState === FETCH.PENDING && (
                        <Box display="flex" alignItems="center">
                            <CircularProgress size={24} color="primary" className={classes.saveIcon} />
                            {t('editor.save.saving')}
                            ...
                        </Box>
                    )}
                    {store.saveState === FETCH.DONE && (
                        <Box display="flex" alignItems="center">
                            <DoneIcon color="primary" className={classes.saveIcon} />
                            {t('editor.save.success')}
                        </Box>
                    )}
                </div>
            </div> */}
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
