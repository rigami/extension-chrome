import React, { useEffect, useState, useRef } from 'preact/compat';
import { h, Fragment } from 'preact';
import {
	Box,
	Container,
	ListItem,
	ListItemText,
	ListItemIcon,
	Typography,
	Fade,
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { LabelRounded as LabelIcon } from '@material-ui/icons';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import ReactResizeDetector from 'react-resize-detector';
import { useService as useAppService } from '@/stores/app';
import Categories from '@/ui/Bookmarks/Ctegories';
import CreateBookmarkButton from './CreateBookmarkButton';
import CardLink from './CardLink';
import FullScreenStub from '@/ui-components/FullscreenStub'

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
		marginBottom: theme.spacing(3),
	},
	container: {
		paddingTop: theme.spacing(3),
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
	categoryText: { maxWidth: 700 },
	categoryHeader: { marginTop: theme.spacing(3) },
}));

const maxColumnCalc = () => Math.min(
	Math.floor((document.getElementById('bookmarks-container').clientWidth + 16 - 48) / 196),
	6,
);

function Bookmarks() {
	const classes = useStyles();
	const theme = useTheme();
	const bookmarksStore = useBookmarksService();
	const appService = useAppService();
	const isFirstRun = useRef(true);
	const [columnsCount, setColumnsCount] = useState(null);
	const [isSearching, setIsSearching] = useState(false);
	const [findBookmarks, setFindBookmarks] = useState(null);
	const [lastTruthSearchTimestamp, setLastTruthSearchTimestamp] = useState(bookmarksStore.lastTruthSearchTimestamp);

	let columnStabilizer = null;

	const handleSearch = (searchCategories = []) => {
		setIsSearching(true);

		bookmarksStore.search({ categories: searchCategories })
			.then((searchResult) => {
				setLastTruthSearchTimestamp(bookmarksStore.lastTruthSearchTimestamp);
				setFindBookmarks(searchResult);
				setIsSearching(false);
			});
	};

	useEffect(() => {
		setColumnsCount(maxColumnCalc());
	}, []);

	useEffect(() => {
		if (appService.activity === 'bookmarks') {
			handleSearch(bookmarksStore.lastSearch?.categories);
		} else {
			setIsSearching(false);
		}
	}, [appService.activity]);

	useEffect(() => {
		if (isFirstRun.current) {
			isFirstRun.current = false;
			return;
		}

		if (bookmarksStore.lastTruthSearchTimestamp !== lastTruthSearchTimestamp && !isSearching) {
			handleSearch(bookmarksStore.lastSearch?.categories);
		}
	}, [bookmarksStore.lastTruthSearchTimestamp]);

	return (
		<Fragment>
			<Box id="bookmarks-container" className={classes.root}>
				<Container className={classes.container} fixed style={{ maxWidth: columnsCount * 196 - 16 + 48 }}>
					<Categories
						className={classes.chipContainer}
						onChange={handleSearch}
					/>
					<Fade
						in={!isSearching && appService.activity === 'bookmarks'}
						onExited={() => setFindBookmarks(null)}
					>
						<div>
							{findBookmarks !== null && findBookmarks.length === 0 && (
								<FullScreenStub message="Ничего не найдено (" />
							)}
							{findBookmarks !== null && findBookmarks.map(({ category, bookmarks }) => {
								columnStabilizer = [...Array.from({ length: columnsCount }, () => 0)];

								return (
									<Fragment>
										{category.id !== 'all' && (
											<ListItem disableGutters className={classes.categoryHeader}>
												{category.id !== 'best' && (
													<ListItemIcon style={{ minWidth: 36 }} >
														<LabelIcon style={{ color: category && category.color }} />
													</ListItemIcon>
												)}
												<ListItemText
													classes={{
														root: classes.categoryText,
														primary: classes.categoryTitle,
														secondary: classes.categoryDescription,
													}}
													primary={(category && category.name) || "Неизвестная категория"}
												/>
											</ListItem>
										)}
										<Box className={classes.categoryWrapper}>
											{bookmarks.length === 0 && (
												<Typography variant="body1" style={{ color: theme.palette.text.secondary }}>Нет подходящих элементов</Typography>
											)}
											{bookmarks.reduce((acc, curr, index) => {
												let column = 0;
												columnStabilizer.forEach((element, index) => {
													if (columnStabilizer[column] > element) column = index;
												});

												columnStabilizer[column] += curr.type === 'extend' ? 0.8 : 0.6;
												columnStabilizer[column] += Math.min(Math.ceil(curr.name.length / 15), 2) * 0.2 || 0.4
												columnStabilizer[column] += (curr.description && Math.min(Math.ceil(curr.description.length / 20), 4) * 0.17) || 0;
												columnStabilizer[column] += 0.12;

												//console.log(columnStabilizer)

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
											))}
										</Box>
									</Fragment>
								);
							})}
						</div>
					</Fade>
				</Container>
				<ReactResizeDetector handleWidth onResize={() => setColumnsCount(maxColumnCalc())} />
			</Box>
			<CreateBookmarkButton />
		</Fragment>
	);
}

export default observer(Bookmarks);
