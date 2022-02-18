import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import EditorBookmark from '@/ui/WorkingSpace/Bookmark/Editor';

const useStyles = makeStyles(() => ({
    editor: { padding: 0 },
    editorContent: {
        flexGrow: 1,
        borderRadius: 0,
    },
}));

function CreateNewBookmarkEditor() {
    const classes = useStyles();

    return (
        <React.Fragment>
            <EditorBookmark
                className={clsx(classes.editor)}
                classes={{ editor: classes.editorContent }}
                bringToEditorHeight
                marginThreshold={0}
                onSave={() => {}}
            />
        </React.Fragment>
    );
}

export default CreateNewBookmarkEditor;
