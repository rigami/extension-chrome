import React, { useEffect, useState } from 'react';
import {
    Button,
    Card,
    CardContent,
    Typography,
    TextField,
} from '@material-ui/core';
import {
    AddRounded as AddIcon,
} from '@material-ui/icons';
import Preview from "@/ui/Bookmarks/EditBookmarkModal/Preview";
import Categories from "@/ui/Bookmarks/Ctegories";
import { useTranslation } from 'react-i18next';
import {BKMS_VARIANT} from "@/enum";
import { makeStyles } from '@material-ui/core/styles';
import { useObserver, useLocalStore } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
    bgCardRoot: { display: 'flex' },
    content: { flex: '1 0 auto' },
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
}));

function Editor({ editBookmarkId, state, onChange, onSave, onCancel }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const store = useLocalStore(() => ({
        editBookmarkId,
        url: '',
        name: '',
        description: '',
        useDescription: false,
        icoVariant: BKMS_VARIANT.SMALL,
        categories: [],
        fullCategories: [],
        imageURL: null,
        isOpenSelectPreview: false,
        searchRequest: '',
        blockResetSearch: false,
    }));

    return useObserver(() => (
        <Card className={classes.bgCardRoot} elevation={8}>
            <Preview
                isOpen={store.isOpenSelectPreview}
                state={state}
                url={store.url}
                imageUrl={store.imageURL}
                name={store.name.trim()}
                icoVariant={store.icoVariant}
                description={store.useDescription && store.description?.trim()}
                categories={store.fullCategories}
                onChangeType={() => { store.isOpenSelectPreview = !store.isOpenSelectPreview; }}
            />
            <div className={classes.details}>
                <CardContent className={classes.content}>
                    <Typography component="h5" variant="h5">
                        {!editBookmarkId ? t("bookmark.editor.addTitle") : t("bookmark.editor.editTitle")}
                    </Typography>
                    <TextField
                        label={t("bookmark.editor.urlFieldLabel")}
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={store.searchRequest}
                        className={classes.input}
                        onChange={(event) => {
                            store.searchRequest = event.target.value;
                        }}
                        onBlur={() => {
                            if (store.blockResetSearch) {
                                store.blockResetSearch = false;
                            } else {
                                store.searchRequest = store.url;
                            }
                        }}
                    />
                    <TextField
                        label={t("bookmark.editor.nameFieldLabel")}
                        variant="outlined"
                        size="small"
                        disabled={store.url === ''}
                        fullWidth
                        value={store.name}
                        className={classes.input}
                        onChange={(event) => { store.name = event.target.value; }}
                    />
                    <Categories
                        className={classes.chipContainer}
                        sortByPopular
                        value={store.categories}
                        onChange={(newCategories) => { store.categories = newCategories; }}
                        autoSelect
                    />
                    {store.useDescription && (
                        <TextField
                            label={t("bookmark.editor.descriptionFieldLabel")}
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={store.description}
                            className={classes.input}
                            disabled={store.url === ''}
                            multiline
                            rows={3}
                            rowsMax={3}
                            onChange={(event) => { store.description = event.target.value; }}
                        />
                    )}
                    {!store.useDescription && (
                        <Button
                            startIcon={<AddIcon />}
                            className={classes.addDescriptionButton}
                            onClick={() => { store.useDescription = true; }}
                        >
                            {t("bookmark.editor.addDescription")}
                        </Button>
                    )}
                </CardContent>
                <div className={classes.controls}>
                    <Button
                        variant="text"
                        color="default"
                        className={classes.button}
                        onClick={onCancel}
                    >
                        {t("cancel")}
                    </Button>
                    <div className={classes.button}>
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={!store.url || !store.name.trim()}
                            onClick={onSave}
                        >
                            {t("save")}
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    ));
}

export default Editor;
