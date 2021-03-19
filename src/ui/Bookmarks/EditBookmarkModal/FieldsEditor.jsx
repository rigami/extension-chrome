import React, { useEffect } from 'react';
import {
    Button,
    Box,
    CardContent,
    Typography,
    TextField,
    CircularProgress,
} from '@material-ui/core';
import {
    AddRounded as AddIcon,
    DoneRounded as DoneIcon,
    LabelRounded as LabelIcon,
    FolderRounded as FolderIcon,
} from '@material-ui/icons';
import Tags from '@/ui/Bookmarks/Tags';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { FETCH } from '@/enum';
import clsx from 'clsx';
import FolderSelector from '@/ui/Bookmarks/Folders/Selector';
import SearchSiteField from './SearchSiteField';

const useStyles = makeStyles((theme) => ({
    content: { flex: '1 0 auto' },
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
        overflow: 'auto',
    },
    input: { marginTop: theme.spacing(2) },
    inputDescription: { marginTop: theme.spacing(2) },
    addDescriptionButton: { marginTop: theme.spacing(2) },
    saveIcon: { marginRight: theme.spacing(1) },
    identBlock: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: theme.spacing(2),
    },
    identBlockIcon: { marginRight: theme.spacing(1) },
    identBlockIconTopAlign: {
        height: theme.spacing(4),
        alignSelf: 'end',
    },
}));

function FieldsEditor(props) {
    const {
        isEdit,
        searchRequest = '',
        url = '',
        name = '',
        description = '',
        useDescription = false,
        tags,
        folderId,
        saveState = FETCH.WAIT,
        marginThreshold = 24,
        onChangeFields = (value) => value,
        onSave,
        onCancel,
    } = props;
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);

    const store = useLocalObservable(() => ({
        searchRequest,
        url,
        name,
        description,
        useDescription,
    }));

    useEffect(() => {
        store.searchRequest = searchRequest;
    }, [searchRequest]);

    useEffect(() => {
        store.url = url || '';
    }, [url]);

    useEffect(() => {
        store.name = name || '';
    }, [name]);

    useEffect(() => {
        store.description = description;
    }, [description]);

    useEffect(() => {
        store.useDescription = useDescription;
    }, [useDescription]);

    return (
        <Box className={classes.details}>
            <CardContent className={classes.content}>
                <Typography variant="h6" className={classes.header}>
                    {t('editor', { context: isEdit ? 'edit' : 'add' })}
                </Typography>
                <SearchSiteField
                    searchRequest={store.searchRequest}
                    marginThreshold={marginThreshold}
                    onChange={(value) => {
                        store.searchRequest = value;
                        onChangeFields({ searchRequest: value });
                    }}
                    onSelect={({
                        title, url: requestUrl, icons, forceAdded, ...other
                    }) => {
                        store.searchRequest = requestUrl;
                        store.name = title || store.name || '';

                        let result = {
                            forceAdded,
                            url: requestUrl,
                            name: title,
                        };

                        if (icons) {
                            result = {
                                ...result,
                                icons,
                                ...other,
                            };
                        }
                        onChangeFields(result);
                    }}
                />
                <TextField
                    label={t('editor.bookmarkName')}
                    variant="outlined"
                    size="small"
                    disabled={store.searchRequest === ''}
                    fullWidth
                    value={store.name}
                    className={classes.input}
                    onChange={(event) => {
                        store.name = event.target.value;
                        onChangeFields({ name: event.target.value });
                    }}
                />
                <Box className={classes.identBlock}>
                    <FolderIcon className={classes.identBlockIcon} color="primary" />
                    <FolderSelector
                        value={folderId}
                        onChange={(newFolder) => onChangeFields({ folderId: newFolder })}
                    />
                </Box>
                <Box className={classes.identBlock}>
                    <LabelIcon
                        className={clsx(classes.identBlockIcon, classes.identBlockIconTopAlign)}
                        color="primary"
                    />
                    <Tags
                        sortByPopular
                        value={tags}
                        onChange={(newTags) => onChangeFields({ tags: newTags })}
                        autoSelect
                        oneRow
                    />
                </Box>
                {store.useDescription && (
                    <TextField
                        label={t('editor.bookmarkDescription')}
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={store.description}
                        className={classes.inputDescription}
                        disabled={store.searchRequest === ''}
                        multiline
                        rows={3}
                        rowsMax={6}
                        onChange={(event) => {
                            store.description = event.target.value;
                            onChangeFields({ description: event.target.value });
                        }}
                    />
                )}
                {!store.useDescription && (
                    <Button
                        data-ui-path="editor.description.add"
                        startIcon={<AddIcon />}
                        className={classes.addDescriptionButton}
                        onClick={() => {
                            store.useDescription = true;
                            onChangeFields({ useDescription: true });
                        }}
                    >
                        {t('editor.button.addDescription')}
                    </Button>
                )}
            </CardContent>
            <div className={classes.controls}>
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
                    {saveState === FETCH.WAIT && (
                        <Button
                            data-ui-path="save"
                            variant="contained"
                            color="primary"
                            disabled={!searchRequest || !store.name.trim()}
                            onClick={onSave}
                        >
                            {t('common:button.save')}
                        </Button>
                    )}
                    {saveState === FETCH.PENDING && (
                        <Box display="flex" alignItems="center">
                            <CircularProgress size={24} color="primary" className={classes.saveIcon} />
                            {t('editor.save.saving')}
                            ...
                        </Box>
                    )}
                    {saveState === FETCH.DONE && (
                        <Box display="flex" alignItems="center">
                            <DoneIcon color="primary" className={classes.saveIcon} />
                            {t('editor.save.success')}
                        </Box>
                    )}
                </div>
            </div>
        </Box>
    );
}

export default observer(FieldsEditor);
