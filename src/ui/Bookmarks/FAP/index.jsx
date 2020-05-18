import React, { useState } from 'preact/compat';
import { h, Fragment } from 'preact';
import {
	Card,
	IconButton,
	Popper,
	CardHeader,
	ClickAwayListener,
	Avatar,
	List,
	ListItem,
	ListItemAvatar,
	ListItemText,
	Fade,
	Typography,
} from '@material-ui/core';
import {
	FolderRounded as FolderIcon,
	LinkRounded as LinkIcon,
} from '@material-ui/icons';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { fade } from '@material-ui/core/styles/colorManipulator';
import clsx from 'clsx';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import { BKMS_FAP_POSITION, BKMS_FAP_STYLE } from '@/dict';
import Link from './Link';
import Folder from './Folder';

const useStyles = makeStyles((theme) => ({
	root: {
		padding: theme.spacing(11),
		paddingTop: theme.spacing(3),
		paddingBottom: 0,
		width: '100%',
		zIndex: theme.zIndex.speedDial,
		display: 'flex',
		pointerEvents: 'none',
		justifyContent: 'center',
		position: 'relative',
		boxSizing: 'border-box',
	},
	stickyRoot: {
		position: 'sticky',
		top: 0,
		bottom: theme.spacing(3),
	},
	panel: {
		padding: theme.spacing(1),
		paddingRight: 0,
		margin: 'auto',
		pointerEvents: 'auto',
		borderRadius: theme.spacing(3.5),
		backdropFilter: 'blur(10px) brightness(130%)',
		backgroundColor: fade(theme.palette.background.default, 0.52),
		display: 'flex',
	},
	absolutePanel: {
		position: 'fixed',
		top: theme.spacing(3),
	},
	panelTransparent: {
		background: 'none',
		backdropFilter: 'none',
		boxShadow: 'none',
		padding: 0,
		paddingLeft: theme.spacing(1),
	},
	iconButton: {
		marginRight: theme.spacing(1),
		padding: theme.spacing(1),
		backgroundColor: fade(theme.palette.common.white, 0.32),
		'&:hover': { backgroundColor: fade(theme.palette.common.white, 0.52) },
	},
	popper: {
		width: 310,
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(2),
		backdropFilter: 'blur(15px) brightness(130%)',
		backgroundColor: fade(theme.palette.background.default, 0.70),
	},
	emptyTitle: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(2),
	},
}));

function FAP() {
	const classes = useStyles();
	const theme = useTheme();
	const appService = useBookmarksService();
	const bookmarksStore = useBookmarksService();

	return (
		<Fade in={appService.fapStyle !== BKMS_FAP_STYLE.HIDDEN} unmountOnExit>
			<div
				className={clsx(
					classes.root,
					appService.fapPosition === BKMS_FAP_POSITION.BOTTOM && classes.stickyRoot
				)}
				style={{ height: 40 + theme.spacing(3 + (appService.fapStyle === BKMS_FAP_STYLE.TRANSPARENT ? 0 : 2)) }}
			>
				<Card
					className={clsx(
						classes.panel,
						appService.fapStyle === BKMS_FAP_STYLE.TRANSPARENT && classes.panelTransparent,
						appService.fapPosition === BKMS_FAP_POSITION.TOP && classes.absolutePanel,
					)}
					elevation={12}
				>
					{bookmarksStore.favorites.length === 0 && (
						<Typography className={classes.emptyTitle}>
							Быстрых закладок еще нет
						</Typography>
					)}
					{bookmarksStore.favorites.map((fav) => (
						fav.type === 'bookmark' ? (
							<Link
								{...fav}
								isBlurBackdrop={appService.fapStyle === BKMS_FAP_STYLE.TRANSPARENT}
							/>
						) : (
							<Folder
								{...fav}
								color={bookmarksStore.getCategory(fav.id)?.color}
								isBlurBackdrop={appService.fapStyle === BKMS_FAP_STYLE.TRANSPARENT}
							/>
						)
					))}
				</Card>
			</div>
		</Fade>
	);
}

export default observer(FAP);
