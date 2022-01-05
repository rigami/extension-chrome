import React, { useEffect } from 'react';
import {
    Container,
    CircularProgress,
    Card,
} from '@material-ui/core';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import BookmarkEditor, { STATE_EDITOR } from './BookmarkEditor';
import FieldsEditor from './Fields';
import Preview from './Preview';

const useStyles = makeStyles(() => ({
    container: {
        maxWidth: 800,
        // minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
    },
    editor: {
        display: 'flex',
        overflow: 'unset',
    },
}));

function Editor(props) {
    const {
        editBookmarkId,
        defaultUrl,
        defaultName,
        defaultFolderId,
        defaultTagsIds,
        marginThreshold = 24,
        className: externalClassName,
        classes: externalClasses = {},
        onSave,
        onCancel,
        onStage = () => {},
    } = props;
    const classes = useStyles();

    const bookmarksService = useBookmarksService();
    const service = useLocalObservable(() => new BookmarkEditor({
        defaultData: {
            id: editBookmarkId,
            url: defaultUrl,
            name: defaultName,
            folderId: defaultFolderId,
            tagsIds: defaultTagsIds,
        },
        bookmarksService,
    }));

    useEffect(() => onStage(service.state), [service.state]);

    if (service.state === STATE_EDITOR.LOADING_EDITOR) {
        return (<CircularProgress />);
    }

    return (
        <Card className={clsx(classes.editor, externalClasses.editor)}>
            <Preview editorService={service} />
            <FieldsEditor
                editorService={service}
                marginThreshold={marginThreshold}
                onSave={onSave}
                onCancel={onCancel}
            />
        </Card>
    );
}

export default observer(Editor);
