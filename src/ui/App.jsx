import React, { memo, useState } from 'react';
import { render } from 'react-dom';
import { CssBaseline } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from '@material-ui/styles';
import Snackbar from '@/ui-components/Snackbar';
import UploadBGForm from '@/ui/UploadBackground';
import { DESTINATION, THEME } from '@/enum';
import lightTheme from '@/themes/defaultTheme';
import darkTheme from '@/themes/darkTheme';
import Nest from '@/utils/Nest';
import { Provider as BaseStateProvider } from '@/stores/app/BaseStateProvider';
import { Provider as AppStateProvider } from '@/stores/app/AppStateProvider';
import { Provider as BookmarksProvider } from '@/stores/app/BookmarksProvider';
import { Provider as ContextMenuProvider } from '@/stores/app/ContextMenuProvider';
import InitAppProvider from '@/stores/app/InitApp';
import initSentry from '@/config/sentry';
import * as Sentry from '@sentry/react';
import FabMenu from '@/ui/Menu/FabMenu';
import Menu from '@/ui/Menu';
import Bookmarks from './Bookmarks';
import Desktop from './Desktop';
import GlobalModals from './GlobalModals';

initSentry(DESTINATION.APP);

function RootApp({ onChangeTheme }) {
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
                ContextMenuProvider,
            ]}
        >
            <Desktop />
            <Bookmarks />
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
