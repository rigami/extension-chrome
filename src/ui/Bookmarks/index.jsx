import React, { useEffect, useState, useRef } from 'preact/compat';
import { h, Fragment } from 'preact';
import {
	Box,
	Drawer,
	Container,
	ListItem,
	ListItemText,
	ListItemIcon,
	Chip,
	Zoom,
	Fab,
	Typography,
	Fade,
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
	LabelRounded as LabelIcon,
	AddRounded as AddIcon,
} from '@material-ui/icons';
import CardLink from './CardLink';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import ReactResizeDetector from 'react-resize-detector';
import CreateCategoryButton from './CreateCategoryButton';
import { useService as useAppService } from '@/stores/app';

const useStyles = makeStyles((theme) => ({
	root: {
		minHeight: '100vh',
		width: '100vw',
		backgroundColor: theme.palette.background.paper,
		transform: 'translate3d(0,0,0)',
	},
	categoryWrapper: {
		display: 'flex',
		flexWrap: 'wrap',
	},
	chipContainer: {
		display: 'flex',
		flexWrap: 'wrap',
		marginBottom: theme.spacing(3),
		'& > *': {
			marginRight: theme.spacing(1),
			marginBottom: theme.spacing(1),
		},
	},
	container: {

	},
	categoryTitle: {
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
	},
	categoryDescription: {
		display: '-webkit-box',
		overflow: 'hidden',
		'-webkit-box-orient': 'vertical',
		'-webkit-line-clamp': 3,
	},
	categoryText: {
		maxWidth: 700,
	},
	chipColor: {
		width: theme.spacing(2),
		height: theme.spacing(2),
		borderRadius: '50%',
		marginLeft: `${theme.spacing(1)}px !important`,
	},
	categoryHeader: {
		marginTop: theme.spacing(3),
	},
	fab: {
		position: 'fixed',
		bottom: theme.spacing(4),
		right: theme.spacing(4),
		zIndex: theme.zIndex.snackbar,
	},
	fabIcon: {
		marginRight: theme.spacing(1),
	},
}));

const maxColumnCalc = () => Math.min(
	Math.floor((document.getElementById("bookmarks-container").clientWidth + 16 - 48)/ 196),
	6
);

function Bookmarks() {
	const classes = useStyles();
	const theme = useTheme();
	const bookmarksStore = useBookmarksService();
	const appService = useAppService();
	const [selectedCategories, setSelectedCategories] = useState([]);
	const [columnsCount, setColumnsCount] = useState(null);
	const [isSearching, setIsSearching] = useState(true);
	const [findBookmarks, setFindBookmarks] = useState(null);


	const transitionDuration = {
		enter: theme.transitions.duration.enteringScreen,
		exit: theme.transitions.duration.leavingScreen,
	};

	let columnStabilizer = null;

	useEffect(() => {
		setColumnsCount(maxColumnCalc());
	}, []);

	useEffect(() => {
		setIsSearching(true);
	}, [selectedCategories.length]);

	useEffect(() => {
		if (isSearching && findBookmarks === null) {
			setFindBookmarks(bookmarksStore.getBookmarks({
				selectCategories: selectedCategories
			}));
			setIsSearching(false);
		}
	}, [findBookmarks, isSearching]);

	return (
		<Fragment>
			<Box id="bookmarks-container" className={classes.root}>
				<Container className={classes.container} fixed style={{ maxWidth: columnsCount * 196 - 16 + 48 }}>
					<Box className={classes.chipContainer}>
						{
							bookmarksStore.getCategories({})
								.map(({ id, title, color }) => (
									<Chip
										key={id}
										icon={<div className={classes.chipColor} style={{ backgroundColor: color }} />}
										label={title}
										variant={~selectedCategories.indexOf(id) ? "default" : "outlined"}
										onClick={() => {
											if (~selectedCategories.indexOf(id)) {
												setSelectedCategories(selectedCategories.filter((cId) => cId !== id));
											} else {
												setSelectedCategories([...selectedCategories, id]);
											}
										}}
									/>
								))
						}
						<CreateCategoryButton />
					</Box>
					<Fade
						in={!isSearching}
						onExited={() => {
							setFindBookmarks(null);
						}}
					>
						<div>
						{
							findBookmarks && Object.keys(findBookmarks)
							.sort((categoryA, categoryB) => {
								if (categoryA > categoryB) {
									return -1;
								} else if (categoryA < categoryB) {
									return 1;
								} else {
									return 0;
								}
							})
							.map((category) => {
								columnStabilizer = [...Array.from({ length: columnsCount }, () => 0)];

								return (
									<Fragment>
										{category !== 'all' && (
											<ListItem disableGutters className={classes.categoryHeader}>
												{category !== 'best' && (
													<ListItemIcon style={{ minWidth: 36 }} >
														<LabelIcon style={{ color: bookmarksStore.getCategory(category).color }} />
													</ListItemIcon>
												)}
												<ListItemText
													classes={{
														root: classes.categoryText,
														primary: classes.categoryTitle,
														secondary: classes.categoryDescription,
													}}
													primary={category !== 'best' ? bookmarksStore.getCategory(category).title : "Best matches"}
												/>
											</ListItem>
										)}
										<Box className={classes.categoryWrapper}>
											{findBookmarks[category].length === 0 && (
												<Typography variant="body1" style={{ color: theme.palette.text.secondary }}>Нет подходящих элементов</Typography>
											)}
											{
												findBookmarks[category]
													.reduce((acc, curr, index) => {
														let column = 0;
														columnStabilizer.forEach((element, index) => {
															if (columnStabilizer[column] > element) column = index;
														});

														columnStabilizer[column] += curr.type === 'extend' ? curr.description ? 2 : 1.2 : 1;

														if (typeof acc[column] === 'undefined') acc[column] = [];

														acc[column].push(curr);

														return acc;
													}, [])
													.map((column, index, arr) => (
														<Box style={{ marginRight: theme.spacing(arr.length - 1 !== index ? 2 : 0) }}>
															{column.map((card) => (
																<CardLink {...card} style={{ marginBottom: theme.spacing(2) }} />
															))}
														</Box>
													))
											}
										</Box>
									</Fragment>
								);
							})
						}
						</div>
					</Fade>
				</Container>
				<ReactResizeDetector handleWidth onResize={() => setColumnsCount(maxColumnCalc())} />
			</Box>
			<Zoom
				in={appService.activity === "bookmarks"}
				timeout={transitionDuration}
				style={{ transitionDelay: 0 }}
				unmountOnExit
			>
				<Fab className={classes.fab} color="primary" variant="extended">
					<AddIcon className={classes.fabIcon}/>
					Добавить закладку
				</Fab>
			</Zoom>
		</Fragment>
	);
}

export default observer(Bookmarks);
