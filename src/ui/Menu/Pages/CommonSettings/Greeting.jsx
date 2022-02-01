import React from 'react';
import { TextField, Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import useCoreService from '@/stores/app/BaseStateProvider';
import GreetingPreview from '@/ui/Bookmarks/GreetingView/Greeting';

const useStyles = makeStyles((theme) => ({
    row: { padding: theme.spacing(1, 2) },
    preview: { padding: theme.spacing(2) },
}));

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
                    checked: coreService.storage.persistent.data.userName !== null,
                    color: 'primary',
                    onChange: (event, value) => {
                        coreService.storage.persistent.update({ userName: value ? undefined : null });
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
                    value={coreService.storage.persistent.data.userName || ''}
                    onChange={(event) => {
                        coreService.storage.persistent.update({ userName: event.target.value });
                    }}
                />
            </Box>
        </React.Fragment>
    );
}

const ObserverGreeting = observer(Greeting);

export { ObserverGreeting as content };

export default { content: ObserverGreeting };
