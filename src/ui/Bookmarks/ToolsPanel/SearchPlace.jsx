import React from 'react';
import { Box, FormControlLabel, Checkbox } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    label: {
        fontFamily: theme.typography.primaryFontFamily,
        fontSize: '1.095rem',
        fontWeight: 800,
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
                classes={{ label: classes.label }}
            />
        </Box>
    );
}

export default SearchPlace;
