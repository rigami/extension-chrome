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
} from '@material-ui/core';
import { observer, useLocalStore } from 'mobx-react-lite';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
	LabelRounded as LabelIcon,
	AddRounded as AddIcon,
} from '@material-ui/icons';
import CardLink from './CardLink';
import CardLinkExtend from './CardLink/Extend';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import ReactResizeDetector from 'react-resize-detector';

const useStyles = makeStyles((theme) => ({
	root: {
		height: '100vh',
		overflow: 'hidden',
		overflowY: 'scroll',
	},
	categoryWrapper: {
		display: 'flex',
		flexWrap: 'wrap',
	},
	chipContainer: {
		display: 'flex',
		flexWrap: 'wrap',
		marginBottom: theme.spacing(1),
		'& > *': {
			marginRight: theme.spacing(1),
			marginBottom: theme.spacing(1),
		},
	},
	container: {
		paddingTop: theme.spacing(2),
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
		position: 'absolute',
		bottom: theme.spacing(2),
		right: theme.spacing(2),
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
	const [selectedCategories, setSelectedCategories] = useState([]);
	const [columnsCount, setColumnsCount] = useState(null);

	const transitionDuration = {
		enter: theme.transitions.duration.enteringScreen,
		exit: theme.transitions.duration.leavingScreen,
	};

	let columnStabilizer = null;

	useEffect(() => {
		setColumnsCount(maxColumnCalc())
	}, []);

	return (
		<Drawer
			anchor="bottom"
			open={true}
			onClose={() => {}}
			disableEnforceFocus
		>
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
					</Box>
					{
						Object.keys(bookmarksStore.getBookmarks({
							selectCategories: selectedCategories
						}))
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
												secondary={category !== 'best' && bookmarksStore.getCategory(category).description}
											/>
										</ListItem>
									)}
									<Box className={classes.categoryWrapper}>
										{
											bookmarksStore.getBookmarks({
												selectCategories: selectedCategories
											})[category]
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
														card.type === 'extend' ? (
															<CardLinkExtend {...card} style={{ marginBottom: theme.spacing(2) }} />
														) : (
															<CardLink {...card} style={{ marginBottom: theme.spacing(2) }} />
														)
													))}
												</Box>
											))
										}
									</Box>
								</Fragment>
							);
						})
					}
				</Container>
				<Zoom
					in={true}
					timeout={transitionDuration}
					style={{
						transitionDelay: `${true ? transitionDuration.exit : 0}ms`,
					}}
					unmountOnExit
				>
					<Fab className={classes.fab} color="primary" variant="extended">
						<AddIcon className={classes.fabIcon}/>
						Добавить закладку
					</Fab>
				</Zoom>
				<ReactResizeDetector handleWidth onResize={() => setColumnsCount(maxColumnCalc())} />
			</Box>
		</Drawer>
	);
}

export default observer(Bookmarks);
