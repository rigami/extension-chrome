import React, { useState } from 'preact/compat';
import { h, Fragment } from 'preact';
import {
	Button,
	Card,
	CardContent,
	CardMedia,
	CircularProgress,
	Container,
	Drawer,
	Typography,
	TextField,
	ButtonGroup,
} from '@material-ui/core';
import { AddRounded as AddIcon } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import locale from '@/i18n/RU';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import Categories from './Ctegories'
import CardLink from '@/ui/Bookmarks/CardLink'

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
		padding: theme.spacing(2),
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'flex-start',
		flexDirection: 'column',
		flexGrow: 0,
		flexShrink: 0,
		backgroundColor: theme.palette.grey[900],
		boxSizing: 'content-box',
	},
	typeSwitcher: {
		marginBottom: theme.spacing(2),
	},
	notSelectButton: {
		color: theme.palette.text.secondary,
	},
	controls: {
		display: 'flex',
		alignItems: 'center',
		paddingLeft: theme.spacing(2),
		paddingBottom: theme.spacing(2),
		justifyContent: 'flex-end',
	},
	button: {
		marginRight: theme.spacing(2),
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
	input: {
		marginTop: theme.spacing(2),
	},
	chipContainer: {
		marginTop: theme.spacing(2),
	},
	addDescriptionButton: {
		marginTop: theme.spacing(2),
	},
}));


function CreateBookmarkModal({ isOpen, onClose }) {
	const bookmarksStore = useBookmarksService();
	const { enqueueSnackbar } = useSnackbar();
	const [title, setTitle] = useState(null);
	const [description, setDescription] = useState(null);
	const [type, setType] = useState("default");

	const classes = useStyles();
	const theme = useTheme();
	return (
		<Drawer
			anchor="bottom"
			open={isOpen}
			PaperProps={{
				elevation: 0,
				style: { background: 'none' },
			}}
			onClose={() => onClose()}
		>
			<Container
				maxWidth="md"
				style={{
					marginBottom: theme.spacing(3),
					marginTop: theme.spacing(3),
				}}
			>
				<Card className={classes.bgCardRoot} elevation={8}>
					<CardMedia
						className={classes.cover}
					>
						{/* <CircularProgress style={{ color: theme.palette.common.white }} /> */}
						{title && (
							<Fragment>
								<ButtonGroup className={classes.typeSwitcher}>
									<Button
										className={type !== 'default' && classes.notSelectButton}
										color={type === 'default' && "primary"}
										variant={type === 'default' && "contained"}
										onClick={() => setType("default")}
									>
										Обычная
									</Button>
									<Button
										className={type !== 'extend' && classes.notSelectButton}
										color={type === 'extend' && "primary"}
										variant={type === 'extend' && "contained"}
										onClick={() => setType("extend")}
									>
										Расширенная
									</Button>
								</ButtonGroup>
								<CardLink
									title={title}
									description={description}
									categories={[]}
									type={type}
								/>
							</Fragment>
						)}
						{!title && (
							<Typography>Укажите название</Typography>
						)}
					</CardMedia>
					<div className={classes.details}>
						<CardContent className={classes.content}>
							<Typography component="h5" variant="h5">
								Добавление закладки
							</Typography>
							<TextField
								label="URL адрес"
								variant="outlined"
								fullWidth
								className={classes.input}
							/>
							<TextField
								label="Название"
								variant="outlined"
								fullWidth
								className={classes.input}
								onChange={(event) => setTitle(event.target.value)}
							/>
							<Categories
								className={classes.chipContainer}
								sortByPopular
								onChange={(categories) => {}}
							/>
							{description !== null && (
								<TextField
									label="Описание"
									variant="outlined"
									fullWidth
									className={classes.input}
									multiline
									rows={3}
									rowsMax={3}
									onChange={(event) => setDescription(event.target.value)}
								/>
							)}
							{description === null && (
								<Button
									startIcon={<AddIcon />}
									className={classes.addDescriptionButton}
									onClick={() => setDescription("")}
								>
									Добавить описание
								</Button>
							)}
						</CardContent>
						<div className={classes.controls}>
							<Button
								variant="text"
								color="default"
								className={classes.button}
								onClick={() => onClose()}
							>
								{localeGlobal.cancel}
							</Button>
							<div className={classes.button}>
								<Button
									variant="contained"
									color="primary"
									onClick={() => {}}
								>
									Сохранить
								</Button>
							</div>
						</div>
					</div>
				</Card>
			</Container>
		</Drawer>
	);
}

CreateBookmarkModal.propTypes = {  };

export default observer(CreateBookmarkModal);
