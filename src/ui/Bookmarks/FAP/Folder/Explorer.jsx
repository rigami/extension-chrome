import React, { useState, useEffect } from 'preact/compat';
import { h } from 'preact';
import {
	Card,
	CardHeader,
	Avatar,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	CircularProgress,
} from '@material-ui/core';
import {
	LinkRounded as LinkIcon,
	LabelRounded as LabelIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import clsx from 'clsx';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import Scrollbar from '@/ui-components/CustomScroll';
import FullScreenStub from '@/ui-components/FullscreenStub'

const useStyles = makeStyles((theme) => ({
	root: {
		width: 310,
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(2),
		backdropFilter: 'blur(15px) brightness(130%)',
		backgroundColor: fade(theme.palette.background.default, 0.70),
	},
	avatar: {
		display: 'flex',
	},
	list: {
		height: 300,
		overflow: 'auto',
	},
}));

function Folder ({ id }) {
	const classes = useStyles();
	const bookmarksStore = useBookmarksService();

	const [category] = useState(bookmarksStore.getCategory(id));
	const [isSearching, setIsSearching] = useState(true);
	const [findBookmarks, setFindBookmarks] = useState(null);

	useEffect(() => {
		bookmarksStore.search({ categories: [id] }, true)
			.then((searchResult) => {
				setFindBookmarks(searchResult[0]?.bookmarks || []);
				setIsSearching(false);
			});
	}, []);

	return (
		<Card className={classes.root} elevation={16}>
			<CardHeader
				avatar={(
					<LabelIcon style={{ color: category.color }} />
				)}
				title={category.name}
				classes={{
					avatar: classes.avatar,
				}}
			/>
			<List disablePadding className={classes.list}>
				<Scrollbar>
					{isSearching && (
						<FullScreenStub style={{ height: 300 }}>
							<CircularProgress />
						</FullScreenStub>
					)}
					{!isSearching && findBookmarks.length === 0 && (
						<FullScreenStub
							style={{ height: 300 }}
							message="Здесть пока пусто"
							description="В этой категории еще нет закладок"
						/>
					)}
					{findBookmarks && findBookmarks.map((bookmark, index) => (
						<ListItem divider={index !== findBookmarks.length - 1} button>
							<ListItemAvatar>
								<Avatar>
									<LinkIcon />
								</Avatar>
							</ListItemAvatar>
							<ListItemText primary={bookmark.name} secondary={bookmark.description} />
						</ListItem>
					))}
				</Scrollbar>
			</List>
		</Card>
	);
}

export default Folder;
