import React, { useState } from 'react';
import { Box, Fade } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import EditorBookmark from '@/ui/Bookmarks/EditBookmarkModal/Editor';
import clsx from 'clsx';
import Stub from '@/ui-components/Stub';

const useStyles = makeStyles((theme) => ({
    editor: { padding: 0 },
    editorWrapper: {
        maxHeight: 600,
        minHeight: 300,
    },
    hideEditor: {
        visibility: 'hidden',
        pointerEvents: 'none',
    },
    stub: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: theme.zIndex.modal,
        backgroundColor: theme.palette.background.paper,
    },
}));

function Popup({ tabName, tabUrl }) {
    const classes = useStyles();
    const [isChecking, setIsChecking] = useState(true);

    return (
        <Box style={{
            width: 680,
            minHeight: 300,
        }}
        >
            <Fade in={isChecking}>
                <Stub
                    className={classes.stub}
                    message="Загрузка информцаии..."
                />
            </Fade>
            <EditorBookmark
                className={clsx(classes.editor, isChecking && classes.hideEditor)}
                classes={{ scrollWrapper: classes.editorWrapper }}
                bringToEditorHeight
                defaultName={tabName}
                defaultUrl={tabUrl}
                marginThreshold={0}
                onSave={() => {}}
                onStage={(stage) => {
                    console.log('stage', stage);
                    if (isChecking) {
                        setIsChecking(false);
                    }
                }}
            />
        </Box>
    );
}

export default Popup;
