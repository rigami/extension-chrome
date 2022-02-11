import React, { useState } from 'react';
import { Box, CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { observer } from 'mobx-react-lite';
import { withProfiler } from '@sentry/react';
import { DESTINATION, THEME } from '@/enum';
import lightTheme from '@/themes/defaultTheme';
import darkTheme from '@/themes/darkTheme';
import { CoreProvider, useCoreService } from '@/stores/app/core';
import { WorkingSpaceProvider } from '@/stores/app/workingSpace';
import { APP_STATE } from '@/stores/app/core/service';
import initSentry from '@/config/sentry/app';
import Nest from '@/utils/helpers/Nest';
import Editor from './Editor';

initSentry(DESTINATION.POPUP);

function LoadStoreWait({ children }) {
    const coreService = useCoreService();

    if (coreService.appState === APP_STATE.WORK) {
        return children;
    }

    return null;
}

const ObserverLoadStoreWait = observer(LoadStoreWait);

function PopupRoot() {
    const [theme] = useState(localStorage.getItem('theme') === THEME.LIGHT ? lightTheme : darkTheme);

    return (
        <Box
            width={680}
            minWidth={300}
            minHeight={400}
            display="flex"
            flexDirection="column"
        >
            <Nest
                components={[
                    ({ children }) => (<ThemeProvider theme={theme}>{children}</ThemeProvider>),
                    ({ children }) => (<CoreProvider side={DESTINATION.POPUP}>{children}</CoreProvider>),
                    ObserverLoadStoreWait,
                    WorkingSpaceProvider,
                ]}
            >
                <CssBaseline />
                <Editor />
            </Nest>
        </Box>
    );
}

export default withProfiler(PopupRoot);
