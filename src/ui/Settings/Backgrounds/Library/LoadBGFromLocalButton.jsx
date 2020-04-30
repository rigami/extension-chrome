import React, { Fragment } from 'preact/compat';
import { h } from 'preact';
import { inject, observer } from 'mobx-react';

import { useSnackbar } from 'notistack';
import { Button } from '@material-ui/core';
import { Add as UploadFromComputerIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import locale from '@/i18n/RU';
import PropTypes from 'prop-types';
import BackgroundsStore from '@/stores/backgrounds';

const useStyles = makeStyles(() => ({ input: { display: 'none' } }));
function LoadBGFromLocalButton({ backgroundsStore }) {
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

LoadBGFromLocalButton.propTypes = { backgroundsStore: PropTypes.instanceOf(BackgroundsStore).isRequired };

export default inject('backgroundsStore')(observer(LoadBGFromLocalButton));
