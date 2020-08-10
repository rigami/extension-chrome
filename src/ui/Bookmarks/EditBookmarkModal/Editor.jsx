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

function Editor(props) {
    const {
        isEdit,
        previewState,
        searchRequest,
        url,
        name,
        description,
        useDescription,
        categories,
        isOpenSelectPreview,
        imageURL,
        icoVariant,
        fullCategories,
        isSave,
        isSaving,
        onChange,
        onSave,
        onCancel,
        onChangeType,
    } = props;
    const classes = useStyles();
    const { t } = useTranslation();

    return useObserver(() => (
        <Card className={classes.bgCardRoot} elevation={8}>
            <Preview
                isOpen={isOpenSelectPreview}
                state={previewState}
                url={url}
                imageUrl={imageURL}
                name={name.trim()}
                icoVariant={icoVariant}
                description={useDescription && description?.trim()}
                categories={fullCategories}
                onChangeType={() => onChangeType()}
            />
            <div className={classes.details}>
                <CardContent className={classes.content}>
                    <Typography component="h5" variant="h5">
                        {!isEdit ? t("bookmark.editor.addTitle") : t("bookmark.editor.editTitle")}
                    </Typography>
                    <TextField
                        label={t("bookmark.editor.urlFieldLabel")}
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={searchRequest}
                        className={classes.input}
                        onChange={(event) => onChange({ searchRequest: event.target.value })}
                    />
                    <TextField
                        label={t("bookmark.editor.nameFieldLabel")}
                        variant="outlined"
                        size="small"
                        disabled={searchRequest === ''}
                        fullWidth
                        value={name}
                        className={classes.input}
                        onChange={(event) => onChange({ name: event.target.value })}
                    />
                    <Categories
                        className={classes.chipContainer}
                        sortByPopular
                        value={categories}
                        onChange={(newCategories) => onChange({ categories: newCategories })}
                        autoSelect
                        maxRows={4}
                    />
                    {useDescription && (
                        <TextField
                            label={t("bookmark.editor.descriptionFieldLabel")}
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={description}
                            className={classes.input}
                            disabled={searchRequest === ''}
                            multiline
                            rows={3}
                            rowsMax={3}
                            onChange={(event) => onChange({ description: event.target.value })}
                        />
                    )}
                    {!useDescription && (
                        <Button
                            startIcon={<AddIcon />}
                            className={classes.addDescriptionButton}
                            onClick={() => onChange({ useDescription: true })}
                        >
                            {t("bookmark.editor.addDescription")}
                        </Button>
                    )}
                </CardContent>
                <div className={classes.controls}>
                    {onCancel && (
                        <Button
                            variant="text"
                            color="default"
                            className={classes.button}
                            onClick={onCancel}
                        >
                            {t("cancel")}
                        </Button>
                    )}
                    <div className={classes.button}>
                        {!isSaving && !isSave && (
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={!searchRequest || !name.trim()}
                                onClick={onSave}
                            >
                                {t("save")}
                            </Button>
                        )}
                        {isSaving && !isSave && t("bookmark.editor.saving")}
                        {isSave && !isSaving && t("bookmark.editor.saveSuccess")}
                    </div>
                </div>
            </div>
        </Card>
    ));
}

export default Editor;
