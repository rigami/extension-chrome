import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Button,
    Collapse,
    Dialog, DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Typography,
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { useAppStateService } from '@/stores/app/appState';
import SectionHeader from '@/ui/Menu/SectionHeader';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import { getDomain } from '@/utils/localSiteParse';

const useStyles = makeStyles((theme) => ({
    notSetValue: {
        fontStyle: 'italic',
        color: theme.palette.text.secondary,
    },
}));

function DateWidget() {
    const classes = useStyles();
    const { t } = useTranslation(['settingsWidget']);
    const { widgetsService } = useAppStateService();
    const [actionEditorOpen, setActionEditorOpen] = useState(false);
    const [actionUrl, setActionUrl] = useState('');

    return (
        <React.Fragment>
            <SectionHeader title={t('date.title')} />
            <MenuRow
                title={t('date.useDate')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    value: widgetsService.settings.useDate,
                    onChange: (event, value) => {
                        widgetsService.settings.update({ useDate: value });
                    },
                }}
            />
            <Collapse in={widgetsService.settings.useDate}>
                <MenuRow
                    title={t('date.clickAction.title')}
                    description={t('date.clickAction.description')}
                    action={{
                        type: ROWS_TYPE.LINK,
                        onClick: () => { setActionEditorOpen(true); },
                        component: widgetsService.settings.dateAction
                            ? `open: ${getDomain(widgetsService.settings.dateAction)}`
                            : (
                                <Typography className={classes.notSetValue}>
                                    {t('common:notSet')}
                                </Typography>
                            ),
                    }}
                />
                <Dialog open={actionEditorOpen} onClose={() => { setActionEditorOpen(false); }}>
                    <DialogTitle>{t('date.clickAction.dialog.title')}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {t('date.clickAction.dialog.description')}
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            defaultValue={widgetsService.settings.dateAction}
                            fullWidth
                            label={t('date.clickAction.dialog.url')}
                            onChange={(event) => { setActionUrl(event.target.value); }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            data-ui-path="date.clickAction.cancel"
                            color="primary"
                            onClick={() => { setActionEditorOpen(false); }}
                        >
                            {t('common:button.cancel')}
                        </Button>
                        <Button
                            data-ui-path="date.clickAction.save"
                            color="primary"
                            onClick={() => {
                                setActionEditorOpen(false);
                                widgetsService.settings.update({ dateAction: actionUrl });
                            }}
                        >
                            {t('common:button.save')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Collapse>
        </React.Fragment>
    );
}

export default observer(DateWidget);
