import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    ImageListItem, ImageList, ButtonBase, Tooltip, Button, Box,
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { CheckRounded as SetIcon } from '@material-ui/icons';
import colorsLibrary from '@/config/colors';
import { eventToBackground } from '@/stores/universal/serviceBus';
import { useCoreService } from '@/stores/app/core';

const useStyles = makeStyles((theme) => ({
    variant: {
        width: '100%',
        height: '100%',
        borderRadius: theme.shape.borderRadiusBolder,
        boxShadow: `inset ${theme.palette.divider} 0 0 0 1px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(2),
        fontSize: theme.typography.h6.fontSize,
        fontWeight: 700,
        textAlign: 'center',
        overflow: 'hidden',
        position: 'relative',
        '&:hover': { '& $setIcon': { opacity: 1 } },
    },
    grid: {
        width: '100%',
        padding: theme.spacing(2),
        margin: '0 !important',
    },
    selectIcon: {
        backgroundColor: theme.palette.common.white,
        color: theme.palette.common.black,
        position: 'absolute',
        left: theme.spacing(0.75),
        top: theme.spacing(0.75),
        borderRadius: theme.spacing(1),
    },
    setIcon: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        '& svg': {
            width: 36,
            height: 36,
        },
        opacity: 0,
        borderRadius: 'inherit',
        boxShadow: 'inherit',
        background: 'inherit',
        transition: theme.transitions.create(['opacity'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.shortest,
        }),
    },
}));

const headerProps = { title: 'settingsQuietMode:gradient.additional' };
const pageProps = { width: 960 };

export function ColorPreview(props) {
    const {
        name,
        angle,
        colors,
        contrastColor,
        select,
        onSet,
    } = props;
    const classes = useStyles();
    const { t } = useTranslation(['background']);

    const colorPropName = colors.length > 1 ? 'backgroundImage' : 'backgroundColor';
    const colorPropValue = colors.length > 1 ? `linear-gradient(${angle || 0}deg, ${colors.join(', ')}` : colors[0];

    return (
        <Box
            className={classes.variant}
            style={{
                [colorPropName]: colorPropValue,
                color: contrastColor,
            }}
        >
            {select && (
                <SetIcon className={classes.selectIcon} />
            )}
            {name}
            {onSet && !select && (
                <Tooltip title={t('button.apply')} placement="top">
                    <ButtonBase
                        data-ui-path="bgCard.apply"
                        className={classes.setIcon}
                        onClick={onSet}
                        style={{ color: contrastColor }}
                    >
                        <SetIcon />
                    </ButtonBase>
                </Tooltip>
            )}
        </Box>
    );
}

function GradientsLibrary({ onClose }) {
    const classes = useStyles();
    const { t } = useTranslation(['settingsQuietMode']);
    const coreService = useCoreService();

    return (
        <React.Fragment>
            <ImageList
                className={classes.grid}
                cellHeight={120}
                cols={3}
                gap={8}
            >
                {colorsLibrary.map((color) => (
                    <ImageListItem key={`${color.angle}-${color.colors.join(', ')}`}>
                        <ColorPreview
                            angle={color.angle}
                            name={color.name}
                            contrastColor={color.contrastColor}
                            colors={color.colors}
                            select={coreService.storage.data.bgCurrent?.id === color.id}
                            onSet={() => {
                                eventToBackground('wallpapers/set', {
                                    kind: 'color',
                                    ...color,
                                });
                            }}
                        />
                    </ImageListItem>
                ))}
            </ImageList>
        </React.Fragment>
    );
}

const ObserverGradientsLibrary = observer(GradientsLibrary);

export { headerProps as header, ObserverGradientsLibrary as content };

export default {
    header: headerProps,
    content: ObserverGradientsLibrary,
    props: pageProps,
};
