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
import { BKMS_FAP_POSITION, BKMS_FAP_STYLE } from '@/dict'

const useStyles = makeStyles((theme) => ({
	root: {
		padding: theme.spacing(3),
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
	iconBlur: {
		backdropFilter: 'blur(10px) brightness(130%)',
	},
	activeIconButton: {
		backgroundColor: theme.palette.common.white,
		'&:hover': { backgroundColor: theme.palette.common.white },
	},
	popperWrapper: {
		zIndex: theme.zIndex.drawer,
		willChange: 'auto !important',
	},
	popper: {
		width: 310,
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(2),
		backdropFilter: 'blur(15px) brightness(130%)',
		backgroundColor: fade(theme.palette.background.default, 0.70),
	},
}));

function FolderButton ({ className: externalClassName }) {
	const classes = useStyles();

	const [anchorEl, setAnchorEl] = useState(null);
	const [isOpen, setIsOpen] = useState(false);
	const [isBlockEvent, setIsBlockEvent] = useState(false);

	return (
		<Fragment>
			<ClickAwayListener
				onClickAway={() => {
					if (isBlockEvent) return;

					setIsOpen(false);
				}}
				mouseEvent="onMouseDown"
			>
				<Popper
					open={isOpen} anchorEl={anchorEl} placement="top"
					className={classes.popperWrapper}>
					<Card className={classes.popper} elevation={16}>
						<CardHeader title="Папка" />
						{/* <CardContent>
							<Typography variant="body2" color="textSecondary" component="p">
								Папка пуста
							</Typography>
						</CardContent> */}
						<List disablePadding>
							<ListItem divider button>
								<ListItemAvatar>
									<Avatar>
										<LinkIcon />
									</Avatar>
								</ListItemAvatar>
								<ListItemText primary="Ссылка 1" />
							</ListItem>
							<ListItem divider button>
								<ListItemAvatar>
									<Avatar>
										<LinkIcon />
									</Avatar>
								</ListItemAvatar>
								<ListItemText primary="Ссылка 2" />
							</ListItem>
							<ListItem divider button>
								<ListItemAvatar>
									<Avatar>
										<LinkIcon />
									</Avatar>
								</ListItemAvatar>
								<ListItemText primary="Ссылка 3" />
							</ListItem>
							<ListItem button>
								<ListItemAvatar>
									<Avatar>
										<LinkIcon />
									</Avatar>
								</ListItemAvatar>
								<ListItemText primary="Ссылка 4" />
							</ListItem>
						</List>
					</Card>
				</Popper>
			</ClickAwayListener>
			<IconButton
				id="folder-button"
				ref={anchorEl}
				className={clsx(classes.iconButton, isOpen && classes.activeIconButton, externalClassName)}
				onMouseDown={() => {
					if (!isOpen) setIsBlockEvent(true);
				}}
				onClick={(event) => {
					setAnchorEl(event.currentTarget);
					if (isBlockEvent) setIsOpen(true);
					setIsBlockEvent(false);
				}}
			>
				<FolderIcon />
			</IconButton>
		</Fragment>
	);
}

function LinkButton ({ className: externalClassName }) {
	const classes = useStyles();

	return (
		<IconButton
			className={clsx(classes.iconButton, externalClassName)}
		>
			<LinkIcon />
		</IconButton>
	);
}

function FAP() {
	const classes = useStyles();
	const theme = useTheme();
	const appService = useBookmarksService();

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
					<LinkButton className={appService.fapStyle === BKMS_FAP_STYLE.TRANSPARENT && classes.iconBlur} />
					<LinkButton className={appService.fapStyle === BKMS_FAP_STYLE.TRANSPARENT && classes.iconBlur} />
					<FolderButton className={appService.fapStyle === BKMS_FAP_STYLE.TRANSPARENT && classes.iconBlur} />
					<LinkButton className={appService.fapStyle === BKMS_FAP_STYLE.TRANSPARENT && classes.iconBlur} />
				</Card>
			</div>
		</Fade>
	);
}

export default observer(FAP);
