import React from 'react';
import { TextField, Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import MenuRow, { ROWS_TYPE } from '@/ui/Settings/MenuRow';
import { useCoreService } from '@/stores/app/core';
import GreetingPreview from '@/ui/WorkingSpace/GreetingView/Greeting';

const useStyles = makeStyles((theme) => ({
    row: { padding: theme.spacing(1, 2) },
    preview: { padding: theme.spacing(2) },
}));

const headerProps = { title: 'settingsCommon:greeting.title' };

function Greeting() {
    const coreService = useCoreService();
    const { t } = useTranslation(['settingsCommon']);
    const classes = useStyles();

    return (
        <React.Fragment>
            <MenuRow
                title={t('greeting.use')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    width: 72,
                    checked: coreService.storage.data.userName !== null,
                    color: 'primary',
                    onChange: (event, value) => {
                        coreService.storage.update({ userName: value ? undefined : null });
                    },
                }}
            />
            <GreetingPreview
                className={classes.preview}
                readOnly
                force
            />
            <Box className={classes.row}>
                <TextField
                    variant="outlined"
                    fullWidth
                    placeholder={t('greeting.name', { context: 'placeholder' })}
                    value={coreService.storage.data.userName || ''}
                    onChange={(event) => {
                        coreService.storage.update({ userName: event.target.value });
                    }}
                />
            </Box>
        </React.Fragment>
    );
}

const ObserverGreeting = observer(Greeting);

export { headerProps as header, ObserverGreeting as content };

export default {
    header: headerProps,
    content: ObserverGreeting,
};
