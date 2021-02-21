import React, { memo, useState } from 'react';
import { render } from 'react-dom';
import { CssBaseline } from '@material-ui/core';
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
import InitAppProvider from '@/stores/app/InitApp';
import initSentry from '@/config/sentry';
import * as Sentry from '@sentry/react';
import ScrollView from '@/ui-components/ScrollView';
import { makeStyles } from '@material-ui/core/styles';
import FabMenu from '@/ui/Menu/FabMenu';
import Menu from '@/ui/Menu';
import FAP from './Bookmarks/FAP';
import Bookmarks from './Bookmarks';
import Desktop from './Desktop';
import GlobalScroll from './GlobalScroll';
import GlobalModals from './GlobalModals';

initSentry(DESTINATION.APP);

const useStyles = makeStyles((theme) => ({
    bookmarks: {
        backgroundColor: theme.palette.background.paper,
        transform: 'translate3d(0,0,0)',
        display: 'flex',
        flexDirection: 'column',
    },
}));

function RootApp({ onChangeTheme }) {
    const classes = useStyles();

    return (
        <Nest
            components={[
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
                <ScrollView value="desktop" disableScroll>
                    <Desktop />
                </ScrollView>
                <ScrollView value="bookmarks" classes={{ content: classes.bookmarks }}>
                    <Bookmarks />
                </ScrollView>
            </GlobalScroll>
            <FAP />
            <FabMenu />
            <Menu />
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
