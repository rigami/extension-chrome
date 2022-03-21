import { alpha } from '@material-ui/core/styles';

export default (theme) => ({
    overrides: {
        MuiListSubheader: { root: { fontFamily: theme.typography.specialFontFamily } },
        MuiButtonBase: { root: { fontFamily: theme.typography.specialFontFamily } },
        MuiPaper: { rounded: { borderRadius: theme.shape.borderRadiusBolder } },
        MuiButton: {
            root: {
                fontWeight: 800,
                borderRadius: theme.shape.borderRadiusBolder,
                padding: theme.spacing(1, 2),
                boxShadow: 'none',
            },
            text: { padding: theme.spacing(1, 2) },
            label: {
                fontWeight: 'inherit',
                wordBreak: 'break-word',
                textTransform: 'none',
            },
            contained: {
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' },
                '&:active': { boxShadow: 'none' },
            },
            containedPrimary: {
                color: theme.palette.primary.dark,
                backgroundColor: theme.palette.primary.light,
                '&:hover': {
                    color: theme.palette.common.white,
                    backgroundColor: theme.palette.primary.main,
                    boxShadow: `${alpha(theme.palette.primary.main, 0.4)} 0px 0px 0px 3px`,
                },
            },
        },
        MuiTab: {
            root: {
                textTransform: 'none',
                fontWeight: 800,
                zIndex: 1,
                borderRadius: theme.shape.borderRadiusButtonBold,
                transition: theme.transitions.create(['color'], {
                    duration: theme.transitions.duration.standard,
                    easing: theme.transitions.easing.easeInOut,
                }),
                '&.Mui-selected': { color: theme.palette.primary.dark },
            },
            labelIcon: {
                minHeight: theme.spacing(6),
                paddingTop: theme.spacing(0.75),
                '& .MuiTab-wrapper > *:first-child': { marginBottom: 0 },
            },
            wrapper: {
                flexDirection: 'initial',
                '& .MuiSvgIcon-root': {
                    marginRight: theme.spacing(0.75),
                    marginBottom: 0,
                },
            },
        },
        MuiTypography: { gutterBottom: { marginBottom: '0.8em' } },
        MuiTooltip: {
            tooltip: {
                backgroundColor: alpha('#000', 0.82),
                fontSize: '0.85rem',
                padding: '6px 12px',
            },
        },
        MuiSwitch: {
            thumb: { boxShadow: 'none' },
            switchBase: { color: theme.palette.background.paper },
            track: { borderRadius: 13 },
            root: { padding: 6 },
            colorPrimary: {
                '&.Mui-checked': {
                    color: theme.palette.background.paper,
                    '& + .MuiSwitch-track': {
                        backgroundColor: theme.palette.primary.main,
                        opacity: 1,
                    },
                },
            },
        },
        MuiSlider: {
            root: {
                margin: theme.spacing(0, 1),
                height: theme.spacing(1.5),
            },
            rail: {
                marginLeft: theme.spacing(-0.75),
                width: `calc(100% + ${theme.spacing(1.5)}px)`,
                height: theme.spacing(1.5),
                borderRadius: theme.spacing(0.75),
            },
            track: {
                paddingRight: theme.spacing(1.5),
                height: theme.spacing(1.5),
                borderRadius: theme.spacing(0.75),
                marginLeft: theme.spacing(-0.75),
            },
            thumb: {
                width: theme.spacing(1),
                height: theme.spacing(1),
                marginTop: theme.spacing(0.25),
                marginLeft: theme.spacing(-0.5),
                backgroundColor: theme.palette.background.paper,
            },
            valueLabel: { left: `calc(-50% - ${theme.spacing(1)}px)` },
            mark: {
                transform: 'translateX(-50%)',
                height: theme.spacing(1.5),
                opacity: 0.5,
            },
            markActive: { opacity: 0.3 },
        },
        MuiCardHeader: { title: { fontWeight: 600 } },
        MuiTabs: {
            root: {
                padding: theme.spacing(0.5),
                borderRadius: theme.shape.borderRadiusBolder,
                backgroundColor: theme.palette.background.backdrop,
            },
            indicator: {
                height: '100%',
                borderRadius: theme.shape.borderRadiusButtonBold,
                backgroundColor: theme.palette.background.paper,
            },
        },
        MuiFilledInput: {
            root: {
                borderRadius: theme.shape.borderRadiusButtonBold,
                borderTopLeftRadius: theme.shape.borderRadiusButtonBold,
                borderTopRightRadius: theme.shape.borderRadiusButtonBold,
                '&.Mui-focused': { boxShadow: `${alpha(theme.palette.primary.main, 0.4)} 0px 0px 0px 3px` },
            },
            inputMarginDense: {
                paddingTop: theme.spacing(1.25),
                paddingBottom: theme.spacing(1.25),
            },
            underline: {
                '&:before': {
                    borderBottom: 'none',
                    content: '',
                },
                '&:after': {
                    borderBottom: 'none',
                    content: '',
                },
            },
        },
        MuiSelect: { selectMenu: { textAlign: 'center' } },
        MuiInputBase: { root: { fontSize: '0.85rem' } },
    },
    props: {
        // MuiButton: { disableElevation: true },
        // MuiCardHeader: { titleTypographyProps: { variant: 'h6' } },
    },
});
