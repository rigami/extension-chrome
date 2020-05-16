import React, { useState } from 'preact/compat';
import { h, Fragment } from 'preact';
import {
	Button,
	Card,
	CardContent,
	CardMedia,
	Container,
	Typography,
	TextField,
	ButtonGroup,
} from '@material-ui/core';
import { AddRounded as AddIcon, LinkRounded as URLIcon } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import locale from '@/i18n/RU';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import CardLink from '@/ui/Bookmarks/CardLink';
import Categories from '../Ctegories';
import FullScreenStub from '@/ui-components/FullscreenStub'

const { global: localeGlobal } = locale;

const useStyles = makeStyles((theme) => ({
	bgCardRoot: { display: 'flex' },
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
		minWidth: 180,
	},
	typeSwitcher: { marginBottom: theme.spacing(2) },
	notSelectButton: { color: theme.palette.text.secondary },
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
	details: {
		display: 'flex',
		flexDirection: 'column',
		flexGrow: 1,
	},
	input: { marginTop: theme.spacing(2) },
	chipContainer: { marginTop: theme.spacing(2) },
	addDescriptionButton: { marginTop: theme.spacing(2) },
}));

function Creator({ onSave, onCancel }) {
	const classes = useStyles();
	const theme = useTheme();

	const bookmarksStore = useBookmarksService();
	const { enqueueSnackbar } = useSnackbar();
	const [url, setUrl] = useState(null);
	const [name, setName] = useState(null);
	const [description, setDescription] = useState(null);
	const [type, setType] = useState('default');
	const [categories, setCategories] = useState([]);

	const handlerSave = () => {
		bookmarksStore.addBookmark({ url, name, description, categories, type })
		.then(() => onSave());
	};

	return (
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
					{name && url && (
						<Fragment>
							<ButtonGroup className={classes.typeSwitcher}>
								<Button
									className={type !== 'default' && classes.notSelectButton}
									color={type === 'default' && 'primary'}
									variant={type === 'default' && 'contained'}
									onClick={() => setType('default')}
								>
									Обычная
								</Button>
								<Button
									className={type !== 'extend' && classes.notSelectButton}
									color={type === 'extend' && 'primary'}
									variant={type === 'extend' && 'contained'}
									onClick={() => setType('extend')}
								>
									Расширенная
								</Button>
							</ButtonGroup>
							<CardLink
								name={name}
								description={description}
								categories={[]}
								type={type}
							/>
						</Fragment>
					)}
					{!url && (
						<FullScreenStub
							iconRender={(props) => (<URLIcon {...props} />)}
							description="Укажите адрес"
						/>
					)}
					{!name && url && (
						<FullScreenStub
							iconRender={(props) => (<URLIcon {...props} />)}
							description="Дайте закладке имя"
						/>
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
							onChange={(event) => setUrl(event.target.value)}
						/>
						<TextField
							label="Название"
							variant="outlined"
							fullWidth
							className={classes.input}
							onChange={(event) => setName(event.target.value)}
						/>
						<Categories
							className={classes.chipContainer}
							sortByPopular
							onChange={(categories) => setCategories(categories)}
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
								onClick={() => setDescription('')}
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
							onClick={onCancel}
						>
							{localeGlobal.cancel}
						</Button>
						<div className={classes.button}>
							<Button
								variant="contained"
								color="primary"
								disabled={!url || !name}
								onClick={handlerSave}
							>
								Сохранить
							</Button>
						</div>
					</div>
				</div>
			</Card>
		</Container>
	);
}

export default observer(Creator);
