import React, { useState } from 'react';
import { render } from 'react-dom';
import { CssBaseline } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from '@material-ui/styles';
import Snackbar from '@/ui-components/Snackbar';
import UploadBGForm from '@/ui-components/UploadBGForm';
import ConfigurationApp from '@/ui/ConfigurationApp';
import { THEME } from '@/dict';
import lightTheme from '@/themes/defaultTheme';
import darkTheme from '@/themes/darkTheme';
import Nest from '@/utils/Nest';
import { Provider as BackgroundsProvider } from '@/stores/backgrounds';
import { Provider as AppConfigProvider } from '@/stores/app';
import { Provider as BookmarksProvider } from '@/stores/bookmarks';
import FAP from './Bookmarks/FAP';
import Bookmarks from './Bookmarks';
import Desktop from './Desktop';
import GlobalScroll from './GlobalScroll';
import GlobalModals from './GlobalModals';
import FakeScroll from "@/ui/FakeScroll";
import FAPStub from "@/ui/Bookmarks/FAP/Stub";

function App() {
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
                BackgroundsProvider,
                BookmarksProvider,
                ({ children }) => (
                    <SnackbarProvider
                        maxSnack={4}
                        content={(key, options) => (
                            <Snackbar id={key} {...options} />
                        )}
                    >
                        {children}
                    </SnackbarProvider>
                ),
                UploadBGForm,
            ]}
            >
                <GlobalScroll>
                    <Desktop />
                    <FAPStub />
                    <Bookmarks />
                </GlobalScroll>
                <FakeScroll>
                    <FAP />
                </FakeScroll>
                <GlobalModals />
            </Nest>
        </ThemeProvider>
    );
}

render(<App />, document.getElementById('root'));
