import React from "react";

import { Avatar, CardHeader, makeStyles } from "@material-ui/core";

import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
	cardHeader: {
		cursor: "pointer"
	}
}));

const TicketInfo = ({ contact, ticket, onClick }) => {
	const classes = useStyles();
	return (
		<CardHeader
			onClick={onClick}
			className={classes.cardHeader}
			titleTypographyProps={{ noWrap: true }}
			subheaderTypographyProps={{ noWrap: true }}
			avatar={<Avatar src={contact.profilePicUrl} alt="contact_image" />}
			title={`${contact.name} #${ticket.id}`}
			subheader={
				ticket.user &&
				`${i18n.t("messagesList.header.assignedTo")} ${ticket.user.name} 
				${ticket.queue ? ' | Setor: ' + ticket.queue.name : ' | Setor: Nenhum'}`
			}
		/>
	);
};

export default TicketInfo;