import React from 'preact/compat';
import { h, Fragment } from 'preact';
import {
	Card,
	Avatar,
	Typography,
	CardActionArea,
	Tooltip,
	Box,
	IconButton,
} from '@material-ui/core';
import {
	LinkRounded as LinkIcon
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import EditMenu from './EditMenu';

const useStyles = makeStyles((theme) => ({
	root: {
		width: 180,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		position: 'relative',
		'&:hover $menuIcon': {
			opacity: 1,
			pointerEvents: 'auto',
		},
	},
	rootActionWrapper: {
		width: '100%',
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'stretch',
		justifyContent: 'flex-end',
	},
	icon: { margin: 'auto' },
	body: {
		width: '100%',
		padding: theme.spacing(1, 2),
		paddingTop: 0,
		boxSizing: 'border-box',
	},
	categoriesWrapper: {
		display: 'flex',
		flexWrap: 'wrap',
		marginBottom: theme.spacing(0.5),
	},
	category: {
		width: theme.spacing(1),
		height: theme.spacing(1),
		borderRadius: theme.spacing(0.5),
		marginRight: theme.spacing(0.6),
	},
	title: {
		display: '-webkit-box',
		'-webkit-box-orient': 'vertical',
		'-webkit-line-clamp': 2,
		overflow: 'hidden',
		lineHeight: 1.2,
		wordBreak: 'break-word',
	},
	banner: {
		width: '100%',
		height: 64,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	extendBanner: {
		width: '100%',
		height: 90,
		backgroundColor: theme.palette.grey[300],
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: theme.spacing(1),
	},
	description: {
		color: theme.palette.text.secondary,
		display: '-webkit-box',
		'-webkit-box-orient': 'vertical',
		'-webkit-line-clamp': 4,
		overflow: 'hidden',
		marginTop: theme.spacing(0.6),
		wordBreak: 'break-word',
	},
	menuIcon: {
		position: 'absolute',
		right: theme.spacing(0.5),
		top: theme.spacing(0.5),
		opacity: 0,
		pointerEvents: 'none',
	},
}));

function CardLink(props) {
	const {
		id,
		name,
		src,
		icon,
		categories,
		type,
		description,
		...other
	} = props;
	const classes = useStyles();

	return (
		<Tooltip
			title={(
				<Fragment>
					{name}
					<br />
					<Typography variant="caption">{src}</Typography>
				</Fragment>
			)}
			enterDelay={400}
			enterNextDelay={400}
		>
			<Card className={classes.root} variant="outlined" {...other}>
				<CardActionArea className={classes.rootActionWrapper}>
					<Box className={type === 'extend' ? classes.extendBanner : classes.banner}>
						<Avatar className={classes.icon}>
							<LinkIcon />
						</Avatar>
					</Box>
					<div className={classes.body}>
						<div className={classes.categoriesWrapper}>
							{categories && categories.map(({ name, color, id }) => (
								<Tooltip key={id} title={name}>
									<div className={classes.category} style={{ backgroundColor: color }} />
								</Tooltip>
							))}
						</div>
						<Typography className={classes.title}>{name}</Typography>
						{description && (
							<Typography variant="body2" className={classes.description}>{description}</Typography>
						)}
					</div>
				</CardActionArea>
				<EditMenu
					className={classes.menuIcon}
					bookmarkId={id}
				/>
			</Card>
		</Tooltip>
	);
}

export default CardLink;
