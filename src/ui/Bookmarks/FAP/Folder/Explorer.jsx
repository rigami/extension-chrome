import React, { useState } from 'preact/compat';
import { h } from 'preact';
import {
	Card,
	CardHeader,
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
import { fade } from '@material-ui/core/styles/colorManipulator';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
	root: {
		width: 310,
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(2),
		backdropFilter: 'blur(15px) brightness(130%)',
		backgroundColor: fade(theme.palette.background.default, 0.70),
	},
}));

function Folder ({ id }) {
	const classes = useStyles();

	return (
		<Card className={classes.root} elevation={16}>
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
	);
}

export default Folder;
