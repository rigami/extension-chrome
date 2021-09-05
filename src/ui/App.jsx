import React, { memo, useState } from 'react';
import { CssBaseline } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
import { ThemeProvider } from '@material-ui/styles';
import Snackbar from '@/ui-components/Snackbar';
import UploadBGForm from '@/ui/UploadBackground';
import { DESTINATION, THEME } from '@/enum';
import lightTheme from '@/themes/defaultTheme';
import darkTheme from '@/themes/darkTheme';
import Nest from '@/utils/helpers/Nest';
import { Provider as BaseStateProvider } from '@/stores/app/BaseStateProvider';
import { Provider as AppStateProvider } from '@/stores/app/AppStateProvider';
import { Provider as BookmarksProvider } from '@/stores/app/BookmarksProvider';
import { Provider as ContextMenuProvider } from '@/stores/app/ContextMenuProvider';
import InitApp, { ApplyWizardSettingsProvider } from '@/stores/app/InitApp';
import initSentry from '@/config/sentry/app';
import * as Sentry from '@sentry/react';
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
                    <BaseStateProvider side={DESTINATION.APP}>
                        {children}
                    </BaseStateProvider>
                ),
                ({ children }) => (
                    <SnackbarProvider
                        maxSnack={4}
                        content={(key, options) => (<Snackbar id={key} {...options} />)}
                    >
                        {children}
                    </SnackbarProvider>
                ),
                BUILD === 'full' ? BookmarksProvider : ({ children }) => children,
                ({ children }) => (
                    <AppStateProvider onChangeTheme={onChangeTheme}>
                        {children}
                    </AppStateProvider>
                ),
                InitApp,
                UploadBGForm,
                GlobalModals,
                ContextMenuProvider,
                ApplyWizardSettingsProvider,
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

export default Sentry.withProfiler(App);
