import React, { useEffect } from 'react';
import {
    Button,
    Box,
    CardContent,
    Typography,
    TextField,
    CircularProgress,
    InputAdornment, Paper,
} from '@material-ui/core';
import {
    AddRounded as AddIcon,
    DoneRounded as DoneIcon,
} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { captureException } from '@sentry/react';
import { FETCH } from '@/enum';
import FolderSelector from '@/ui/Bookmarks/Folders/Selector';
import SearchSiteField from './SearchSiteField';
import Tag from '../../Tag';
import Tags from '@/ui/Bookmarks/ToolsPanel/Search/Tags';
import TagsFiled from '@/ui/Bookmarks/EditBookmarkModal/Editor/TagsFiled';

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
        // overflow: 'auto',
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
    folderPicker: { marginRight: 'auto' },
    identBlockIcon: { marginRight: theme.spacing(1) },
    identBlockIconTopAlign: {
        height: theme.spacing(4),
        alignSelf: 'flex-start',
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
    const store = useLocalObservable(() => ({ saveState: FETCH.WAIT }));

    useEffect(() => {
        if (service.isChange) store.saveState = FETCH.WAIT;
    }, [service.isChange]);

    return (
        <Box className={classes.details}>
            <CardContent className={classes.content}>
                <Typography variant="h6" className={classes.header}>
                    {t('editor', { context: service.editBookmarkId ? 'edit' : 'add' })}
                </Typography>
                <SearchSiteField
                    url={service.url}
                    marginThreshold={marginThreshold}
                    onSelect={(selectProps) => service.updateValues(selectProps)}
                />
                <TextField
                    label={t('editor.bookmarkName')}
                    variant="outlined"
                    size="small"
                    disabled={service.url === ''}
                    InputLabelProps={{ shrink: Boolean(service.url) }}
                    fullWidth
                    value={service.name}
                    className={classes.input}
                    onChange={(event) => service.updateValues({ name: event.target.value })}
                />
                <TagsFiled
                    selectedTags={service.tags}
                    onChange={(newTags) => service.updateValues({ tags: newTags })}
                    className={classes.input}
                />
                {/* <Box className={classes.identBlock}>
                    <LabelIcon
                        className={clsx(classes.identBlockIcon, classes.identBlockIconTopAlign)}
                        color="primary"
                    />
                    <Tags
                        sortByPopular
                        value={service.tags}
                        onChange={(newTags) => service.updateValues({ tags: newTags })}
                        autoSelect
                        oneRow
                    />
                </Box> */}
                {service.useDescription && (
                    <TextField
                        label={t('editor.bookmarkDescription')}
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={service.description}
                        className={classes.inputDescription}
                        disabled={service.url === ''}
                        multiline
                        rows={3}
                        rowsMax={6}
                        onChange={(event) => service.updateValues({ description: event.target.value })}
                    />
                )}
                {!service.useDescription && (
                    <Button
                        data-ui-path="editor.description.add"
                        startIcon={<AddIcon />}
                        className={classes.addDescriptionButton}
                        onClick={() => service.updateValues({ useDescription: true })}
                    >
                        {t('editor.button.addDescription')}
                    </Button>
                )}
            </CardContent>
            <div className={classes.controls}>
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
            </div>
        </Box>
    );
}

export default observer(Fields);
