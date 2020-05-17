import React from 'preact/compat';
import { h, Fragment } from 'preact';
import {
	ListItem,
	ListItemText,
	ListItemIcon,
	ListItemSecondaryAction,
	IconButton,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
	LabelRounded as LabelIcon,
	BookmarkBorderRounded as PinnedFavoriteIcon,
	BookmarkRounded as UnpinnedFavoriteIcon,
	EditRounded as EditIcon,
	DeleteRounded as RemoveIcon,
} from '@material-ui/icons';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
	root: { marginTop: theme.spacing(3) },
	container: {
		listStyle: 'none',
	},
	text: { maxWidth: 700 },
	title: {
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
	},
	description: {
		display: '-webkit-box',
		overflow: 'hidden',
		'-webkit-box-orient': 'vertical',
		'-webkit-line-clamp': 3,
	},
}));


function CategoryHeader({ id, color, name }) {
	const classes = useStyles();
	const bookmarksStore = useBookmarksService();

	const isPin = () => bookmarksStore.favorites.find((fav) => fav.type === 'category' && fav.id === id);

	const handlePin = () => {
		if (isPin()) {
			bookmarksStore.removeFromFavorites({ type: 'category', id });
		} else {
			bookmarksStore.addToFavorites({ type: 'category', id });
		}
	};

	return (
		<ListItem
			disableGutters
			classes={{
				root: classes.root,
				container: classes.container,
			}}
		>
			{id !== 'best' && (
				<ListItemIcon style={{ minWidth: 36 }} >
					<LabelIcon style={{ color }} />
				</ListItemIcon>
			)}
			<ListItemText
				classes={{
					root: classes.text,
					primary: classes.title,
					secondary: classes.description,
				}}
				primary={name || "Неизвестная категория"}
			/>
			<ListItemSecondaryAction>
				<IconButton onClick={handlePin}>
					{isPin() ? (<UnpinnedFavoriteIcon />) : (<PinnedFavoriteIcon />)}
				</IconButton>
				<IconButton>
					<EditIcon />
				</IconButton>
				<IconButton>
					<RemoveIcon />
				</IconButton>
			</ListItemSecondaryAction>
		</ListItem>
	);
}

export default observer(CategoryHeader);
