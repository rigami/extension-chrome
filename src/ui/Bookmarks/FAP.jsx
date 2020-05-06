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
} from '@material-ui/core';
import {
	FolderRounded as FolderIcon,
	LinkRounded as LinkIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { fade } from '@material-ui/core/styles/colorManipulator';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
	root: {
		position: 'absolute',
		bottom: theme.spacing(2),
		paddingLeft: theme.spacing(2),
		paddingRight: theme.spacing(2),
		width: '100%',
		zIndex: theme.zIndex.speedDial,
		display: 'flex',
		pointerEvents: 'none',
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
	iconButton: {
		marginRight: theme.spacing(1),
		padding: theme.spacing(1),
		backgroundColor: fade(theme.palette.common.white, 0.32),
		'&:hover': { backgroundColor: fade(theme.palette.common.white, 0.52) },
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
		marginBottom: theme.spacing(2),
		backdropFilter: 'blur(15px) brightness(130%)',
		backgroundColor: fade(theme.palette.background.default, 0.70),
	},
}));

function FolderButton ({}) {
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
				className={clsx(classes.iconButton, isOpen && classes.activeIconButton)}
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

function LinkButton ({}) {
	const classes = useStyles();

	return (
		<IconButton
			className={classes.iconButton}
		>
			<LinkIcon />
		</IconButton>
	);
}

function FAP() {
	const classes = useStyles();

	return (
		<div className={classes.root} >
			<Card
				className={classes.panel}
				elevation={12}
			>
				<LinkButton />
				<LinkButton />
				<FolderButton />
				<LinkButton />
			</Card>
		</div>
	);
}

export default observer(FAP);
