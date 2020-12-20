import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useAppStateService from '@/stores/app/AppStateProvider';
import SectionHeader from '@/ui/Menu/SectionHeader';
import MenuRow, { ROWS_TYPE } from '@/ui/Menu/MenuRow';
import {
    Button,
    Collapse,
    Dialog, DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField,
    Typography
} from '@material-ui/core';
import { getDomain } from '@/utils/localSiteParse';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    notSetValue: {
        fontStyle: 'italic',
        color: theme.palette.text.secondary,
    },
}));

function DateWidget() {
    const classes = useStyles();
    const { t } = useTranslation();
    const { widgets } = useAppStateService();
    const [actionEditorOpen, setActionEditorOpen] = useState(false);
    const [actionUrl, setActionUrl] = useState('');

    return (
        <React.Fragment>
            <SectionHeader title={t('settings.widgets.dtw.date.title')} />
            <MenuRow
                title={t('settings.widgets.dtw.date.useDate')}
                action={{
                    type: ROWS_TYPE.CHECKBOX,
                    value: widgets.settings.dtwUseDate,
                    onChange: (event, value) => {
                        widgets.settings.update({ dtwUseDate: value });
                    },
                }}
            />
            <Collapse in={widgets.settings.dtwUseDate}>
                <MenuRow
                    title={t('settings.widgets.dtw.date.clickAction.title')}
                    description={t('settings.widgets.dtw.date.clickAction.description')}
                    action={{
                        type: ROWS_TYPE.LINK,
                        onClick: () => { setActionEditorOpen(true); },
                        component: widgets.settings.dtwDateAction
                            ? `open: ${getDomain(widgets.settings.dtwDateAction)}`
                            : (
                                <Typography className={classes.notSetValue}>
                                    {t('settings.widgets.dtw.date.clickAction.notSet')}
                                </Typography>
                            ),
                    }}
                />
                <Dialog open={actionEditorOpen} onClose={() => { setActionEditorOpen(false); }}>
                    <DialogTitle>{t('settings.widgets.dtw.date.clickAction.titleFull')}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {t('settings.widgets.dtw.date.clickAction.descriptionFull')}
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            defaultValue={widgets.settings.dtwDateAction}
                            fullWidth
                            label={t('settings.widgets.dtw.date.clickAction.textFieldLabelUrl')}
                            onChange={(event) => { setActionUrl(event.target.value); }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            color="primary"
                            onClick={() => { setActionEditorOpen(false); }}
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            color="primary"
                            onClick={() => {
                                setActionEditorOpen(false);
                                widgets.settings.update({ dtwDateAction: actionUrl });
                            }}
                        >
                            {t('save')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Collapse>
        </React.Fragment>
    );
}

export default observer(DateWidget);
