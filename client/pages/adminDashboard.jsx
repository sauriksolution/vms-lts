import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import { gql, useQuery, useMutation, useApolloClient } from "@apollo/client";

import Layout from "../components/Layout";
import AdminCard from "../components/AdminCard";
import LineChart from "../components/LineChart";
import DownloadChart from "../components/DownloadChart";
import VisitorSearchResults from "../components/VisitorSearchResults";
import CreateUserForm from "../components/CreateUserForm";
import VisitorApproval from "../components/VisitorApproval";

import useDateRange from "../hooks/useDateRange.hook";
import useAuth from "../store/authStore";

import { AiOutlinePlus, AiOutlineMinus, AiOutlineCar } from "react-icons/ai";
import { BiBuildingHouse, BiMailSend, BiUserPlus } from "react-icons/bi";
import { FaSearch, FaCarSide, FaPeopleArrows } from "react-icons/fa";
import {
    MdBlock,
    MdDataSaverOn,
    MdDataSaverOff,
    MdOutlineCancel,
} from "react-icons/md";

// Returns string in format yyyy-mm-dd given Date Object
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

const AdminDashboard = () => {
    // NextJS Page Router
    const router = useRouter();

    // Number of invites sent state
    const [numInvitesSent, setNumInvitesSent] = useState(0);

    const [hoursMenu, setHours] = useState(0);
    const [minutesMenu, setMinutes] = useState(0);

    const hours = ["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23"];
    const mins = ["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29"
    ,"30","31","32","33","34","35","36","37","38","39","40","41","42","43","44","45","46","47","48","49","50","51","52","53","54","55","56","57","58","59"];

    // Visitor invite data object for chart
    const [visitorVals, setVisitorVals] = useState({
        data: [],
        labels: [],
        label: "Invites",
    });

    // Seat data object for chart
    const [seatVals, setSeatVals] = useState({
      labels: [],
      data: [],
      label: "Seat",
    });

    // Predicted Visitor Values
    const [predictedVisitorVals, setPredictedVisitorVals] = useState([]);

    // Date Range Hook
    const [startDate, endDate, inviteDateMap, setDateMap] = useDateRange(
        getFormattedDateString(new Date(Date.now())),
        7
    );

    // Seat Date Range Hook
    const [
        visitorStartDate,
        visitorEndDate,
        visitorDateMap,
        setVisitorDateMap,
    ] = useDateRange(getFormattedDateString(new Date(Date.now())), 7);

    // Start Date State
    const [start, setStart] = useState(startDate);

    // Initial number of invites per resident for fallback
    const [initialNumInvitesPerResident, setInitialNumInvitesPerResident] =
        useState(1);

    const [initialSleepovers, setInitialSleepovers] = useState(0);

    const [initialNumVisitorSpots, setInitialNumVisitorSpots] = useState(0);

    const [numVisitorSpotsAvailableToday, setNumVisitorSpotsAvailableToday] =
        useState(0);

    // State to track whether the restrictions have changed
    const [restrictionsChanged, setRestrictionsChanged] = useState(false);

    // State for invites for today
    const [todayInvites, setTodayInvites] = useState(0);

    // Search visitor name state
    const [name, setName] = useState("");

    // Average values for week
    const [avgVisitors, setAvgVisitors] = useState(0);
    const [avgVisitor, setAvgVisitor] = useState(0);

    // Cancellations for the week
    const [numCancel, setNumCancel] = useState(0);

    const now = getFormattedDateString(new Date());

    const [numVisitorSpotsAvailable, setNumVisitorSpotsAvailable] = useState(0);

    // JWT Token data from Model
    const decodedToken = useAuth((state) => {
        return state.decodedToken;
    })();

    const numInvitesPerResidentQuery = useQuery(gql`
        query {
            getNumInvitesPerResident {
                value
            }
        }
    `);

    const CurfewTimeQuery = useQuery(gql`
        query {
            getCurfewTime {
                value
            }
        }
    `);

    const numSleepoversPerResidentQuery = useQuery(gql`
        query {
            getMaxSleepovers {
                value
            }
        }
    `);

    const maxSleepoversQuery = useQuery(gql`
        query {
            getMaxSleepovers {
                value
            }
        }
    `);

    // Number of invites per resident state
    const [numInvitesPerResident, setNumInvitesPerResident] = useState(1);
    const [maxSleepovers, setMaxSleepovers] = useState(1);
    const [curfewTime, setCurfewTime] = useState(1);

    const [defaultHours, setDefaultHours] = useState(0);
    const [defaultMins, setDefaultMins] = useState(0);

    const numInvitesQuery = useQuery(gql`
        query {
            getTotalNumberOfVisitors
        }
    `);

    const numVisitorSpotsAvailableQuery = useQuery(gql`
        query {
            getTotalAvailableParking
        }
    `);



    const numInviteInDateRangeQuery = useQuery(
        gql`
        query {
            getNumInvitesPerDate(
                dateStart: "${start}",
                dateEnd: "${endDate}"
            ) {
                inviteDate
                inviteState
            }
        }
    `,
        { fetchPolicy: "no-cache" }
    );

    const numVisitorInDateRangeQuery = useQuery(gql`
        query {
            getUsedParkingsInRange(startDate: "${visitorStartDate}", endDate: "${visitorEndDate}") {
                reservationDate
            }
        }
    `);

    const predictedInvitesQuery = useQuery(gql`
        query {
          getPredictedInviteData(startDate: "${startDate}", endDate: "${endDate}") {
            date
            visitor,
            visitors
          }
        }
    `);

    const [setNumInvitesPerResidentMutation, { data, loading, error }] =
        useMutation(gql`
        mutation {
        setNumInvitesPerResident(numInvites: ${numInvitesPerResident}) {
            value
        }
        }
    `);

    const [setMaxSleepoversMutation, {}] =
        useMutation(gql`
        mutation {
        setMaxSleepovers(sleepovers: ${maxSleepovers}) {
            value
        }
        }
    `);

    const [adjustVisitorMutation, { }] =
        useMutation(gql`
            mutation {
                adjustVisitor(numDisiredVisitorTotal: ${numVisitorSpotsAvailable})
            }
        `);

    const client = useApolloClient();
    function curfewMutationFunc(CURFEW) {

        client.mutate({
            mutation: gql`
        mutation {
            setCurfewTime(curfewTime: ${CURFEW}) {
            value
            }
        }
    `});
    }

    const cancelRestrictions = () => {
        setNumInvitesPerResident(initialNumInvitesPerResident);
        setNumVisitorSpotsAvailable(initialNumVisitorSpots);
        setInitialSleepovers(initialSleepovers);
        setRestrictionsChanged(false);
    };

    const saveRestrictions = () => {

        if (numInvitesPerResident !== initialNumInvitesPerResident) {
            setInitialNumInvitesPerResident(numInvitesPerResident);
            setNumInvitesPerResidentMutation();
        }

        if (maxSleepovers !== initialSleepovers) {
            setInitialSleepovers(maxSleepovers);
            setMaxSleepoversMutation();
        }

        if (numVisitorSpotsAvailable !== initialNumVisitorSpots) {
            setInitialNumVisitorSpots(numVisitorSpotsAvailable);
            adjustVisitorMutation();
            setNumVisitorSpotsAvailableToday(
                numVisitorSpotsAvailable - seatVals.data[0]
            );
        }

        if (minutesMenu == "1") {
            minutesMenu = "0" + minutesMenu;
        } else if (minutesMenu == "2") {
            minutesMenu = "0" + minutesMenu;
        } else if (minutesMenu == "3") {
            minutesMenu = "0" + minutesMenu;
        } else if (minutesMenu == "4") {
            minutesMenu = "0" + minutesMenu;
        } else if (minutesMenu == "5") {
            minutesMenu = "0" + minutesMenu;
        } else if (minutesMenu == "6") {
            minutesMenu = "0" + minutesMenu;
        } else if (minutesMenu == "7") {
            minutesMenu = "0" + minutesMenu;
        } else if (minutesMenu == "8") {
            minutesMenu = "0" + minutesMenu;
        } else if (minutesMenu == "9") {
            minutesMenu = "0" + minutesMenu;
        } else if (minutesMenu == "0") {
            minutesMenu = "0" + minutesMenu;
        }

        if (hoursMenu == "0") {
            hoursMenu = "0" + hoursMenu;
        }

        let temp = hoursMenu + minutesMenu;
        
        let numTemp = parseInt(temp);
        setCurfewTime(numTemp);

        if (parseInt(hoursMenu) != defaultHours || parseInt(minutesMenu)!=defaultMins) {
            //setInitialCurfewTime(curfewTime);  
            curfewMutationFunc(numTemp);   
            setDefaultHours(hoursMenu);
            setDefaultMins(minutesMenu);    
        }

        setRestrictionsChanged(false);
    };

    useEffect(() => {
        // Num invites
        if (!numInvitesQuery.loading && !numInvitesQuery.error) {
            const invites = numInvitesQuery.data.getTotalNumberOfVisitors;
            setNumInvitesSent(invites);
        } else if (numInvitesQuery.error) {
            if (numInvitesQuery.error.message === "Unauthorized") {
                router.push("/expire");
                return;
            }
        }

        // Num invites in range
        if (
            !numInviteInDateRangeQuery.loading &&
            !numInviteInDateRangeQuery.error
        ) {
            const invites = numInviteInDateRangeQuery.data.getNumInvitesPerDate;
            let numCancelled = 0;
            invites.forEach((invite) => {
                if (invite.inviteState === "cancelled") {
                    numCancelled++;
                } else if (!isNaN(inviteDateMap.get(invite.inviteDate))) {
                    inviteDateMap.set(
                        invite.inviteDate,
                        inviteDateMap.get(invite.inviteDate) + 1
                    );
                }
            });

            setNumCancel(numCancelled);
            setAvgVisitors(invites.length / 7);

            setDateMap(new Map(inviteDateMap));
            setVisitorVals({
                data: Array.from(inviteDateMap.values()),
                labels: Array.from(inviteDateMap.keys()),
                label: "Invites",
            });

            setTodayInvites(inviteDateMap.get(startDate));
        } else if (numInviteInDateRangeQuery.error) {
            console.error(numInviteInDateRangeQuery.error);
        }


        // Num visitor in range
        if (
            !numVisitorInDateRangeQuery.loading &&
            !numVisitorInDateRangeQuery.error
        ) {
            const visitorNumbers =
                numVisitorInDateRangeQuery.data.getUsedParkingsInRange;

            visitorNumbers.forEach((visitor) => {
                if (!isNaN(visitorDateMap.get(visitor.reservationDate))) {
                    visitorDateMap.set(
                        visitor.reservationDate,
                        visitorDateMap.get(visitor.reservationDate) + 1
                    );
                }
            });

            setAvgVisitor(visitorNumbers.length / 7);

            setVisitorDateMap(new Map(visitorDateMap));
            setSeatVals({
                labels: Array.from(visitorDateMap.keys()),
                data: Array.from(visitorDateMap.values()),
                label: "Visitor",
            });
        } else if (numVisitorInDateRangeQuery.error) {
            console.error(numVisitorInDateRangeQuery.error);
        }

        // Visitor spots available
        if (
            !numVisitorSpotsAvailableQuery.loading &&
            !numVisitorSpotsAvailableQuery.error
        ) {
            const numVisitorspots =
                numVisitorSpotsAvailableQuery.data.getTotalAvailableParking;
            setNumVisitorSpotsAvailable(numVisitorspots);
            setInitialNumVisitorSpots(numVisitorspots);
            setNumVisitorSpotsAvailableToday(
                numVisitorSpotsAvailable - visitorDateMap.get(visitorStartDate)
            );
        } else if (numVisitorSpotsAvailableQuery.error) {
            setNumVisitorSpotsAvailable("Error");
        }

        if (
            !numInvitesPerResidentQuery.loading &&
            !numInvitesPerResidentQuery.error
        ) {
            setNumInvitesPerResident(
                numInvitesPerResidentQuery.data.getNumInvitesPerResident.value
            );
            setInitialNumInvitesPerResident(numInvitesPerResident);
        } else if (numInvitesPerResident.error) {
        }

        if (
            !numSleepoversPerResidentQuery.loading &&
            !numSleepoversPerResidentQuery.error
        ) {
            setMaxSleepovers(
                numSleepoversPerResidentQuery.data.getMaxSleepovers.value
            );
            setInitialSleepovers(maxSleepovers);
        } else if (numSleepoversPerResidentQuery.error) {
        }


    }, [
        numInvitesQuery,
        numInviteInDateRangeQuery,
        numVisitorInDateRangeQuery,
        numVisitorSpotsAvailableQuery,
        setSeatVals,
        setNumVisitorSpotsAvailable,
        numInvitesPerResidentQuery,
        numSleepoversPerResidentQuery,

    ]);

    useEffect(() => {
        if (!predictedInvitesQuery.loading && !predictedInvitesQuery.error) {
            const predictedVisitors = [];
            const predictedVisitor = [];
            predictedInvitesQuery.data.getPredictedInviteData.forEach(
                (invite) => {
                    predictedVisitors.push(invite.visitors);
                    predictedVisitor.push(invite.visitor);
                }
            );

            setPredictedVisitorVals(predictedVisitors);
            setPredictedVisitorVals(predictedVisitor);
        }
    }, [predictedInvitesQuery]);

    function populateCurfew(){
        if (!CurfewTimeQuery.loading && !CurfewTimeQuery.error) {
            const curfew = CurfewTimeQuery.data.getCurfewTime.value;
            let tempH;
            let tempM;
            if (curfew == "0") {
                tempH = "00";
                tempM = "00";
            } else {
                let tempCurfew = String(curfew);
                if (tempCurfew.length == 3) {
                    tempCurfew = "0" + tempCurfew;
                }
                tempH = tempCurfew.substring(0, 2);
                tempM = tempCurfew.substring(2, 4);
            }
            setDefaultHours(tempH);
            setDefaultMins(tempM);
            setHours(tempH);
            setMinutes(tempM);
        }
    }

    useEffect(() => {
        populateCurfew();
    }, [CurfewTimeQuery]);

    return (
        <Layout>
            <div className="mb-3 space-y-3 px-3">
                <div className="flex flex-col items-center justify-between md:flex-row">
                    <div className="flex-col">
                        <h1 className="mt-4 mb-4 text-3xl font-bold">
                            <span className="">Hi</span>{" "}
                            <span className="text-secondary">
                                {decodedToken.name}
                            </span>
                            <span>👋</span>
                        </h1>
                        <p className="text-slate-500">
                            View and Manage System State
                        </p>
                    </div>

                    <div>
                        <div className="input-group">
                            <input
                                onChange={(e) => {
                                    setName(e.target.value);
                                }}
                                type="text"
                                placeholder="Search…"
                                className="input input-bordered"
                            />
                            <label
                                htmlFor="visitor-modal"
                                className="btn btn-square"
                            >
                                <FaSearch />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 grid-rows-1 space-y-3">
                    <div className="stats stats-vertical w-full shadow lg:stats-horizontal">
                        <AdminCard
                            description="Total Number Of Invites For Today"
                            Icon={BiBuildingHouse}
                            dataval={todayInvites}
                            unit="Today"
                        />
                        <AdminCard
                            description="Total Number Of Invites Sent"
                            Icon={BiMailSend}
                            dataval={numInvitesSent}
                            unit="Today"
                        />
                        <AdminCard
                            description="Number Of Available seat"
                            Icon={AiOutlineCar}
                            dataval={numVisitorSpotsAvailableToday}
                            unit="Today"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="card bg-base-200">
                            <div className="card-body">
                                <h2 className="card-title">
                                    <BiUserPlus className="text-xl" />
                                    Create Receptionist Account
                                </h2>
                                <p>Create a new receptionist account for the system.</p>
                                <div className="card-actions justify-end">
                                    <label htmlFor="create-receptionist-modal" className="btn btn-primary">
                                        Create Receptionist
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div className="card bg-base-200">
                            <div className="card-body">
                                <h2 className="card-title">
                                    <BiUserPlus className="text-xl" />
                                    Create Resident Account
                                </h2>
                                <p>Create a new resident account for the system.</p>
                                <div className="card-actions justify-end">
                                    <label htmlFor="create-resident-modal" className="btn btn-primary">
                                        Create Resident
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visitor Approval Section */}
                    <div className="mt-6">
                        <VisitorApproval />
                    </div>

                    <div className="grid grid-cols-1 gap-3 text-secondary-content md:grid-cols-2">
                        <DownloadChart
                            title={"Visitor Forecast For The Week"}
                            filename="visitor-forecast.png"
                            Chart={LineChart}
                            labelvals={visitorVals.labels}
                            datavals={[
                                visitorVals.data,
                                predictedVisitorVals,
                                visitorVals.data,
                                predictedVisitorVals
                            ]}
                            datalabels={[
                                visitorVals.label,
                                "Predicted Visitors",
                                visitorVals.label,
                                "Predicted Visitor"
                            ]}
                        />
                        <div className="stats stats-vertical bg-base-200 shadow">
                            <div className="stat">
                                <div className="stat-figure">
                                    <MdOutlineCancel className="text-2xl md:text-4xl" />
                                </div>
                                <div className="stat-title">Cancellations</div>
                                <div className="stat-value">{numCancel}</div>
                                <div className="stat-desc">
                                    For week {startDate} - {endDate}
                                </div>
                            </div>
                            <div className="stat">
                                <div className="stat-figure">
                                    <FaPeopleArrows className="text-2xl md:text-3xl" />
                                </div>
                                <div className="stat-title">
                                    Average Visitors per day
                                </div>
                                <div className="stat-value">
                                    {Math.ceil(avgVisitors)}
                                </div>
                                <div className="stat-desc">
                                    For week {startDate} - {endDate}
                                </div>
                            </div>
                            <div className="stat">
                                <div className="stat-figure">
                                    <FaCarSide className="text-2xl md:text-3xl" />
                                </div>
                                <div className="stat-title">
                                    Average Visitor Reservations per day
                                </div>
                                <div className="stat-value">
                                    {Math.ceil(avgVisitor)}
                                </div>
                                <div className="stat-desc">
                                    For week {startDate} - {endDate}
                                </div>
                            </div>
                        </div>
                    </div>
                    <h1 className="flex flex-col items-center justify-center space-x-3 text-2xl font-bold lg:flex-row">
                        <span className="mr-3 text-xl text-primary md:text-3xl">
                            <MdBlock />
                        </span>{" "}
                        System Restrictions
                        <div className="flex items-center">
                            {restrictionsChanged && (
                                <div className="flex space-x-1">
                                    <button
                                        onClick={saveRestrictions}
                                        className="btn btn-primary btn-sm space-x-3 lg:btn-md"
                                    >
                                        <span>
                                            <MdDataSaverOn className="mr-3 text-xl" />
                                        </span>{" "}
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={cancelRestrictions}
                                        className="btn btn-secondary btn-sm space-x-3 lg:btn-md"
                                    >
                                        <span>
                                            <MdDataSaverOff className="mr-3 text-xl" />
                                        </span>{" "}
                                        Cancel Changes
                                    </button>
                                </div>
                            )}
                        </div>
                    </h1>



                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="card bg-base-200">
                            <div className="card-body">
                                <h2 className="card-title">
                                    Invites Per Resident{" "}
                                    <div className="badge badge-secondary">
                                        Resident
                                    </div>
                                </h2>
                                <p>
                                    Number of invites a resident is allowed to
                                    have open/sent at a time.
                                </p>
                                <div className="card-actions flex items-center justify-start">
                                    <div className="flex items-center space-x-3">
                                        <button
                                            data-testid="increaseInvites"
                                            className="btn btn-circle"
                                            onClick={() => {
                                                setNumInvitesPerResident(
                                                    numInvitesPerResident + 1
                                                );
                                                setRestrictionsChanged(true);
                                            }}
                                        >
                                            <AiOutlinePlus className="text-xl md:text-2xl lg:text-3xl" />
                                        </button>
                                        <p
                                            id="numInvitesPerResident"
                                            className="text-4xl font-bold text-secondary"
                                        >
                                            {numInvitesPerResident}
                                        </p>
                                        <button
                                            data-testid="decreaseInvites"
                                            className="btn btn-circle"
                                            onClick={() => {
                                                numInvitesPerResident > 1 &&
                                                    setNumInvitesPerResident(
                                                        numInvitesPerResident -
                                                        1
                                                    );
                                                setRestrictionsChanged(true);
                                            }}
                                        >
                                            <AiOutlineMinus className="text-xl md:text-2xl lg:text-3xl" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card bg-base-200">
                            <div className="card-body">
                                <h2 className="card-title">
                                    Available seat{" "}
                                    <div className="badge badge-secondary">
                                        User
                                    </div>
                                </h2>
                                <p>
                                    Number of visitor available seat in the
                                    building.
                                </p>
                                <div className="card-actions flex items-center justify-start">
                                    <div className="flex items-center space-x-3">

                                        <button className="btn btn-circle" onClick={() => {
                                            setNumVisitorSpotsAvailable(numVisitorSpotsAvailable + 1);
                                            setRestrictionsChanged(true);
                                        }}>
                                            <AiOutlinePlus className="text-xl md:text-2xl lg:text-3xl" />

                                        </button>
                                        <p
                                            id="numVisitorSpotsAvailable"
                                            className="text-4xl font-bold text-secondary"
                                        >
                                            {numVisitorSpotsAvailable}
                                        </p>

                                        <button className="btn btn-circle" onClick={() => {
                                            if (numVisitorSpotsAvailable > 0) {
                                                setNumVisitorSpotsAvailable(numVisitorSpotsAvailable - 1);
                                            }

                                            setRestrictionsChanged(true);
                                        }}>
                                            <AiOutlineMinus className="text-xl md:text-2xl lg:text-3xl" />

                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card bg-base-200">
                            <div className="card-body">
                                <h2 className="card-title">
                                    Curfew Time{" "}
                                    <div className="badge badge-secondary">
                                        Visitor
                                    </div>
                                </h2>
                                <p>
                                    Current curfew: {defaultHours}:{defaultMins}
                                </p>

                                <div className="card-actions flex items-center justify-start">
                                    <div className="flex items-center justify-center">

                                        <select className="select select-bordered select-secondary mx-5" name="hours" id="hours" value={hoursMenu} onChange={(e) => {
                                            setHours(e.target.value);
                                            setRestrictionsChanged(true);
                                        }}>
                                            {hours.map( (value,index) => (
                                                <option key={index} value={value}>{value}</option>
                                            ))}
                                        </select>
                                        <h1>    :    </h1>
                                        <select className="select select-bordered select-secondary mx-5" name="minutes" id="minutes" value={minutesMenu} onChange={(e) => {
                                            setMinutes(e.target.value);
                                            setRestrictionsChanged(true);
                                        }}>
                                            {mins.map( (value,index) => (
                                                <option key={index} value={value}>{value}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card bg-base-200">
                            <div className="card-body">
                                <h2 className="card-title">
                                    Sleepovers{" "}
                                    <div className="badge badge-secondary">
                                        Resident
                                    </div>
                                </h2>
                                <p>
                                    Number of sleepovers a resident is allowed per month
                                </p>
                                <div className="card-actions flex items-center justify-start">
                                    <div className="flex items-center space-x-3">
                                        <button
                                            data-testid="increaseSleepovers"
                                            className="btn btn-circle"
                                            onClick={() => {
                                                setMaxSleepovers(
                                                    maxSleepovers +
                                                    1
                                                );
                                                setRestrictionsChanged(true);
                                            }}
                                        >
                                            <AiOutlinePlus className="text-xl md:text-2xl lg:text-3xl" />
                                        </button>
                                        <p
                                            id="numSleepoversPerResident"
                                            className="text-4xl font-bold text-secondary"
                                        >
                                            {maxSleepovers}
                                        </p>
                                        <button
                                            data-testid="decreaseInvites"
                                            className="btn btn-circle"
                                            onClick={() => {
                                                maxSleepovers > 1 &&
                                                    setMaxSleepovers(
                                                        maxSleepovers -
                                                        1
                                                    );
                                                setRestrictionsChanged(true);
                                            }}
                                        >
                                            <AiOutlineMinus className="text-xl md:text-2xl lg:text-3xl" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <input
                type="checkbox"
                id="visitor-modal"
                className="modal-toggle"
                onChange={(e) => {
                    setName(e.target.value);
                }}
                value={name}
            />
            <label htmlFor="visitor-modal" className="modal cursor-pointer">
                <label className="modal-box relative" htmlFor="">
                    <VisitorSearchResults query={name} />
                </label>
            </label>

            <input
                type="checkbox"
                id="create-receptionist-modal"
                className="modal-toggle"
            />
            <label htmlFor="create-receptionist-modal" className="modal cursor-pointer">
                <label className="modal-box relative" htmlFor="">
                    <h3 className="text-lg font-bold mb-4">Create Receptionist Account</h3>
                    <CreateUserForm userType="receptionist" />
                </label>
            </label>

            <input
                type="checkbox"
                id="create-resident-modal"
                className="modal-toggle"
            />
            <label htmlFor="create-resident-modal" className="modal cursor-pointer">
                <label className="modal-box relative" htmlFor="">
                    <h3 className="text-lg font-bold mb-4">Create Resident Account</h3>
                    <CreateUserForm userType="resident" />
                </label>
            </label>
        </Layout>
    );
};

export async function getStaticProps(context) {
    return {
        props: {
            protected: true,
            permission: 0,
        },
    };
}

export default AdminDashboard;
