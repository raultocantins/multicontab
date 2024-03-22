import { Op, Filterable, Includeable } from "sequelize";
import { startOfDay, endOfDay, parseISO } from "date-fns";

import Ticket from "../../models/Ticket";
import Queue from "../../models/Queue";
import User from "../../models/User";

interface Request {
  dateRange?: string[];
  queueId?: string;
}

interface Response {
  tickets: Ticket[];
}

const ListTicketsDashService = async ({
  queueId,
  dateRange
}: Request): Promise<Response> => {
  let whereCondition: Filterable["where"];
  if (queueId !== "") {
    whereCondition = {
      queueId
    };
  }
  let includeCondition: Includeable[];
  includeCondition = [
    // {
    //   model: Contact,
    //   as: "contact",
    //   attributes: ["id", "name", "number", "profilePicUrl"]
    //   // include: ["extraInfo", "contactTags", "tags"]
    // },USAR PARA GRAFICOS DE TAGS E CONTATOS NO FUTURO
    {
      model: User,
      as: "user",
      attributes: ["id", "name"]
    },
    {
      model: Queue,
      as: "queue",
      attributes: ["id", "name", "color"]
    }
  ];

  if (dateRange) {
    whereCondition = {
      ...whereCondition,
      createdAt: {
        [Op.between]: [
          +startOfDay(parseISO(dateRange[0])),
          +endOfDay(parseISO(dateRange[1]))
        ]
      }
    };
  }

  whereCondition = {
    ...whereCondition,
    isGroup: { [Op.is]: false }
  };

  const { rows: tickets } = await Ticket.findAndCountAll({
    where: whereCondition,
    include: includeCondition,
    attributes: ["id", "status", "createdAt", "updatedAt"]
  });

  return {
    tickets
  };
};

export default ListTicketsDashService;
