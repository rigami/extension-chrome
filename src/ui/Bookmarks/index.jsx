import React, { useEffect, useState } from 'preact/compat';
import { h, Fragment } from 'preact';
import {
	Box,
	Drawer,
	Container,
	ListItem,
	ListItemText,
	ListItemIcon,
	Chip,
} from '@material-ui/core';
import { observer, useLocalStore } from 'mobx-react-lite';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
	LabelRounded as LabelIcon,
} from '@material-ui/icons';
import CardLink from './CardLink';
import CardLinkExtend from './CardLink/Extend';
import { useService as useBookmarksService } from '@/stores/bookmarks';

const useStyles = makeStyles((theme) => ({
	root: {
		height: '100vh',
		overflow: 'auto',
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
}));

function Bookmarks() {
	const classes = useStyles();
	const theme = useTheme();
	const bookmarksStore = useBookmarksService();
	const [selectedCategories, setSelectedCategories] = useState([]);

	useEffect(() => {

	}, []);

	return (
		<Drawer
			anchor="bottom"
			open={true}
			onClose={() => {}}
			disableEnforceFocus
		>
			<Box className={classes.root}>
				<Container className={classes.container}>
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
						.map((category) => (
							<Fragment>
								{category !== 'all' && (
									<ListItem disableGutters>
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
												let column = index % 6;

												if (typeof acc[column] === 'undefined') acc[column] = [];

												acc[column].push(curr);

												return acc;
											}, [])
											.map((column, index, arr) => (
												<Box style={{ marginRight: arr.length - 1 !== index && theme.spacing(2) }}>
												{column.map((card) => (
													Math.random() > 0.5 ? (
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
						))
					}
				</Container>
			</Box>
		</Drawer>
	);
}

export default observer(Bookmarks);
