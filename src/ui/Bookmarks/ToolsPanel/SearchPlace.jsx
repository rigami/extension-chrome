import React from 'react';
import {
    Box,
    FormControlLabel,
    Checkbox,
    Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
    root: { marginRight: 0 },
    label: {
        fontFamily: theme.typography.primaryFontFamily,
        fontSize: '1rem',
        fontWeight: 700,
    },
}));

function SearchPlace({ searchService: service }) {
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);

    return (
        <Box ml={4}>
            <Tooltip
                title={t('search.everywhere', { context: 'description' })}
                enterDelay={400}
                enterNextDelay={400}
            >
                <FormControlLabel
                    control={(
                        <Checkbox
                            color="primary"
                        />
                    )}
                    checked={service.searchEverywhere}
                    onChange={(event, value) => service.updateRequest({ searchEverywhere: value })}
                    label={t('search.everywhere')}
                    classes={{
                        label: classes.label,
                        root: classes.root,
                    }}
                />
            </Tooltip>
        </Box>
    );
}

export default observer(SearchPlace);
