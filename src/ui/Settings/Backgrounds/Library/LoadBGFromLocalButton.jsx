import React, {useEffect, useState} from "preact/compat";
import {h, Component, render, Fragment} from "preact";
import {inject, observer} from "mobx-react";

import {useSnackbar} from "notistack";
import {
    Button,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    IconButton,
    CircularProgress, Tooltip,

} from "@material-ui/core";
import {
    Add as UploadFromComputerIcon,
    CloseRounded as DeleteIcon,
    WarningRounded as WarningIcon,
    CheckRounded as SuccessIcon,
} from "@material-ui/icons";
import Modal from "ui-components/Modal";
import {makeStyles, useTheme} from "@material-ui/core/styles";
import locale from "i18n/RU";
import { ERRORS as BG_UPLOAD_ERRORS } from "stores/backgrounds";

const useStyles = makeStyles((theme) => ({
    input: {
        display: 'none',
    },
}));

function BGRow({name, getPreview, size, type, onRemove, onDone, isQueue}) {
    const classes = useStyles();
    const theme = useTheme();

    const [state, setState] = useState("pending");

    useEffect(() => {
        if (!isQueue) {
            getPreview()
                .then((previewFile) => {
                    console.log(previewFile);
                    setState("done");
                    onDone();
                })
                .catch((e) => {
                    setState("failed");
                });
        }
    }, [isQueue]);

    return (
        <TableRow key={name}>
            <TableCell scope="row">
                {state === "pending" && (
                    <CircularProgress/>
                )}
                {state === "done" && (
                    <SuccessIcon color='primary'/>
                )}
                {state === "failed" && (
                    <WarningIcon style={{color: theme.palette.warning.main}} />
                )}
            </TableCell>
            <TableCell component="th" scope="row">
                {name}
            </TableCell>
            <TableCell align="right">{Math.round(size)}</TableCell>
            <TableCell align="right">{type.map(t => locale.global.bg_type[t]).join("/")}</TableCell>
            <TableCell align="right">
                <Tooltip title="Не загружать этот фон">
                    <IconButton edge="end" color="error" onClick={onRemove}>
                        <DeleteIcon/>
                    </IconButton>
                </Tooltip>
            </TableCell>
        </TableRow>
    );
}

function LoadBGFromLocalButton({backgroundsStore}) {
    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar();

    const [isOpenModal, setIsOpenModal] = useState(false);
    const [bgs, setBgs] = useState([]);
    const [done, setDone] = useState([]);
    const [inProcess, setInProcess] = useState(null);

    console.log("ARRAYS", bgs, done)

    return (
        <Fragment>
            <input
                className={classes.input}
                id="upload-from-system"
                multiple
                type="file"
                accept="video/*,image/*"
                onChange={(event) => {
                    if (event.srcElement.files.length === 0) return;

                    console.log("LOAD FILES")

                    backgroundsStore.loadBGsToLocalCatalog(event.srcElement.files)
                        .then((bgs) => {
                            setBgs([...bgs]);
                            setInProcess(bgs[0].id);
                            setIsOpenModal(true);
                        })
                        .catch((e) => enqueueSnackbar({
                            ...locale.settings.backgrounds.general.library[e],
                            variant: 'error'
                        }))
                        .finally(() => {
                            event.srcElement.files = null;
                        })
                }}
            />
            <label htmlFor="upload-from-system">
                <Button
                    variant="contained"
                    component="span"
                    disableElevation
                    color="primary"
                    startIcon={<UploadFromComputerIcon/>}
                    style={{marginRight: 16}}
                >
                    {locale.settings.backgrounds.general.library.upload_from_computer}
                </Button>
            </label>
            <Modal
                key="modal-upload-files"
                open={isOpenModal}
                title={locale.settings.backgrounds.general.library.upload_from_computer_confirm}
                onClose={() => setIsOpenModal(false)}
                buttons={[
                    {
                        title: locale.global.cancel,
                        onClick: () => setIsOpenModal(false),
                    },
                    {
                        title: "Загрузить фоны",
                        color: "primary",
                        disabled: bgs.length !== done.length,
                        onClick: () => {

                        },
                    },
                ]}
                denseBody
                fullWidth
                maxWidth="md"
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Первью</TableCell>
                            <TableCell>Имя файла</TableCell>
                            <TableCell align="right">Размер (МБ)</TableCell>
                            <TableCell align="right">Тип</TableCell>
                            <TableCell align="right">Убрать фон</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bgs.length !== 0 && bgs.map((row, index) => (
                            <BGRow
                                key={row.id}
                                {...row}
                                isQueue={inProcess !== row.id}
                                onRemove={() => {
                                    if (bgs.length === 1) {
                                        console.log("ERRR EMPTY")
                                        setBgs([]);
                                        setDone([]);
                                        setIsOpenModal(false);
                                        enqueueSnackbar({
                                            ...locale.settings.backgrounds.general.library[BG_UPLOAD_ERRORS.NO_FILES],
                                            variant: 'error'
                                        });
                                        return;
                                    }

                                    if (inProcess === row.id) {
                                        setInProcess(bgs[index + 1] && bgs[index + 1].id);
                                    }
                                    setBgs(bgs.filter(({ id }) => row.id !== id));
                                    setDone(done.filter((id) => row.id !== id));
                                }}
                                onDone={() => {
                                    setInProcess(bgs[index + 1] && bgs[index + 1].id);
                                    setDone(oldValues => [...oldValues, row.id]);
                                }}
                            />
                        ))}
                    </TableBody>
                </Table>
            </Modal>
        </Fragment>
    );
}

export default inject('backgroundsStore')(observer(LoadBGFromLocalButton));