import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";

import Layout from "../components/Layout";
import DownloadChart from "../components/DownloadChart";
import LineChart from "../components/LineChart";
import PieChart from "../components/PieChart";

const getFormattedDateString = (date) => {
    if (date instanceof Date) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return [
            date.getFullYear(),
            (month > 9 ? "" : "0") + month,
            (day > 9 ? "" : "0") + day,
        ].join("-");
    }
};

const getEndDate = (start, range) => {
    const startDate = new Date(start);
    const endDate = new Date(start);
    endDate.setFullYear(startDate.getFullYear());
    endDate.setMonth(startDate.getMonth());
    endDate.setDate(startDate.getDate() + range);
    return endDate;
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const Reporting = () => {
    const router = useRouter();
    const now = new Date();
    const [startDate, setStartDate] = useState(new Date());
    const [range, setRange] = useState(6);
    const [endDate, setEndDate] = useState(getEndDate(startDate, range));
    const [visitorRange, setVisitorRange] = useState(6);
    const [visitorStartDate, setVisitorStartDate] = useState(new Date());
    const [visitorEndDate, setVisitorEndDate] = useState(getEndDate(visitorStartDate, visitorRange));
    const [visitorData, setVisitorData] = useState({ data: [], labels: [] });
    const [inviteData, setInviteData] = useState({ data: [], labels: [] });
    const [cancelData, setCancelData] = useState({ data: [], labels: [] });
    const [predictedData, setPredictedData] = useState({ data: [], labels: [], });
    const [activeVisitorData, setActiveVisitorData] = useState({ data: [], labels: []});
    const [predictedVisitorData, setPredictedVisitorData] = useState({ data: [], labels: [] });

    const { loading, error, data } = useQuery(
        gql`
            query {
                getNumInvitesPerDate(
                    dateStart: "${getFormattedDateString(startDate)}",
                    dateEnd: "${getFormattedDateString(endDate)}"
                ) {
                    inviteDate
                    inviteState
                }
            }
        `
    );

    const visitorUsedQuery = useQuery(
        gql`
            query {
              getUsedVisitorsInRange(startDate: "${getFormattedDateString(visitorStartDate)}", endDate: "${getFormattedDateString(visitorEndDate)}") {
                reservationDate,
                activated
              }
            }
        `
    );

    const predictedVisitorQuery = useQuery(gql`
        query {
          getPredictedInviteData(startDate: "${getFormattedDateString(visitorStartDate)}", endDate: "${getFormattedDateString(visitorEndDate)}") {
            date,
            visitor
          }
        }
    `);

    const predictedInvitesQuery = useQuery(gql`
        query {
          getPredictedInviteData(startDate: "${getFormattedDateString(startDate)}", endDate: "${getFormattedDateString(endDate)}") {
            date,
            visitors
          }
        }
    `);

    useEffect(() => {
        if (!loading && !error && data) {
            let invites = [...data.getNumInvitesPerDate];

            const _inviteDateMap = new Map();
            const _visitorDateMap = new Map();
            const _cancelMap = new Map();

            for (let i = 0; i < range; i++) {
                const dateKey = new Date(startDate);
                dateKey.setDate(startDate.getDate() + i);
                _inviteDateMap.set(getFormattedDateString(dateKey), 0);
                _visitorDateMap.set(getFormattedDateString(dateKey), 0);
                _cancelMap.set(getFormattedDateString(dateKey), 0);
            }

            invites.forEach((invite, idx) => {
                if (invite.inviteState === "inActive") {
                    _inviteDateMap.set(
                        invite.inviteDate,
                        _inviteDateMap.get(invite.inviteDate)
                            ? _inviteDateMap.get(invite.inviteDate) + 1
                            : 1
                    );
                } else if (
                    (invite.inviteState === "signedIn" ||
                        invite.inviteState === "signedOut") &&
                    new Date(invite.inviteDate) <= now
                ) {
                    _visitorDateMap.set(
                        invite.inviteDate,
                        _visitorDateMap.get(invite.inviteDate)
                            ? _visitorDateMap.get(invite.inviteDate) + 1
                            : 1
                    );

                    _inviteDateMap.set(
                        invite.inviteDate,
                        _inviteDateMap.get(invite.inviteDate)
                            ? _inviteDateMap.get(invite.inviteDate) + 1
                            : 1
                    );

                } else if (invite.inviteState === "cancelled") {
                    _cancelMap.set(
                        invite.inviteDate,
                        _cancelMap.get(invite.inviteDate)
                            ? _cancelMap.get(invite.inviteDate) + 1
                            : 1
                    );
                }
            });
            
            setInviteData({
                data: Array.from(_inviteDateMap.values()),
                labels: Array.from(_inviteDateMap.keys()),
            });

            setVisitorData({
                data: Array.from(_visitorDateMap.values()),
                labels: Array.from(_visitorDateMap.keys()),
            });

            setCancelData({
                data: Array.from(_cancelMap.values()),
                labels: Array.from(_cancelMap.keys()),
            });
        } else if (error) {
            if (error.message === "Unauthorized") {
                router.push("/expire");
            }
        }
    }, [loading, data, error, range, startDate]);

    useEffect(() => {
        setEndDate(getEndDate(startDate, range));
    }, [startDate, range]);

    useEffect(() => {
        setVisitorEndDate(getEndDate(visitorStartDate, visitorRange));
    }, [visitorStartDate, visitorRange]);
    
    useEffect(() => {
        if(!visitorUsedQuery.loading && !visitorUsedQuery.error) {
            const reservations = visitorUsedQuery.data.getUsedVisitorsInRange;
            const _reservationsMap = new Map();
            const _usedMap = new Map();
            for (let i = 0; i < visitorRange; i++) {
                const dateKey = new Date(visitorStartDate);
                dateKey.setDate(visitorStartDate.getDate() + i);
                _reservationsMap.set(getFormattedDateString(dateKey), 0);
                _usedMap.set(getFormattedDateString(dateKey), 0);
            }
            
            reservations.forEach((reservation) => {
                    if(!reservation.activated) {
                        _reservationsMap.set(
                            reservation.reservationDate,
                            _reservationsMap.get(reservation.reservationDate)
                                ? _reservationsMap.get(reservation.reservationDate) + 1
                                : 1
                        );
                    } else if(reservation.reservationDate <= getFormattedDateString(now)) {
                        _usedMap.set(
                            reservation.reservationDate,
                            _usedMap.get(reservation.reservationDate)
                                ? _usedMap.get(reservation.reservationDate) + 1
                                : 1
                        );
                    }
                
            });
        
            setVisitorData({ data: Array.from(_reservationsMap.values()), labels: Array.from(_reservationsMap.keys())});
            setActiveVisitorData({ data: Array.from(_usedMap.values()), labels: Array.from(_usedMap.keys())});
        } else if(visitorUsedQuery.error) {
            if (visitorUsedQuery.error.message === "Unauthorized") {
                router.push("/expire");
            }
        }

    }, [visitorUsedQuery, visitorStartDate, visitorRange]);

    useEffect(() => {
        if (!predictedInvitesQuery.loading && !predictedInvitesQuery.error) {
            const _predictedMap = new Map();

            for (let i = 0; i < range; i++) {
                const dateKey = new Date(startDate);
                dateKey.setDate(startDate.getDate() + i);
                _predictedMap.set(getFormattedDateString(dateKey), 0);
            }

            const predictedData =
                predictedInvitesQuery.data.getPredictedInviteData;

            predictedData.forEach((prediction) => {
                _predictedMap.set(prediction.date, prediction.visitors);
            });

            setPredictedData({
                data: Array.from(_predictedMap.values()),
                labels: Array.from(_predictedMap.keys()),
            });
        } else if (predictedInvitesQuery.error) {
        }
    }, [predictedInvitesQuery, range]);

    useEffect(() => {
        if (!predictedVisitorQuery.loading && !predictedVisitorQuery.error) {
            const _predictedMap = new Map();

            for (let i = 0; i < visitorRange; i++) {
                const dateKey = new Date(visitorStartDate);
                dateKey.setDate(visitorStartDate.getDate() + i);
                _predictedMap.set(getFormattedDateString(dateKey), 0);
            }

            const predictedData =
                predictedVisitorQuery.data.getPredictedInviteData;

            predictedData.forEach((prediction) => {
                _predictedMap.set(prediction.date, prediction.visitor);
            });

            setPredictedVisitorData({
                data: Array.from(_predictedMap.values()),
                labels: Array.from(_predictedMap.keys()),
            });
        } else if (predictedVisitorQuery.error) {
        }
    }, [predictedVisitorQuery, visitorStartDate, visitorRange]);

    const sum = (data) => {
        let sum = 0;
        data.forEach((val) => {
            sum += val;
        });
        return sum;
    };

    return (
        <Layout>
            <h1 className="p-3 text-4xl font-bold text-primary">Reporting</h1>
            <div className="mb-3 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="card col-span-2 bg-base-300">
                    <div className="card-body">
                        <h2 className="card-title">Net Visitors</h2>
                        <DownloadChart
                            Chart={LineChart}
                            labelvals={inviteData.labels}
                            datavals={[
                                inviteData.data,
                                visitorData.data,
                                predictedData.data,
                            ]}
                            datalabels={[
                                "Invites",
                                "Visitors",
                                "Predicted Visitors",
                            ]}
                            setStart={setStartDate}
                            setRange={setRange}
                            queryLoading={loading}
                        />
                    </div>
                </div>

                <div className="card col-span-2 bg-base-200 p-1 md:p-3 lg:col-span-1 lg:p-5">
                    <h2 className="card-title">
                        Invites vs Visitors vs Cancellations
                    </h2>
                    <div className="card-body">
                        <PieChart
                            labelvals={["Invites", "Visitors", "Cancellations"]}
                            datavals={[
                                sum(inviteData.data),
                                sum(visitorData.data),
                                sum(cancelData.data),
                            ]}
                            datalabels={["Invites"]}
                        />
                        <div>
                            <div className="divider"></div>
                            <p>
                                For {getFormattedDateString(startDate)} to{" "}
                                {getFormattedDateString(endDate)} we had{" "}
                                {sum(inviteData.data)} invites sent but not
                                used.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="card col-span-2 bg-base-200 p-1 md:p-3 lg:p-5 lg:col-span-1">
                    <h2 className="card-title">Reservations vs Used</h2>
                    <div className="card-body">
                        <PieChart
                            labelvals={["Seat Reservations", "Used Seat"]}
                datavals={[
                  sum(visitorData.data),
                  sum(activeVisitorData.data),
                ]}
                datalabels={["Seat"]}
                        />
                    </div>
                    <div className="mb-10">
                        <div className="divider"></div>
                        <p>
                            For {getFormattedDateString(visitorStartDate)} to{" "}
                            {getFormattedDateString(visitorEndDate)} we had{" "}
                            {sum(visitorData.data)} available seat reserved but not
                            used.
                        </p>
                    </div>
                </div>
                <div className="card col-span-2 bg-base-300 p-3 lg:col-span-2">
                    <h2 className="card-title p-3">Seat Reservations</h2>
                    <div className="card-body relative w-full">
                        <DownloadChart
                            Chart={LineChart}
                            labelvals={visitorData.labels}
                            datavals={[
                                visitorData.data,
                                predictedVisitorData.data,
                                activeVisitorData.data
                            ]}
                            datalabels={[
                              "Seat Reservations",
                              "Predicted Seat Reservations",
                              "Used Seat"
                            ]}
                            setStart={setVisitorStartDate}
                            setRange={setVisitorRange}
                            queryLoading={visitorUsedQuery.loading}
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Reporting;
