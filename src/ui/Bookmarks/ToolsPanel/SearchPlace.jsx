import React from 'react';
import { Box, FormControlLabel, Checkbox } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: { marginRight: 0 },
    label: {
        fontFamily: theme.typography.primaryFontFamily,
        fontSize: '1rem',
        fontWeight: 700,
    },
}));

function SearchPlace({ onResearch }) {
    const classes = useStyles();

    return (
        <Box ml={4}>
            <FormControlLabel
                control={(
                    <Checkbox
                        color="primary"
                    />
                )}
                onChange={(event, value) => onResearch({ searchEverywhere: value })}
                label="Search everywhere"
                classes={{
                    label: classes.label,
                    root: classes.root,
                }}
            />
        </Box>
    );
}

export default SearchPlace;
