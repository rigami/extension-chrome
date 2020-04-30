import React, { Fragment } from 'preact/compat';
import { h } from 'preact';
import { observer } from 'mobx-react-lite';

import { useSnackbar } from 'notistack';
import { Button } from '@material-ui/core';
import { Add as UploadFromComputerIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import locale from '@/i18n/RU';
import { useContext } from 'preact/hooks';
import { context as BackgroundsContext } from '@/stores/backgrounds/Provider';

const useStyles = makeStyles(() => ({ input: { display: 'none' } }));
function LoadBGFromLocalButton({}) {
	const backgroundsStore = useContext(BackgroundsContext);
	const classes = useStyles();
	const { enqueueSnackbar } = useSnackbar();

	return (
		<Fragment>
			<input
				className={classes.input}
				id="upload-from-system"
				multiple
				type="file"
				accept="video/*,image/*"
				onChange={(event) => {
					if (event.target.files.length === 0) return;

					backgroundsStore.addToUploadQueue(event.target.files)
						.catch((e) => enqueueSnackbar({
							...locale.settings.backgrounds.general.library[e],
							variant: 'error',
						}))
						.finally(() => {
							event.target.value = '';
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
		</Fragment>
	);
}

export default observer(LoadBGFromLocalButton);
