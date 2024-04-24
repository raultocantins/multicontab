import { Chip, Paper, TextField, makeStyles } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import React, { useEffect, useState } from "react";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const useStyles = makeStyles(theme => ({
    paper: {
        padding: 10
    },
    chip: {
        textShadow: '1px 1px 1px #000',
        color: 'white'
    }
}));

export function TagsFilter({ onFiltered }) {
    const classes = useStyles();
    const [tags, setTags] = useState([]);
    const [selecteds, setSelecteds] = useState([]);

    useEffect(() => {
        async function fetchData() {
            await loadTags();
        }
        fetchData();
    }, []);

    const loadTags = async () => {
        try {
            const { data } = await api.get(`/tags/list`);
            setTags(data);
        } catch (err) {
            toastError(err);
        }
    }

    const onChange = async (value) => {
        setSelecteds(value);
        onFiltered(value);
    }

    return (
        <Paper className={classes.paper}>
            <Autocomplete
                multiple
                size="small"
                options={tags}
                value={selecteds}
                onChange={(e, v, r) => onChange(v)}
                getOptionLabel={(option) => option.name}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip
                            variant="outlined"
                            style={{ backgroundColor: option.color || '#eee' }}
                            className={classes.chip}
                            label={option.name}
                            {...getTagProps({ index })}
                            size="small"
                        />
                    ))
                }
                renderInput={(params) => (
                    <TextField {...params} variant="outlined" placeholder="Filtro por Tags" />
                )}
            />
        </Paper>
    )
}