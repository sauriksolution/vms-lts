import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { BiUserPlus, BiCalendarCheck, BiStats } from "react-icons/bi";
import { FaUsers, FaCalendarAlt, FaChartLine } from "react-icons/fa";
import Layout from "../components/Layout";
import VisitorApproval from "../components/VisitorApproval";

const ResidentDashboard = () => {
    const router = useRouter();
    const [currentDate, setCurrentDate] = useState(new Date());

    // Query for resident statistics
    const { data: statsData, loading: statsLoading } = useQuery(gql`
        query GetResidentStats {
            getInvitesByDate(date: "${currentDate.toISOString().split('T')[0]}") {
                inviteID
                inviteDate
                visitorName
                inviteState
            }
        }
    `, {
        fetchPolicy: "cache-and-network"
    });

    const todaysInvites = statsData?.getInvitesByDate || [];
    const activeInvites = todaysInvites.filter(invite => invite.inviteState === "SIGNED_IN");
    const pendingInvites = todaysInvites.filter(invite => invite.inviteState === "PENDING");

    return (
        <Layout>
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-primary mb-2">
                        Resident Dashboard
                    </h1>
                    <p className="text-base-content/70">
                        Manage your invites and approve visitor registrations
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <div className="flex items-center">
                                <FaUsers className="text-3xl text-primary mr-4" />
                                <div>
                                    <h3 className="text-2xl font-bold">
                                        {activeInvites.length}
                                    </h3>
                                    <p className="text-base-content/70">Active Visitors</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <div className="flex items-center">
                                <FaCalendarAlt className="text-3xl text-warning mr-4" />
                                <div>
                                    <h3 className="text-2xl font-bold">
                                        {pendingInvites.length}
                                    </h3>
                                    <p className="text-base-content/70">Pending Invites</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <div className="flex items-center">
                                <FaChartLine className="text-3xl text-success mr-4" />
                                <div>
                                    <h3 className="text-2xl font-bold">
                                        {todaysInvites.length}
                                    </h3>
                                    <p className="text-base-content/70">Total Today</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h2 className="card-title">
                                <BiUserPlus className="text-xl" />
                                Create New Invite
                            </h2>
                            <p>Invite a visitor to the premises.</p>
                            <div className="card-actions justify-end">
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => router.push('/createInvite')}
                                >
                                    Create Invite
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="card bg-base-200">
                        <div className="card-body">
                            <h2 className="card-title">
                                <BiCalendarCheck className="text-xl" />
                                View Visitor Dashboard
                            </h2>
                            <p>Check visitor status and manage visits.</p>
                            <div className="card-actions justify-end">
                                <button 
                                    className="btn btn-secondary"
                                    onClick={() => router.push('/visitorDashboard')}
                                >
                                    View Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visitor Approval Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 flex items-center">
                        <BiStats className="mr-2" />
                        Visitor Approval Management
                    </h2>
                    <VisitorApproval />
                </div>

                {/* Today's Invites Summary */}
                {todaysInvites.length > 0 && (
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">Today's Invites Summary</h2>
                            <div className="overflow-x-auto">
                                <table className="table table-zebra">
                                    <thead>
                                        <tr>
                                            <th>Visitor Name</th>
                                            <th>Invite ID</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {todaysInvites.slice(0, 10).map((invite) => (
                                            <tr key={invite.inviteID}>
                                                <td className="font-medium">{invite.visitorName}</td>
                                                <td>{invite.inviteID}</td>
                                                <td>
                                                    <span className={`badge ${
                                                        invite.inviteState === 'SIGNED_IN' ? 'badge-success' :
                                                        invite.inviteState === 'PENDING' ? 'badge-warning' :
                                                        'badge-ghost'
                                                    }`}>
                                                        {invite.inviteState}
                                                    </span>
                                                </td>
                                                <td>{invite.inviteDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {todaysInvites.length > 10 && (
                                <div className="card-actions justify-center mt-4">
                                    <button 
                                        className="btn btn-outline"
                                        onClick={() => router.push('/visitorDashboard')}
                                    >
                                        View All Invites
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export async function getStaticProps(context) {
    return {
        props: {
            protected: true,
            permission: 2, // Resident permission level
        },
    };
}

export default ResidentDashboard;