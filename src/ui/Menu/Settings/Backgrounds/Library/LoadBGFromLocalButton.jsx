import React from 'react';

import { observer } from 'mobx-react-lite';

import { useSnackbar } from 'notistack';
import { Button } from '@material-ui/core';
import { Add as UploadFromComputerIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import locale from '@/i18n/RU';
import { useService as useBackgroundsService } from '@/stores/backgrounds';

const useStyles = makeStyles(() => ({ input: { display: 'none' } }));
function LoadBGFromLocalButton({}) {
    const backgroundsStore = useBackgroundsService();
    const { enqueueSnackbar } = useSnackbar();
    const classes = useStyles();

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

                    backgroundsStore.addToUploadQueue(form.files)
                        .catch((e) => enqueueSnackbar({
                            ...locale.settings.backgrounds.general.library[e],
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
                    {locale.settings.backgrounds.general.library.upload_from_computer}
                </Button>
            </label>
        </React.Fragment>
    );
}

export default observer(LoadBGFromLocalButton);
