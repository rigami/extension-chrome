import React, { useEffect, useState } from 'preact/compat';
import { h } from 'preact';
import {
	Box,
	Chip,
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import clsx from 'clsx';
import CreateCategoryButton from './CreateCategoryButton';

const useStyles = makeStyles((theme) => ({
	root: {
		display: 'flex',
		flexWrap: 'wrap',
		'& > *': {
			marginRight: theme.spacing(1),
			marginBottom: theme.spacing(1),
		},
	},
	chipIcon: {
		width: theme.spacing(2),
		height: theme.spacing(2),
		borderRadius: '50%',
		marginLeft: `${theme.spacing(1)}px !important`,
	},
}));

function Categories ({ onChange, className: externalClassName, sortByPopular }) {
	const classes = useStyles();
	const bookmarksStore = useBookmarksService();
	const [selectedCategories, setSelectedCategories] = useState([]);

	useEffect(() => {
		onChange(selectedCategories);
	}, [selectedCategories.length]);

	return (
		<Box className={clsx(classes.root, externalClassName)}>
			{
				bookmarksStore.getCategories({})
					.map(({ id, title, color }) => (
						<Chip
							key={id}
							icon={<div className={classes.chipIcon} style={{ backgroundColor: color }} />}
							label={title}
							variant={~selectedCategories.indexOf(id) ? 'default' : 'outlined'}
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
			<CreateCategoryButton />
		</Box>
	);
}

export default observer(Categories);
