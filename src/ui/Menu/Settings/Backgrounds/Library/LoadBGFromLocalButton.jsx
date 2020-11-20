import React, { memo } from 'react';
import { useObserver } from 'mobx-react-lite';
import { useSnackbar } from 'notistack';
import { Button } from '@material-ui/core';
import { Add as UploadFromComputerIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import useBackgroundsService from '@/stores/BackgroundsStateProvider';

const useStyles = makeStyles(() => ({ input: { display: 'none' } }));

function LoadBGFromLocalButton() {
    const backgroundsService = useBackgroundsService();
    const { enqueueSnackbar } = useSnackbar();
    const classes = useStyles();
    const { t } = useTranslation();

    return useObserver(() => (
        <React.Fragment>
            <input
                className={classes.input}
                id="upload-from-system"
                multiple
                type="file"
                accept="video/*,image/*"
                onChange={(event) => {
                    const form = event.target;
                    if (form.files.length === 0) return;

                    backgroundsService.addToUploadQueue(form.files)
                        .catch(() => enqueueSnackbar({
                            ...t('settings.bg.general.library[e]'),
                            variant: 'error',
                        }))
                        .finally(() => {
                            form.value = '';
                        });
                }}
            />
            <label htmlFor="upload-from-system">
                <Button
                    variant="contained"
                    component="span"
                    disableElevation
                    color="primary"
                    startIcon={<UploadFromComputerIcon />}
                    style={{ marginRight: 16 }}
                >
                    {t('settings.bg.general.library.uploadFromComputer')}
                </Button>
            </label>
        </React.Fragment>
    ));
}

export default memo(LoadBGFromLocalButton);
