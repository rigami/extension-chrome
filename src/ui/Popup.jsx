import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import { CssBaseline, Box } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { makeStyles } from '@material-ui/core/styles';
import ConfigurationApp from '@/ui/ConfigurationApp';
import { THEME } from '@/enum';
import lightTheme from '@/themes/defaultTheme';
import darkTheme from '@/themes/darkTheme';
import Nest from '@/utils/Nest';
import { Provider as AppConfigProvider } from '@/stores/app';
import { Provider as BookmarksProvider } from '@/stores/bookmarks';
import EditorBookmark from "@/ui/Bookmarks/EditBookmarkModal/ExtendPreset";
import {STAGE} from "@/ui/Bookmarks/EditBookmarkModal/Preview";
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    editor: {
        padding: 0,
    },
    editorWrapper: {
        maxHeight: 600,
    },
    hideEditor: {
        visible: 'hidden',
        pointerEvents: 'none',
    },
}));

function Popup() {
    const classes = useStyles();
    const [theme, setTheme] = useState(localStorage.getItem('app_theme'));
    const [defaultName, setDefaultName] = useState();
    const [defaultUrl, setDefaultUrl] = useState();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!chrome?.tabs) {
            setIsChecking(false);
            return;
        }

        chrome.tabs.query({ active: true }, ([tab]) => {
            console.log(tab)
            if (!tab) {
                setIsChecking(false);
                return;
            }

            setDefaultName(tab.title);
            setDefaultUrl(tab.url);
            setIsChecking(false);
        });
    }, []);

    return (
        <ThemeProvider theme={theme === THEME.DARK ? darkTheme : lightTheme}>
            <CssBaseline />
            <Nest components={[
                ConfigurationApp,
                ({ children }) => (
                    <AppConfigProvider onTheme={() => setTheme(localStorage.getItem('app_theme'))}>
                        {children}
                    </AppConfigProvider>
                ),
                BookmarksProvider,
            ]}
            >
                <Box style={{ width: 680 }}>
                    {isChecking && "Проверка..."}
                    <EditorBookmark
                        className={clsx(classes.editor, isChecking && classes.hideEditor)}
                        classes={{ scrollWrapper: classes.editorWrapper }}
                        bringToEditorHeight
                        defaultName={defaultName}
                        defaultUrl={defaultUrl}
                        marginThreshold={0}
                        onSave={() => {}}
                        onStage={(stage) => {
                            console.log('stage', stage)
                            if (isChecking && (stage === STAGE.DONE || stage === STAGE.WAIT_NAME)) {
                                setIsChecking(false);
                            }
                        }}
                    />
                </Box>
            </Nest>
        </ThemeProvider>
    );
}

render(<Popup />, document.getElementById('root'));
