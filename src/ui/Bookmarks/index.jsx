import React, { useEffect } from 'preact/compat';
import { h, Fragment } from 'preact';
import {
	Box,
	Drawer,
	Container,
	Card,
	Avatar,
	Typography,
	ListItem,
	ListItemText,
	ListItemIcon,
	Chip,
	CardActionArea,
	Tooltip,
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import {
	LinkRounded as LinkIcon,
	LabelRounded as LabelIcon,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
	root: {
		height: '100vh',
		overflow: 'auto',
	},
	categoryWrapper: {
		display: 'flex',
		flexWrap: 'wrap',
	},
	cardLink: {
		width: 180,
		height: 110,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		marginRight: theme.spacing(2),
		marginBottom: theme.spacing(2),
	},
	cardLinkIcon: {
		margin: 'auto',
	},
	cardLinkDescription: {
		width: '100%',
		padding: theme.spacing(0.5),
		paddingTop: 0,
	},
	cardLinkCategories: {
		display: 'flex',
		flexWrap: 'wrap',
	},
	cardLinkCategory: {
		width: theme.spacing(1),
		height: theme.spacing(1),
		borderRadius: theme.spacing(0.5),
		marginRight: theme.spacing(0.6),
	},
	cardAction: {
		width: '100%',
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'stretch',
	},
	chipContainer: {
		display: 'flex',
		flexWrap: 'wrap',
		'& > *': {
			marginRight: theme.spacing(1),
			marginBottom: theme.spacing(1),
		},
	},
	container: {
		paddingTop: theme.spacing(2),
	},
}));

function CardLink({ title, src, icon, categories }) {
	const classes = useStyles();

	return (
		<Tooltip
			title={(
				<Fragment>
					{title}
					<br/>
					<Typography variant='caption'>{src}</Typography>
				</Fragment>
			)}
			enterDelay={400}
		>
			<Card className={classes.cardLink} variant="outlined">
				<CardActionArea className={classes.cardAction}>
					<Avatar className={classes.cardLinkIcon}>
						<LinkIcon />
					</Avatar>
					<div className={classes.cardLinkDescription}>
						<div className={classes.cardLinkCategories}>
							{categories.map(({ title, color, id }) => (
								<div key={id} className={classes.cardLinkCategory} style={{ backgroundColor: color }} />
							))}
						</div>
						<Typography>{title}</Typography>
					</div>
				</CardActionArea>
			</Card>
		</Tooltip>
	);
}

function Bookmarks() {
	const classes = useStyles();

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
						{[].concat(...Array.from({ length: 15 }, (elem, index) => ({
							label: `Category #${index + 1}`,
						}))).map(({ label }) => (
							<Chip label={label} onClick={() => {}} />
						))}
					</Box>
					<ListItem disableGutters>
						<ListItemIcon style={{ minWidth: 36 }} >
							<LabelIcon style={{ color: "#EB4799" }} />
						</ListItemIcon>
						<ListItemText primary="Category #1" secondary="Description category #1" />
					</ListItem>
					<Box className={classes.categoryWrapper}>
						{[].concat(...Array.from({ length: 23 }, () => ({
							title: "Пример ссылки",
							src: "https://website.com",
							icon: null,
							categories: [
								{ id: "id#1", title: "Category #1", color: "#EB4799"},
								{ id: "id#2", title: "Category #2", color: "#FF8800"},
								{ id: "id#3", title: "Category #3", color: "#FFC933"},
							]
						}))).map((card) => (
							<CardLink {...card} />
						))}
					</Box>
					<ListItem disableGutters>
						<ListItemIcon style={{ minWidth: 36 }} >
							<LabelIcon style={{ color: "#FF8800" }} />
						</ListItemIcon>
						<ListItemText primary="Category #2" secondary="Description category #2" />
					</ListItem>
					<Box className={classes.categoryWrapper}>
						{[].concat(...Array.from({ length: 3 }, () => ({
							title: "Пример ссылки",
							src: "https://website.com",
							icon: null,
							categories: [
								{ id: "id#1", title: "Category #1", color: "#EB4799"},
								{ id: "id#2", title: "Category #2", color: "#FF8800"},
								{ id: "id#3", title: "Category #3", color: "#FFC933"},
							]
						}))).map((card) => (
							<CardLink {...card} />
						))}
					</Box>
				</Container>
			</Box>
		</Drawer>
	);
}

export default observer(Bookmarks);
