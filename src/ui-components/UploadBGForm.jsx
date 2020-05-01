import React, { useEffect, useRef, useState } from 'preact/compat';
import { h, Fragment } from 'preact';
import {
	Button,
	Card,
	CardContent,
	CardMedia,
	CircularProgress,
	Container,
	Drawer,
	FormControlLabel,
	Switch,
	Tooltip,
	Typography,
	Box,
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import {
	WarningRounded as WarningIcon,
	AddPhotoAlternateRounded as DropIcon,
} from '@material-ui/icons';
import locale from '@/i18n/RU';
import { fade } from '@material-ui/core/styles/colorManipulator';
import PropTypes from 'prop-types';
import { useService as useBackgroundsService } from '@/stores/backgrounds';
import { BG_TYPE } from '@/dict';

const {
	global: localeGlobal,
	settings: { backgrounds: { general: { library: localeLibrary } } },
} = locale;

const useStyles = makeStyles((theme) => ({
	preview: {
		height: 100,
		width: 177,
		backgroundSize: 'cover',
		backgroundPosition: '50%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	cellStickyHeader: { backgroundColor: theme.palette.common.white },
	bgCardRoot: { display: 'flex' },
	details: {
		display: 'flex',
		flexDirection: 'column',
		flexGrow: 1,
	},
	content: { flex: '1 0 auto' },
	cover: {
		width: 320,
		minHeight: 240,
		backgroundColor: theme.palette.primary.main,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	controls: {
		display: 'flex',
		alignItems: 'center',
		paddingLeft: theme.spacing(1),
		paddingBottom: theme.spacing(1),
		justifyContent: 'flex-end',
	},
	button: {
		marginRight: theme.spacing(1),
		position: 'relative',
	},
	buttonProgress: {
		position: 'absolute',
		top: '50%',
		left: '50%',
		marginTop: -12,
		marginLeft: -12,
	},
	dragFile: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: theme.zIndex.dropFiles,
		backgroundColor: fade(theme.palette.common.black, 0.65),
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'column',
		color: theme.palette.common.white,
		'& *': { pointerEvents: 'none' },
	},
}));

function BGCard(props) {
	const {
		name,
		previewUrl,
		preview,
		size,
		type,
		format,
		onRemove,
		onDone,
		...other
	} = props;
	const classes = useStyles();
	const theme = useTheme();

	const [save, setSave] = useState(false);
	const [antiAliasing, setAntiAliasing] = useState(true);

	return (
		<Card className={classes.bgCardRoot} elevation={8} {...other}>
			<CardMedia
				className={classes.cover}
				image={previewUrl}
			>
				{preview === 'pending' && (
					<CircularProgress style={{ color: theme.palette.common.white }} />
				)}
				{preview === 'failed' && (
					<WarningIcon style={{ color: theme.palette.common.white }} />
				)}
			</CardMedia>
			<div className={classes.details}>
				<CardContent className={classes.content}>
					<Typography component="h5" variant="h5">
						{type.map((t) => localeGlobal.bg_type[t]).join('/')}
					</Typography>
					<Typography variant="subtitle1" color="textSecondary">
						Файл:
						{' '}
						{name}
					</Typography>
					<Typography variant="subtitle1" color="textSecondary">
						Размер:
						{' '}
						{Math.round(size)}
						мб
					</Typography>
					<Typography variant="subtitle1" color="textSecondary">
						Тип:
						{' '}
						{format}
					</Typography>
					<Tooltip title={localeLibrary.upload_form.anti_aliasing.tooltip}>
						<FormControlLabel
							control={
								<Switch
									onChange={(e) => setAntiAliasing(e.target.checked)}
									disabled={save}
									color="primary"
									defaultChecked
								/>
							}
							label={localeLibrary.upload_form.anti_aliasing.label}
						/>
					</Tooltip>
				</CardContent>
				<div className={classes.controls}>
					<Button
						variant="text"
						color="default"
						disabled={save}
						// startIcon={<DeleteIcon/>}
						className={classes.button}
						onClick={onRemove}
					>
						{localeGlobal.cancel}
					</Button>
					<div className={classes.button}>
						<Button
							variant="contained"
							color="primary"
							disabled={save}
							// startIcon={<SuccessIcon/>}
							onClick={() => {
								setSave(true);
								onDone({ antiAliasing });
							}}
						>
							{localeLibrary.upload_form.add_to_library}
						</Button>
						{save && <CircularProgress size={24} className={classes.buttonProgress} />}
					</div>
				</div>
			</div>
		</Card>
	);
}

BGCard.propTypes = {
	name: PropTypes.string.isRequired,
	previewUrl: PropTypes.string.isRequired,
	preview: PropTypes.any.isRequired,
	size: PropTypes.number.isRequired,
	type: PropTypes.objectOf(BG_TYPE).isRequired,
	format: PropTypes.string.isRequired,
	onRemove: PropTypes.func,
	onDone: PropTypes.func,
};
BGCard.defaultProps = {
	onRemove: () => {},
	onDone: () => {},
};


function UploadBGForm({ children }) {
	const backgroundsStore = useBackgroundsService();
	const { enqueueSnackbar } = useSnackbar();

	const classes = useStyles();
	const theme = useTheme();

	const dragRef = useRef(null);
	const [dragFiles, setDragFiles] = useState(null);


	useEffect(() => {
		addEventListener('dragenter', (event) => {
			setDragFiles(Array.prototype.filter.call(
				event.dataTransfer.items,
				(file) => (~file.type.indexOf('image/') || ~file.type.indexOf('video/')),
			));
		});
	}, []);

	useEffect(() => {
		if (!dragRef.current) return;

		dragRef.current.ondragleave = () => {
			setDragFiles(null);
		};

		dragRef.current.ondragover = (event) => {
			event.preventDefault();
		};

		dragRef.current.ondrop = (event) => {
			event.preventDefault();
			console.log('drop', event.dataTransfer.files);
			setDragFiles(null);
			backgroundsStore.addToUploadQueue(event.dataTransfer.files)
				.catch((e) => enqueueSnackbar({
					...localeLibrary[e],
					variant: 'error',
				}));
		};
	}, [dragFiles]);

	return (
		<Fragment>
			{children}
			{dragFiles && dragFiles.length > 0 && (
				<Box className={classes.dragFile} ref={dragRef}>
					<DropIcon style={{
						marginBottom: theme.spacing(2),
						fontSize: 48,
					}} />
					<Typography variant="h6">
						{dragFiles.length === 1 && localeLibrary.upload_form.drop_to_add_bg}
						{dragFiles.length > 1 && localeLibrary.upload_form.drop_to_add_bgs}
					</Typography>
				</Box>
			)}
			<Drawer
				anchor="bottom"
				open={backgroundsStore.uploadQueue.length !== 0}
				PaperProps={{
					elevation: 0,
					style: { background: 'none' },
				}}
			>
				<Container
					maxWidth="md"
					style={{
						marginBottom: theme.spacing(3),
						marginTop: theme.spacing(3),
					}}
				>
					{backgroundsStore.uploadQueue.map((row, index) => (
						<BGCard
							key={row.id}
							{...row}
							style={{ marginTop: index === 0 ? 0 : theme.spacing(3) }}
							onRemove={() => {
								backgroundsStore.removeFromUploadQueue(row.id);
							}}
							onDone={(options) => {
								backgroundsStore.saveFromUploadQueue(row.id, options);
							}}
						/>
					))}
				</Container>
			</Drawer>
		</Fragment>
	);
}

UploadBGForm.propTypes = { children: PropTypes.element.isRequired };

export default observer(UploadBGForm);
