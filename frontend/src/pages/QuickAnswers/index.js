import React, { useState, useEffect, useReducer } from "react";
import openSocket from "../../services/socket-io";
import { useHistory } from "react-router-dom";

import {
  Button,
  IconButton,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  InputAdornment,
  TextField,
  Tooltip,
} from "@material-ui/core";
import {
  AddCircleOutline,
  DeleteForever,
  DeleteOutline,
  Edit,
  Search,
} from "@material-ui/icons";

import api from "../../services/api";
import { i18n } from "../../translate/i18n";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import QuickAnswersModal from "../../components/QuickAnswersModal";
import ConfirmationModal from "../../components/ConfirmationModal";

import toastError from "../../errors/toastError";
import ToastSuccess from "../../components/ToastSuccess";

const reducer = (state, action) => {
  if (action.type === "LOAD_QUICK_ANSWERS") {
    const quickAnswers = action.payload;
    const newQuickAnswers = [];

    quickAnswers.forEach((quickAnswer) => {
      const quickAnswerIndex = state.findIndex((q) => q.id === quickAnswer.id);
      if (quickAnswerIndex !== -1) {
        state[quickAnswerIndex] = quickAnswer;
      } else {
        newQuickAnswers.push(quickAnswer);
      }
    });

    return [...state, ...newQuickAnswers];
  }

  if (action.type === "UPDATE_QUICK_ANSWERS") {
    const quickAnswer = action.payload;
    const quickAnswerIndex = state.findIndex((q) => q.id === quickAnswer.id);

    if (quickAnswerIndex !== -1) {
      state[quickAnswerIndex] = quickAnswer;
      return [...state];
    } else {
      return [quickAnswer, ...state];
    }
  }

  if (action.type === "DELETE_QUICK_ANSWERS") {
    const quickAnswerId = action.payload;

    const quickAnswerIndex = state.findIndex((q) => q.id === quickAnswerId);
    if (quickAnswerIndex !== -1) {
      state.splice(quickAnswerIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  title: {
    padding: theme.spacing(2),
  },
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    margin: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const QuickAnswers = () => {
  const classes = useStyles();
  const history = useHistory();

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [quickAnswers, dispatch] = useReducer(reducer, []);
  const [selectedQuickAnswers, setSelectedQuickAnswers] = useState(null);
  const [quickAnswersModalOpen, setQuickAnswersModalOpen] = useState(false);
  const [deletingQuickAnswers, setDeletingQuickAnswers] = useState(null);
  const [deletingAllQuickAnswers, setDeletingAllQuickAnswers] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchQuickAnswers = async () => {
        try {
          const { data } = await api.get("/quickAnswers/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_QUICK_ANSWERS", payload: data.quickAnswers });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchQuickAnswers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const socket = openSocket();

    socket.on("quickAnswer", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_QUICK_ANSWERS", payload: data.quickAnswer });
      }

      if (data.action === "delete") {
        dispatch({
          type: "DELETE_QUICK_ANSWERS",
          payload: +data.quickAnswerId,
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenQuickAnswersModal = () => {
    setSelectedQuickAnswers(null);
    setQuickAnswersModalOpen(true);
  };

  const handleCloseQuickAnswersModal = () => {
    setSelectedQuickAnswers(null);
    setQuickAnswersModalOpen(false);
  };

  const handleEditQuickAnswers = (quickAnswer) => {
    setSelectedQuickAnswers(quickAnswer);
    setQuickAnswersModalOpen(true);
  };

  const handleDeleteQuickAnswers = async (quickAnswerId) => {
    try {
      await api.delete(`/quickAnswers/${quickAnswerId}`);
      ToastSuccess(i18n.t("quickAnswers.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingQuickAnswers(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleDeleteAllQuickAnswers = async () => {
    try {
      await api.delete("/quickAnswers");
      ToastSuccess(i18n.t("quickAnswers.toasts.deletedAll"));
      history.go(0);
    } catch (err) {
      toastError(err);
    }
    setDeletingAllQuickAnswers(null);
    setSearchParam("");
    setPageNumber();
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          deletingQuickAnswers
            ? `${i18n.t("quickAnswers.confirmationModal.deleteTitle")} ${
                deletingQuickAnswers.shortcut
              }?`
            : `${i18n.t("quickAnswers.confirmationModal.deleteAllTitle")}`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() =>
          deletingQuickAnswers
            ? handleDeleteQuickAnswers(deletingQuickAnswers.id)
            : handleDeleteAllQuickAnswers(deletingAllQuickAnswers)
        }
      >
        {deletingQuickAnswers
          ? `${i18n.t("quickAnswers.confirmationModal.deleteMessage")}`
          : `${i18n.t("quickAnswers.confirmationModal.deleteAllMessage")}`}
      </ConfirmationModal>
      <QuickAnswersModal
        open={quickAnswersModalOpen}
        onClose={handleCloseQuickAnswersModal}
        aria-labelledby="form-dialog-title"
        quickAnswerId={selectedQuickAnswers && selectedQuickAnswers.id}
      ></QuickAnswersModal>
      <MainHeader>
        <div className={classes.title}>
          <Title>{i18n.t("quickAnswers.title")}</Title>
        </div>

        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("quickAnswers.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="secondary" />
                </InputAdornment>
              ),
            }}
          />
          <Tooltip title={i18n.t("quickAnswers.buttons.add")}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenQuickAnswersModal}
            >
              <AddCircleOutline />
            </Button>
          </Tooltip>
          <Tooltip title={i18n.t("quickAnswers.buttons.deleteAll")}>
            <Button
              variant="contained"
              color="primary"
              onClick={(e) => {
                setConfirmModalOpen(true);
                setDeletingAllQuickAnswers(quickAnswers);
              }}
            >
              <DeleteForever />
            </Button>
          </Tooltip>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <div
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                {i18n.t("quickAnswers.table.shortcut")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("quickAnswers.table.message")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("quickAnswers.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {quickAnswers.map((quickAnswer) => (
                <TableRow key={quickAnswer.id}>
                  <TableCell align="center">{quickAnswer.shortcut}</TableCell>
                  <TableCell align="center">{quickAnswer.message}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditQuickAnswers(quickAnswer)}
                    >
                      <Edit color="secondary" />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setConfirmModalOpen(true);
                        setDeletingQuickAnswers(quickAnswer);
                      }}
                    >
                      <DeleteOutline color="secondary" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={3} />}
            </>
          </TableBody>
        </Table>
      </div>
    </MainContainer>
  );
};

export default QuickAnswers;
