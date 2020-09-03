import React, { useState } from 'react';
import { render } from 'react-dom';
import { CssBaseline, Box } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from '@material-ui/styles';
import Snackbar from '@/ui-components/Snackbar';
import UploadBGForm from '@/ui-components/UploadBGForm';
import { DESTINATION, THEME } from '@/enum';
import lightTheme from '@/themes/defaultTheme';
import darkTheme from '@/themes/darkTheme';
import Nest from '@/utils/Nest';
import { Provider as BaseStateProvider } from '@/stores/BaseStateProvider';
import { Provider as AppStateProvider } from '@/stores/AppStateProvider';
import { Provider as BookmarksProvider } from '@/stores/BookmarksProvider';
import { Provider as BackgroundsProvider } from '@/stores/BackgroundsStateProvider';
import FakeScroll from '@/ui/FakeScroll';
import FAPStub from '@/ui/Bookmarks/FAP/Stub';
import InitAppProvider from '@/stores/InitApp';
import { makeStyles } from '@material-ui/core/styles';
import FAP from './Bookmarks/FAP';
import Bookmarks from './Bookmarks';
import Desktop from './Desktop';
import GlobalScroll from './GlobalScroll';
import GlobalModals from './GlobalModals';

const useStyles = makeStyles(() => ({
    bookmarkWrapper: {
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
    },
}));

function App() {
    const classes = useStyles();
    const [theme, setTheme] = useState(localStorage.getItem('theme') === THEME.LIGHT ? lightTheme : darkTheme);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Nest components={[
                ({ children }) => (<BaseStateProvider side={DESTINATION.APP}>{children}</BaseStateProvider>),
                InitAppProvider,
                ({ children }) => (
                    <AppStateProvider
                        onChangeTheme={(newTheme) => setTheme(newTheme === THEME.LIGHT ? lightTheme : darkTheme)}
                    >
                        {children}
                    </AppStateProvider>
                ),
                BookmarksProvider,
                BackgroundsProvider,
                ({ children }) => (
                    <SnackbarProvider
                        maxSnack={4}
                        content={(key, options) => (<Snackbar id={key} {...options} />)}
                    >
                        {children}
                    </SnackbarProvider>
                ),
                UploadBGForm,
                GlobalModals,
            ]}
            >
                <GlobalScroll>
                    <Desktop />
                    <Box className={classes.bookmarkWrapper}>
                        <FAPStub />
                        <Bookmarks />
                    </Box>
                </GlobalScroll>
                <FakeScroll>
                    <FAP />
                </FakeScroll>
            </Nest>
        </ThemeProvider>
    );
}

render(<App />, document.getElementById('root'));
