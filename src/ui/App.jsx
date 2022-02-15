import React, { memo, useState } from 'react';
import { CssBaseline } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from '@material-ui/styles';
import { withProfiler } from '@sentry/react';
import Snackbar from '@/ui-components/Snackbar';
import UploadBGForm from '@/ui/UploadBackground';
import { DESTINATION, THEME } from '@/enum';
import lightTheme from '@/themes/defaultTheme';
import darkTheme from '@/themes/darkTheme';
import Nest from '@/utils/helpers/Nest';
import { CoreProvider } from '@/stores/app/core';
import { AppStateProvider } from '@/stores/app/appState';
import { WorkingSpaceProvider } from '@/stores/app/workingSpace';
import { ContextMenuProvider } from '@/stores/app/contextMenu';
import InitApp from '@/stores/app/InitApp';
import initSentry from '@/config/sentry/app';
import FabMenu from '@/ui/Menu/FabMenu';
import Menu from '@/ui/Menu';
import CrashCatch from '@/ui/CrashCatch';
import Bookmarks from './Bookmarks';
import Desktop from './Desktop';
import GlobalModals from './GlobalModals';

initSentry(DESTINATION.APP);

function RootApp({ onChangeTheme }) {
    return (
        <Nest
            components={[
                CrashCatch,
                ({ children }) => (
                    <CoreProvider side={DESTINATION.APP}>
                        {children}
                    </CoreProvider>
                ),
                ({ children }) => (
                    <SnackbarProvider
                        maxSnack={4}
                        content={(key, options) => (<Snackbar id={key} {...options} />)}
                    >
                        {children}
                    </SnackbarProvider>
                ),
                BUILD === 'full' ? WorkingSpaceProvider : ({ children }) => children,
                ({ children }) => (
                    <AppStateProvider onChangeTheme={onChangeTheme}>
                        {children}
                    </AppStateProvider>
                ),
                InitApp,
                UploadBGForm,
                GlobalModals,
                ContextMenuProvider,
            ]}
        >
            <Desktop />
            {BUILD === 'full' && (<Bookmarks />)}
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

export default withProfiler(App);
