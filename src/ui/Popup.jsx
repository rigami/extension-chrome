import React, { useState } from 'react';
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
import EditorBookmark from "@/ui/Bookmarks/EditBookmarkModal/EditorBookmark";

const useStyles = makeStyles((theme) => ({
    editor: {
        padding: 0,
    },
}));

function Popup() {
    const classes = useStyles();
    const [theme, setTheme] = useState(localStorage.getItem('app_theme'));

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
                    <EditorBookmark
                        className={classes.editor}
                        bringToEditorHeight
                        onSave={() => {}}
                        onCancel={() => {}}
                    />
                </Box>
            </Nest>
        </ThemeProvider>
    );
}

render(<Popup />, document.getElementById('root'));
