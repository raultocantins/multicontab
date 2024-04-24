import React, { useState, useEffect } from "react";
import { makeStyles, useTheme } from "@material-ui/core";

import {
  CartesianGrid,
  XAxis,
  Tooltip,
  AreaChart,
  Area,
  YAxis,
  ResponsiveContainer,
} from "recharts";

import { startOfHour, parseISO, format } from "date-fns";

const useStyles = makeStyles(theme => ({
  customTooltip: {
    backgroundColor: "#333333ff",
    borderRadius: "4px",
    outline: "none",
  },
  payload: {
    display: "inline-block",
    padding: 10
  },
  payloadLabel: {
    color: "white",
    fontWeight: "600",
    fontSize: "13px",
  },
  payloadValue: {
    color: "white",
    fontWeight: "400",
    fontSize: "13px",
  },
  divider: {
    width: "0",
    height: "0",
    borderLeft: "5px solid transparent",
    marginLeft: "35px",
    borderRight: "5px solid transparent",
    borderTop: "5px solid #333333ff",
  }
}));

const TimeChart = ({ tickets }) => {
  const classes = useStyles();
  const theme = useTheme();
  const [chartData, setChartData] = useState([
    { time: "00:00", amount: 0 },
    { time: "01:00", amount: 0 },
    { time: "02:00", amount: 0 },
    { time: "03:00", amount: 0 },
    { time: "04:00", amount: 0 },
    { time: "05:00", amount: 0 },
    { time: "06:00", amount: 0 },
    { time: "07:00", amount: 0 },
    { time: "08:00", amount: 0 },
    { time: "09:00", amount: 0 },
    { time: "10:00", amount: 0 },
    { time: "11:00", amount: 0 },
    { time: "12:00", amount: 0 },
    { time: "13:00", amount: 0 },
    { time: "14:00", amount: 0 },
    { time: "15:00", amount: 0 },
    { time: "16:00", amount: 0 },
    { time: "17:00", amount: 0 },
    { time: "18:00", amount: 0 },
    { time: "19:00", amount: 0 },
    { time: "20:00", amount: 0 },
    { time: "21:00", amount: 0 },
    { time: "22:00", amount: 0 },
    { time: "23:00", amount: 0 },
  ]);

  function CustomTooltip({ payload, label, active }) {
    if (active) {
      return (
        <div>
          <div
            className={classes.customTooltip}
          >
            <div>
              {payload.map((pld) => (
                <div className={classes.payload} key={pld}>
                  <div
                    className={classes.payloadLabel}
                  >{`${label}`}</div>
                  <div
                    className={classes.payloadValue}
                  >
                    Quantidade: {pld.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className={classes.divider}
          ></div>
        </div>
      );
    }
    return null;
  }

  useEffect(() => {
    setChartData((prevState) => {
      let aux = [...prevState];

      aux.forEach((a) => {
        tickets.forEach((ticket) => {
          format(startOfHour(parseISO(ticket.createdAt)), "HH:mm") === a.time &&
            a.amount++;
        });
      });

      return aux;
    });
  }, [tickets]);

  return (
    <React.Fragment>
      <ResponsiveContainer>
        <AreaChart
          data={chartData}
          barSize={40}
          width={730}
          height={250}
          margin={{
            top: 16,
            right: 16,
            bottom: 0,
            left: 0,
          }}
        >
          <XAxis
            tick={(tickProps) => {
              const { x, y } = tickProps;
              return (
                <circle
                  cx={x}
                  cy={y - 8}
                  r={1}
                  fill={theme.palette.text.secondary}
                />
              );
            }}
            tickLine={false}
            axisLine={false}
            dataKey="time"
            stroke={theme.palette.text.secondary}
          />
          <YAxis
            type="number"
            allowDecimals={false}
            stroke={theme.palette.text.secondary}
            tickLine={false}
            axisLine={false}
          ></YAxis>
          <CartesianGrid vertical={false} strokeDasharray="4" opacity={0.3} />
          <Tooltip
            content={<CustomTooltip />}
            position={{ y: 35 }}
            animationEasing="ease"
            cursor={true}
            shared={false}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke={theme.palette.primary.main}
            strokeDasharray="3 4 5 2"
            strokeWidth={0.1}
            fillOpacity={0.7}
            fill={theme.palette.primary.main}
            activeDot={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </React.Fragment>
  );
};

export default TimeChart;
