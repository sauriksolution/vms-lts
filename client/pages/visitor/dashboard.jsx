import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { motion } from "framer-motion";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useAlert } from 'react-alert';

import { FaFileAlt, FaClock, FaCheck, FaCalendarAlt, FaUser, FaEdit, FaEye, FaPlus } from "react-icons/fa";

import useAuth from "../../store/authStore";
import Layout from "../../components/Layout";
import VisitorNavbar from "../../components/VisitorNavbar";

const VisitorDashboard = () => {
    const router = useRouter();
    const alert = useAlert();
    const { decodedToken, logout } = useAuth();
    
    const [activeTab, setActiveTab] = useState("overview");
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Queries
    const { data: profileData, loading: profileLoading, refetch: refetchProfile } = useQuery(gql`
        query GetVisitorProfile {
            visitorProfile {
                id
                email
                firstName
                lastName
                passportNumber
                nationality
                dateOfBirth
                phoneNumber
                createdAt
                updatedAt
            }
        }
    `);

    const { data: applicationsData, loading: applicationsLoading, refetch: refetchApplications } = useQuery(gql`
        query GetVisitorApplications {
            visitorApplications {
                id
                applicationType
                status
                submittedAt
                lastUpdated
                documents {
                    id
                    fileName
                    fileType
                    uploadedAt
                }
                personalInfo {
                    purpose
                    duration
                    arrivalDate
                    departureDate
                }
            }
        }
    `);

    // Mutations
    const [logoutMutation] = useMutation(gql`
        mutation VisitorLogout {
            visitorLogout {
                success
                message
            }
        }
    `);

    const handleLogout = async () => {
        try {
            await logoutMutation();
            logout();
            alert.success("Logged out successfully");
            router.push("/login");
        } catch (error) {
            console.error("Logout error:", error);
            alert.error("Logout failed");
        }
        setShowLogoutModal(false);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'text-success';
            case 'pending': return 'text-warning';
            case 'rejected': return 'text-error';
            case 'under_review': return 'text-info';
            default: return 'text-base-content';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return <FaCheckCircle className="text-success" />;
            case 'pending': return <FaClock className="text-warning" />;
            case 'rejected': return <FaTimesCircle className="text-error" />;
            case 'under_review': return <AiOutlineLoading3Quarters className="text-info animate-spin" />;
            default: return <FaClock className="text-base-content" />;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const tabVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    if (profileLoading || applicationsLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[80vh]">
                    <div className="text-center">
                        <AiOutlineLoading3Quarters className="text-4xl text-primary animate-spin mx-auto mb-4" />
                        <p className="text-lg">Loading your dashboard...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    const profile = profileData?.visitorProfile;
    const applications = applicationsData?.visitorApplications || [];

    return (
        <Layout>
            <VisitorNavbar />
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
                    <div className="flex items-center mb-4 lg:mb-0">
                        <FaGlobe className="text-3xl text-primary mr-3" />
                        <div>
                            <h1 className="text-3xl font-bold text-primary">
                                Welcome, {profile?.firstName} {profile?.lastName}
                            </h1>
                            <p className="text-base-content/70">VISA Application Portal</p>
                        </div>
                    </div>
                    <button
                        className="btn btn-outline btn-error"
                        onClick={() => setShowLogoutModal(true)}
                    >
                        <FaSignOutAlt className="mr-2" />
                        Logout
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="tabs tabs-boxed mb-6">
                    <button
                        className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <FaHome className="mr-2" />
                        Overview
                    </button>
                    <button
                        className={`tab ${activeTab === 'profile' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <FaUser className="mr-2" />
                        Profile
                    </button>
                    <button
                        className={`tab ${activeTab === 'applications' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('applications')}
                    >
                        <FaFileAlt className="mr-2" />
                        Applications
                    </button>
                </div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Quick Stats */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="card bg-base-100 shadow-xl">
                                    <div className="card-body">
                                        <h2 className="card-title">
                                            <FaFileAlt className="text-primary" />
                                            Application Summary
                                        </h2>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                            <motion.div 
                                                className="stat cursor-pointer hover:shadow-lg transition-shadow"
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => router.push('/visitor/applications')}
                                            >
                                                <div className="stat-value text-2xl text-primary">
                                                    {applications.length}
                                                </div>
                                                <div className="stat-title">Total</div>
                                            </motion.div>
                                            <motion.div 
                                                className="stat cursor-pointer hover:shadow-lg transition-shadow"
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => router.push('/visitor/applications?status=pending')}
                                            >
                                                <div className="stat-value text-2xl text-warning">
                                                    {applications.filter(app => app.status === 'pending').length}
                                                </div>
                                                <div className="stat-title">Pending</div>
                                            </motion.div>
                                            <motion.div 
                                                className="stat cursor-pointer hover:shadow-lg transition-shadow"
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => router.push('/visitor/applications?status=approved')}
                                            >
                                                <div className="stat-value text-2xl text-success">
                                                    {applications.filter(app => app.status === 'approved').length}
                                                </div>
                                                <div className="stat-title">Approved</div>
                                            </motion.div>
                                            <motion.div 
                                                className="stat cursor-pointer hover:shadow-lg transition-shadow"
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => router.push('/visitor/applications?status=rejected')}
                                            >
                                                <div className="stat-value text-2xl text-error">
                                                    {applications.filter(app => app.status === 'rejected').length}
                                                </div>
                                                <div className="stat-title">Rejected</div>
                                            </motion.div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Applications */}
                                <div className="card bg-base-100 shadow-xl">
                                    <div className="card-body">
                                        <div className="flex justify-between items-center">
                                            <h2 className="card-title">
                                                <FaClock className="text-primary" />
                                                Recent Applications
                                            </h2>
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => router.push('/visitor/visa-form')}
                                            >
                                                <FaPlus className="mr-2" />
                                                New Application
                                            </button>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="table table-zebra">
                                                <thead>
                                                    <tr>
                                                        <th>Type</th>
                                                        <th>Status</th>
                                                        <th>Submitted</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {applications.slice(0, 5).map((app) => (
                                                        <tr key={app.id}>
                                                            <td className="font-medium">{app.applicationType}</td>
                                                            <td>
                                                                <div className="flex items-center">
                                                                    {getStatusIcon(app.status)}
                                                                    <span className={`ml-2 ${getStatusColor(app.status)}`}>
                                                                        {app.status}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td>{formatDate(app.submittedAt)}</td>
                                                            <td>
                                                                <div className="flex space-x-2">
                                                                    <button
                                                                        className="btn btn-ghost btn-xs"
                                                                        onClick={() => router.push(`/visitor/application/${app.id}`)}
                                                                    >
                                                                        <FaEye />
                                                                    </button>
                                                                    {app.status === 'pending' && (
                                                                        <button
                                                                            className="btn btn-ghost btn-xs"
                                                                            onClick={() => router.push(`/visitor/visa-form?edit=${app.id}`)}
                                                                        >
                                                                            <FaEdit />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {applications.length === 0 && (
                                                <div className="text-center py-8">
                                                    <FaFileAlt className="text-4xl text-base-content/30 mx-auto mb-4" />
                                                    <p className="text-base-content/70">No applications yet</p>
                                                    <button
                                                        className="btn btn-primary mt-4"
                                                        onClick={() => router.push('/visitor/visa-form')}
                                                    >
                                                        <FaPlus className="mr-2" />
                                                        Start Your First Application
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Profile Card */}
                            <div className="space-y-6">
                                <div className="card bg-base-100 shadow-xl">
                                    <div className="card-body">
                                        <h2 className="card-title">
                                            <FaUser className="text-primary" />
                                            Profile
                                        </h2>
                                        <div className="space-y-3">
                                            <div className="flex items-center">
                                                <FaUser className="text-base-content/50 mr-3" />
                                                <span>{profile?.firstName} {profile?.lastName}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <FaEnvelope className="text-base-content/50 mr-3" />
                                                <span>{profile?.email}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <FaPassport className="text-base-content/50 mr-3" />
                                                <span>{profile?.passportNumber}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <FaIdCard className="text-base-content/50 mr-3" />
                                                <span>{profile?.nationality}</span>
                                            </div>
                                        </div>
                                        <div className="card-actions justify-end mt-4">
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => setActiveTab('profile')}
                                            >
                                                <FaEdit className="mr-2" />
                                                Edit Profile
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="max-w-2xl mx-auto">
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h2 className="card-title">
                                        <FaUser className="text-primary" />
                                        Profile Information
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">First Name</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="input input-bordered"
                                                value={profile?.firstName || ''}
                                                readOnly
                                            />
                                        </div>
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">Last Name</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="input input-bordered"
                                                value={profile?.lastName || ''}
                                                readOnly
                                            />
                                        </div>
                                        <div className="form-control md:col-span-2">
                                            <label className="label">
                                                <span className="label-text">Email</span>
                                            </label>
                                            <input
                                                type="email"
                                                className="input input-bordered"
                                                value={profile?.email || ''}
                                                readOnly
                                            />
                                        </div>
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">Passport Number</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="input input-bordered"
                                                value={profile?.passportNumber || ''}
                                                readOnly
                                            />
                                        </div>
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">Nationality</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="input input-bordered"
                                                value={profile?.nationality || ''}
                                                readOnly
                                            />
                                        </div>
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">Date of Birth</span>
                                            </label>
                                            <input
                                                type="date"
                                                className="input input-bordered"
                                                value={profile?.dateOfBirth || ''}
                                                readOnly
                                            />
                                        </div>
                                        <div className="form-control">
                                            <label className="label">
                                                <span className="label-text">Phone Number</span>
                                            </label>
                                            <input
                                                type="tel"
                                                className="input input-bordered"
                                                value={profile?.phoneNumber || ''}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                    <div className="alert alert-info mt-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        <span>Profile information is read-only. Contact support to make changes.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'applications' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold">My Applications</h2>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => router.push('/visitor/visa-form')}
                                >
                                    <FaPlus className="mr-2" />
                                    New Application
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {applications.map((app) => (
                                    <div key={app.id} className="card bg-base-100 shadow-xl">
                                        <div className="card-body">
                                            <h3 className="card-title text-lg">
                                                {app.applicationType}
                                            </h3>
                                            <div className="flex items-center mb-2">
                                                {getStatusIcon(app.status)}
                                                <span className={`ml-2 font-medium ${getStatusColor(app.status)}`}>
                                                    {app.status}
                                                </span>
                                            </div>
                                            <div className="text-sm text-base-content/70 space-y-1">
                                                <div className="flex items-center">
                                                    <FaCalendarAlt className="mr-2" />
                                                    Submitted: {formatDate(app.submittedAt)}
                                                </div>
                                                <div className="flex items-center">
                                                    <FaClock className="mr-2" />
                                                    Updated: {formatDate(app.lastUpdated)}
                                                </div>
                                            </div>
                                            <div className="card-actions justify-end mt-4">
                                                <button
                                                    className="btn btn-ghost btn-sm"
                                                    onClick={() => router.push(`/visitor/application/${app.id}`)}
                                                >
                                                    <FaEye className="mr-1" />
                                                    View
                                                </button>
                                                {app.status === 'pending' && (
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => router.push(`/visitor/visa-form?edit=${app.id}`)}
                                                    >
                                                        <FaEdit className="mr-1" />
                                                        Edit
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {applications.length === 0 && (
                                <div className="text-center py-12">
                                    <FaFileAlt className="text-6xl text-base-content/30 mx-auto mb-6" />
                                    <h3 className="text-2xl font-bold mb-4">No Applications Yet</h3>
                                    <p className="text-base-content/70 mb-6">
                                        Start your VISA application process today
                                    </p>
                                    <button
                                        className="btn btn-primary btn-lg"
                                        onClick={() => router.push('/visitor/visa-form')}
                                    >
                                        <FaPlus className="mr-2" />
                                        Create Your First Application
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Logout Confirmation Modal */}
                {showLogoutModal && (
                    <div className="modal modal-open">
                        <div className="modal-box">
                            <h3 className="font-bold text-lg">Confirm Logout</h3>
                            <p className="py-4">Are you sure you want to logout?</p>
                            <div className="modal-action">
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => setShowLogoutModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-error"
                                    onClick={handleLogout}
                                >
                                    <FaSignOutAlt className="mr-2" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default VisitorDashboard;