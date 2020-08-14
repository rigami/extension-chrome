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

const useStyles = makeStyles((theme) => ({
    editor: {
        padding: 0,
    },
    editorWrapper: {
        maxHeight: 600,
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
                    {!isChecking && (
                        <EditorBookmark
                            className={classes.editor}
                            classes={{ scrollWrapper: classes.editorWrapper }}
                            bringToEditorHeight
                            name={defaultName}
                            defaultUrl={defaultUrl}
                            /* isEdit={}
                            previewState={}
                            searchRequest={}
                            url={}
                            name={}
                            description={}
                            useDescription={}
                            categories={}
                            isOpenSelectPreview={}
                            imageURL={}
                            icoVariant={}
                            fullCategories={}
                            onChange={} */
                            onSave={() => {}}
                        />
                    )}
                </Box>
            </Nest>
        </ThemeProvider>
    );
}

render(<Popup />, document.getElementById('root'));
