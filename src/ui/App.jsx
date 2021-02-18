import React, { memo, useState } from 'react';
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
import { Provider as BaseStateProvider } from '@/stores/app/BaseStateProvider';
import { Provider as AppStateProvider } from '@/stores/app/AppStateProvider';
import { Provider as BookmarksProvider } from '@/stores/app/BookmarksProvider';
import FakeScroll from '@/ui/FakeScroll';
import FAPStub from '@/ui/Bookmarks/FAP/Stub';
import InitAppProvider from '@/stores/app/InitApp';
import { makeStyles } from '@material-ui/core/styles';
import AddBookmarkButton from '@/ui/Bookmarks/EditBookmarkModal/AddButton';
import initSentry from '@/config/sentry';
import * as Sentry from '@sentry/react';
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

initSentry(DESTINATION.APP);

function RootApp({ onChangeTheme }) {
    const classes = useStyles();

    return (
        <Nest components={[
            ({ children }) => (
                <SnackbarProvider
                    maxSnack={4}
                    content={(key, options) => (<Snackbar id={key} {...options} />)}
                >
                    {children}
                </SnackbarProvider>
            ),
            ({ children }) => (<BaseStateProvider side={DESTINATION.APP}>{children}</BaseStateProvider>),
            InitAppProvider,
            ({ children }) => (<AppStateProvider onChangeTheme={onChangeTheme}>{children}</AppStateProvider>),
            BookmarksProvider,
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
                <AddBookmarkButton />
            </FakeScroll>
        </Nest>
    );
}

const MemoRootApp = memo(RootApp);

function App() {
    const [theme, setTheme] = useState(localStorage.getItem('theme') === THEME.DARK ? darkTheme : lightTheme);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <MemoRootApp
                onChangeTheme={(newTheme) => setTheme(newTheme === THEME.DARK ? darkTheme : lightTheme)}
            />
        </ThemeProvider>
    );
}

const ProfilerApp = Sentry.withProfiler(App);

render(<ProfilerApp />, document.getElementById('root'));
