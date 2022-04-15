import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Tabs, Tab } from '@material-ui/core';
import SaveCurrentTabEditor from '@/ui/Popup/SaveCurrentTab';
import CreateNewBookmarkEditor from '@/ui/Popup/CreateNewBookmark';

const useStyles = makeStyles((theme) => ({
    editor: { padding: 0 },
    editorContent: {
        flexGrow: 1,
        borderRadius: 0,
    },
    bar: {
        padding: theme.spacing(2),
        paddingBottom: 0,
        backgroundColor: theme.palette.background.paper,
    },
}));

const EDITOR_TYPE = {
    SAVE_CURRENT_TAB: 'SAVE_CURRENT_TAB',
    CREATE_NEW_BOOKMARK: 'CREATE_NEW_BOOKMARK',
};

function PopupEditor() {
    const classes = useStyles();
    const [editor, setEditor] = useState(EDITOR_TYPE.SAVE_CURRENT_TAB);

    return (
        <React.Fragment>
            <AppBar
                position="sticky"
                color="transparent"
                elevation={0}
                className={classes.bar}
            >
                <Tabs
                    indicatorColor="primary"
                    value={editor}
                    onChange={(event, newValue) => { setEditor(newValue); }}
                >
                    <Tab
                        label="Сохранить текущую вкладку"
                        value={EDITOR_TYPE.SAVE_CURRENT_TAB}
                    />
                    <Tab
                        label="Создать новую закладку"
                        value={EDITOR_TYPE.CREATE_NEW_BOOKMARK}
                    />
                </Tabs>
            </AppBar>
            {editor === EDITOR_TYPE.SAVE_CURRENT_TAB && (
                <SaveCurrentTabEditor />
            )}
            {editor === EDITOR_TYPE.CREATE_NEW_BOOKMARK && (
                <CreateNewBookmarkEditor />
            )}
        </React.Fragment>
    );
}

export default PopupEditor;
