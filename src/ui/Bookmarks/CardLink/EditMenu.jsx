import React, { useState, useRef } from 'preact/compat';
import { h, Fragment } from 'preact';
import {
	IconButton,
	Menu,
	ListItem,
	ListItemIcon,
	ListItemText,
} from '@material-ui/core';
import {
	MoreVertRounded as MoreIcon,
	BookmarkBorderRounded as PinnedFavoriteIcon,
	BookmarkRounded as UnpinnedFavoriteIcon,
	EditRounded as EditIcon,
	DeleteRounded as RemoveIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useService as useBookmarksService } from '@/stores/bookmarks'
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
	menu: {
		width: 230,
	},
}));

function EditMenu ({ className: externalClassName, bookmarkId }) {
	const classes = useStyles();
	const bookmarksStore = useBookmarksService();

	const buttonRef = useRef(null);
	const [isOpen, setIsOpen] = useState(false);
	const [position, setPosition] = useState(null);

	const handleOpen = (event) => {
		const { top, left } = buttonRef.current.getBoundingClientRect();
		setPosition({ top, left });
		setIsOpen(true);
	};

	const isPin = () => bookmarksStore.favorites.find((fav) => fav.type === 'bookmark' && fav.id === bookmarkId);

	const handlePin = () => {
		if (isPin()) {
			bookmarksStore.removeFromFavorites({ type: 'bookmark', id: bookmarkId });
		} else {
			bookmarksStore.addToFavorites({ type: 'bookmark', id: bookmarkId });
		}
	};

	return (
		<Fragment>
			<IconButton
				className={externalClassName}
				onClick={handleOpen}
				ref={buttonRef}
			>
				<MoreIcon />
			</IconButton>
			<Menu
				open={isOpen}
				onClose={() => setIsOpen(false)}
				anchorReference="anchorPosition"
				anchorPosition={position}
				classes={{ list: classes.menu }}
			>
				<ListItem button dense onClick={handlePin}>
					<ListItemIcon>
						{isPin() ? (<UnpinnedFavoriteIcon />) : (<PinnedFavoriteIcon />)}
					</ListItemIcon>
					<ListItemText
						primary={isPin() ? "Открепить от панели быстрого доступа" : "Закрепить на панели быстрого доступа"}
					/>
				</ListItem>
				<ListItem button dense >
					<ListItemIcon>
						<EditIcon />
					</ListItemIcon>
					<ListItemText primary="Редактировать" />
				</ListItem>
				<ListItem button dense >
					<ListItemIcon>
						<RemoveIcon />
					</ListItemIcon>
					<ListItemText primary="Удалить" />
				</ListItem>
			</Menu>
		</Fragment>
	);
}

export default observer(EditMenu);
