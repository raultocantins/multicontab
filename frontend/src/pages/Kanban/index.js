import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import Board from "react-trello";
import { differenceInMinutes } from "date-fns";
// import Title from "../../components/Title";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignContent: "flex-start",
    width: "100%",
    height: "100vh",
    padding: theme.spacing(2),
  },
  button: {
    background: "#10a110",
    border: "none",
    padding: "10px",
    color: "white",
    fontWeight: "bold",
    borderRadius: "5px",
  },
}));

const Kanban = () => {
  const classes = useStyles();
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);

  // eslint-disable-next-line
  const fetchTickets = async () => {
    try {
      const { data } = await api.get("/kanban");
      setTickets(data.tickets);
      setUsers(data.users);
    } catch (err) {
      console.log(err);
      setTickets([]);
    }
  };
  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchTickets();
    }, 60000); //atualizando em 1 minuto
    return () => {
      clearInterval(interval);
    };
  }, [fetchTickets]);

  const timeSinceCreation = (createdAt) => {
    const now = new Date();
    const createdDate = new Date(createdAt);
    const minutesDifference = differenceInMinutes(now, createdDate);
    return `${minutesDifference} minutos`;
  };
  const statusTranslation = {
    pending: "Pendente",
    open: "Aberto",
  };
  const statusOrder = ["open", "pending"];

  const conversationsByStatus = tickets.reduce((acc, conversation) => {
    const { status } = conversation;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(conversation);
    return acc;
  }, {});
  const usersColumn = {
    id: "users",
    title: "Usuários",
    cards: users.map((user) => ({
      id: user.id,
      draggable: false,
      title: user.name,
      description: `Status do atendente: ${user.status}`, // alterar para status depois
    })),
  };
  const columns = statusOrder.map((status) => ({
    id: status,
    title: statusTranslation[status] || status,

    cards: (conversationsByStatus[status] || []).map((conversation) => ({
      id: conversation.id,
      draggable: false,

      title: conversation.contact.name,
      description: `Tempo de atendimento: ${timeSinceCreation(
        conversation.createdAt
      )}`,
    })),
  }));

  return (
    <div className={classes.root}>
      {/* <Title>Horário de atualização</Title> */}
      <Board
        data={{ lanes: [...columns, usersColumn] }}
        hideCardDeleteIcon={true}
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "rgba(252, 252, 252, 0.03)",
        }}
        laneStyle={{ minWidth: "0", flex: "1" }}
      />
    </div>
  );
};

export default Kanban;
