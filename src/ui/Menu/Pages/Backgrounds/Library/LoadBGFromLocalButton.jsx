import React, { memo } from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from '@material-ui/core';
import { Add as UploadFromComputerIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import useAppStateService from '@/stores/app/AppStateProvider';

const useStyles = makeStyles(() => ({ input: { display: 'none' } }));

function LoadBGFromLocalButton() {
    const { backgrounds } = useAppStateService();
    const classes = useStyles();
    const { t } = useTranslation(['settingsBackground']);

    return (
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

                    backgrounds.addToUploadQueue(form.files)
                        .finally(() => {
                            form.value = '';
                        });
                }}
            />
            <label htmlFor="upload-from-system">
                <Button
                    data-ui-path="backgrounds.general.library.uploadFromComputer"
                    variant="contained"
                    component="span"
                    disableElevation
                    color="primary"
                    startIcon={<UploadFromComputerIcon />}
                    style={{ marginRight: 16 }}
                >
                    {t('library.button.uploadFromComputer')}
                </Button>
            </label>
        </React.Fragment>
    );
}

export default memo(observer(LoadBGFromLocalButton));
