import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useAlert } from 'react-alert';

import { 
    FaFileAlt, FaEdit, FaEye, FaTrash, FaDownload, FaArrowLeft, 
    FaCalendarAlt, FaUser, FaPassport, FaPlane, FaMapMarkerAlt,
    FaPhone, FaEnvelope, FaIdCard, FaGlobe, FaHeart, FaGraduationCap,
    FaBriefcase, FaHome, FaUpload, FaCheck, FaTimes, FaClock,
    FaExclamationTriangle, FaInfoCircle, FaSearch, FaFilter
} from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";

import Layout from "../../components/Layout";
import { useAuth } from "../../store/authStore";

const VisitorApplications = () => {
    const router = useRouter();
    const alert = useAlert();
    const { decodedToken } = useAuth();
    
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list', 'view', 'edit'
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [applicationToDelete, setApplicationToDelete] = useState(null);

    // Status color mapping
    const statusColors = {
        'DRAFT': 'badge-warning',
        'SUBMITTED': 'badge-info',
        'UNDER_REVIEW': 'badge-primary',
        'APPROVED': 'badge-success',
        'REJECTED': 'badge-error',
        'CANCELLED': 'badge-neutral'
    };

    const statusIcons = {
        'DRAFT': FaEdit,
        'SUBMITTED': FaClock,
        'UNDER_REVIEW': FaInfoCircle,
        'APPROVED': FaCheck,
        'REJECTED': FaTimes,
        'CANCELLED': FaExclamationTriangle
    };

    // Queries and Mutations
    const { data: applicationsData, loading: applicationsLoading, refetch } = useQuery(gql`
        query GetVisitorApplications($filter: ApplicationFilterInput) {
            visitorApplications(filter: $filter) {
                id
                applicationNumber
                visaType
                status
                submittedAt
                lastUpdated
                personalInfo {
                    firstName
                    lastName
                    dateOfBirth
                    nationality
                    passportNumber
                    passportExpiry
                    maritalStatus
                    education
                    occupation
                }
                contactInfo {
                    email
                    phoneNumber
                    address
                    city
                    country
                    postalCode
                }
                visaDetails {
                    purposeOfVisit
                    intendedDuration
                    entryDate
                    exitDate
                    previousVisits
                    sponsorInfo
                }
                travelDetails {
                    flightDetails
                    accommodationInfo
                    travelItinerary
                    emergencyContact
                }
                documents {
                    id
                    fileName
                    fileType
                    uploadedAt
                    status
                }
                reviewComments {
                    id
                    comment
                    createdAt
                    createdBy
                }
                createdAt
                updatedAt
            }
        }
    `, {
        variables: {
            filter: {
                status: filterStatus === 'all' ? null : filterStatus,
                searchTerm: searchTerm || null
            }
        }
    });

    const [updateApplication] = useMutation(gql`
        mutation UpdateVisaApplication($id: ID!, $input: VisaApplicationInput!) {
            updateVisaApplication(id: $id, input: $input) {
                success
                message
                application {
                    id
                    status
                    lastUpdated
                }
            }
        }
    `);

    const [deleteApplication] = useMutation(gql`
        mutation DeleteVisaApplication($id: ID!) {
            deleteVisaApplication(id: $id) {
                success
                message
            }
        }
    `);

    const [downloadDocument] = useMutation(gql`
        mutation DownloadDocument($documentId: ID!) {
            downloadDocument(documentId: $documentId) {
                success
                downloadUrl
                fileName
            }
        }
    `);

    const handleViewApplication = (application) => {
        setSelectedApplication(application);
        setViewMode('view');
    };

    const handleEditApplication = (application) => {
        if (application.status === 'DRAFT' || application.status === 'REJECTED') {
            setSelectedApplication(application);
            setViewMode('edit');
        } else {
            alert.error("You can only edit applications in DRAFT or REJECTED status");
        }
    };

    const handleDeleteApplication = async (applicationId) => {
        try {
            const result = await deleteApplication({
                variables: { id: applicationId }
            });

            if (result.data?.deleteVisaApplication?.success) {
                alert.success("Application deleted successfully");
                setShowDeleteModal(false);
                setApplicationToDelete(null);
                refetch();
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert.error("Failed to delete application");
        }
    };

    const handleDownloadDocument = async (documentId, fileName) => {
        try {
            const result = await downloadDocument({
                variables: { documentId }
            });

            if (result.data?.downloadDocument?.success) {
                const link = document.createElement('a');
                link.href = result.data.downloadDocument.downloadUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error("Download error:", error);
            alert.error("Failed to download document");
        }
    };

    const filteredApplications = applicationsData?.visitorApplications?.filter(app => {
        const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
        const matchesSearch = !searchTerm || 
            app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.personalInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.personalInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.visaType.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesStatus && matchesSearch;
    }) || [];

    if (applicationsLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[80vh]">
                    <div className="text-center">
                        <AiOutlineLoading3Quarters className="text-4xl text-primary animate-spin mx-auto mb-4" />
                        <p className="text-lg">Loading applications...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        {viewMode !== 'list' && (
                            <button
                                className="btn btn-ghost mr-4"
                                onClick={() => {
                                    setViewMode('list');
                                    setSelectedApplication(null);
                                }}
                            >
                                <FaArrowLeft />
                            </button>
                        )}
                        <div className="flex items-center">
                            <FaFileAlt className="text-3xl text-primary mr-3" />
                            <div>
                                <h1 className="text-3xl font-bold text-primary">
                                    {viewMode === 'list' ? 'My Applications' : 
                                     viewMode === 'view' ? 'Application Details' : 'Edit Application'}
                                </h1>
                                <p className="text-base-content/70">
                                    {viewMode === 'list' ? 'Manage your visa applications' : 
                                     viewMode === 'view' ? 'View application information' : 'Update application details'}
                                </p>
                            </div>
                        </div>
                    </div>
                    {viewMode === 'list' && (
                        <button
                            className="btn btn-primary"
                            onClick={() => router.push('/visitor/visa-form')}
                        >
                            <FaPlus className="mr-2" />
                            New Application
                        </button>
                    )}
                </div>

                <AnimatePresence mode="wait">
                    {/* List View */}
                    {viewMode === 'list' && (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Filters and Search */}
                            <div className="card bg-base-100 shadow-xl mb-6">
                                <div className="card-body">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="form-control flex-1">
                                            <div className="relative">
                                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/50" />
                                                <input
                                                    type="text"
                                                    placeholder="Search applications..."
                                                    className="input input-bordered pl-10 w-full"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-control">
                                            <select
                                                className="select select-bordered"
                                                value={filterStatus}
                                                onChange={(e) => setFilterStatus(e.target.value)}
                                            >
                                                <option value="all">All Status</option>
                                                <option value="DRAFT">Draft</option>
                                                <option value="SUBMITTED">Submitted</option>
                                                <option value="UNDER_REVIEW">Under Review</option>
                                                <option value="APPROVED">Approved</option>
                                                <option value="REJECTED">Rejected</option>
                                                <option value="CANCELLED">Cancelled</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Applications Grid */}
                            {filteredApplications.length === 0 ? (
                                <div className="card bg-base-100 shadow-xl">
                                    <div className="card-body text-center py-16">
                                        <FaFileAlt className="text-6xl text-base-content/30 mx-auto mb-4" />
                                        <h2 className="text-2xl font-bold mb-2">No Applications Found</h2>
                                        <p className="text-base-content/70 mb-6">
                                            {searchTerm || filterStatus !== 'all' 
                                                ? "No applications match your current filters."
                                                : "You haven't submitted any visa applications yet."
                                            }
                                        </p>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => router.push('/visitor/visa-form')}
                                        >
                                            <FaPlus className="mr-2" />
                                            Create New Application
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredApplications.map((application) => {
                                        const StatusIcon = statusIcons[application.status];
                                        return (
                                            <motion.div
                                                key={application.id}
                                                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
                                                whileHover={{ y: -5 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div className="card-body">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div>
                                                            <h3 className="card-title text-lg">
                                                                {application.visaType}
                                                            </h3>
                                                            <p className="text-sm text-base-content/70">
                                                                #{application.applicationNumber}
                                                            </p>
                                                        </div>
                                                        <div className="dropdown dropdown-end">
                                                            <label tabIndex={0} className="btn btn-ghost btn-sm">
                                                                <BsThreeDotsVertical />
                                                            </label>
                                                            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                                                                <li>
                                                                    <button onClick={() => handleViewApplication(application)}>
                                                                        <FaEye /> View Details
                                                                    </button>
                                                                </li>
                                                                {(application.status === 'DRAFT' || application.status === 'REJECTED') && (
                                                                    <li>
                                                                        <button onClick={() => handleEditApplication(application)}>
                                                                            <FaEdit /> Edit
                                                                        </button>
                                                                    </li>
                                                                )}
                                                                <li>
                                                                    <button 
                                                                        className="text-error"
                                                                        onClick={() => {
                                                                            setApplicationToDelete(application);
                                                                            setShowDeleteModal(true);
                                                                        }}
                                                                    >
                                                                        <FaTrash /> Delete
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 mb-4">
                                                        <div className="flex items-center text-sm">
                                                            <FaUser className="mr-2 text-primary" />
                                                            {application.personalInfo.firstName} {application.personalInfo.lastName}
                                                        </div>
                                                        <div className="flex items-center text-sm">
                                                            <FaCalendarAlt className="mr-2 text-primary" />
                                                            {new Date(application.submittedAt || application.createdAt).toLocaleDateString()}
                                                        </div>
                                                        <div className="flex items-center text-sm">
                                                            <FaMapMarkerAlt className="mr-2 text-primary" />
                                                            {application.visaDetails.purposeOfVisit}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className={`badge ${statusColors[application.status]} gap-2`}>
                                                            <StatusIcon className="w-3 h-3" />
                                                            {application.status.replace('_', ' ')}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                className="btn btn-sm btn-outline"
                                                                onClick={() => handleViewApplication(application)}
                                                            >
                                                                <FaEye />
                                                            </button>
                                                            {(application.status === 'DRAFT' || application.status === 'REJECTED') && (
                                                                <button
                                                                    className="btn btn-sm btn-primary"
                                                                    onClick={() => handleEditApplication(application)}
                                                                >
                                                                    <FaEdit />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* View Mode */}
                    {viewMode === 'view' && selectedApplication && (
                        <motion.div
                            key="view"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ApplicationView 
                                application={selectedApplication}
                                onEdit={() => setViewMode('edit')}
                                onDownloadDocument={handleDownloadDocument}
                                canEdit={selectedApplication.status === 'DRAFT' || selectedApplication.status === 'REJECTED'}
                            />
                        </motion.div>
                    )}

                    {/* Edit Mode */}
                    {viewMode === 'edit' && selectedApplication && (
                        <motion.div
                            key="edit"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ApplicationEdit 
                                application={selectedApplication}
                                onSave={async (updatedData) => {
                                    try {
                                        const result = await updateApplication({
                                            variables: {
                                                id: selectedApplication.id,
                                                input: updatedData
                                            }
                                        });

                                        if (result.data?.updateVisaApplication?.success) {
                                            alert.success("Application updated successfully");
                                            setViewMode('view');
                                            refetch();
                                        }
                                    } catch (error) {
                                        console.error("Update error:", error);
                                        alert.error("Failed to update application");
                                    }
                                }}
                                onCancel={() => setViewMode('view')}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="modal modal-open">
                        <div className="modal-box">
                            <h3 className="font-bold text-lg">Confirm Deletion</h3>
                            <p className="py-4">
                                Are you sure you want to delete application #{applicationToDelete?.applicationNumber}? 
                                This action cannot be undone.
                            </p>
                            <div className="modal-action">
                                <button 
                                    className="btn btn-error"
                                    onClick={() => handleDeleteApplication(applicationToDelete.id)}
                                >
                                    Delete
                                </button>
                                <button 
                                    className="btn"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setApplicationToDelete(null);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

// Application View Component
const ApplicationView = ({ application, onEdit, onDownloadDocument, canEdit }) => {
    const [activeTab, setActiveTab] = useState('personal');

    const tabs = [
        { id: 'personal', label: 'Personal Info', icon: FaUser },
        { id: 'contact', label: 'Contact Info', icon: FaPhone },
        { id: 'visa', label: 'Visa Details', icon: FaPassport },
        { id: 'travel', label: 'Travel Details', icon: FaPlane },
        { id: 'documents', label: 'Documents', icon: FaFileAlt },
        { id: 'status', label: 'Status & Comments', icon: FaInfoCircle }
    ];

    return (
        <div className="space-y-6">
            {/* Application Header */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">{application.visaType}</h2>
                            <p className="text-base-content/70">Application #{application.applicationNumber}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`badge ${statusColors[application.status]} badge-lg gap-2`}>
                                {React.createElement(statusIcons[application.status], { className: "w-4 h-4" })}
                                {application.status.replace('_', ' ')}
                            </div>
                            {canEdit && (
                                <button className="btn btn-primary" onClick={onEdit}>
                                    <FaEdit className="mr-2" />
                                    Edit Application
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs tabs-boxed">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <Icon className="mr-2" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    {activeTab === 'personal' && (
                        <PersonalInfoView personalInfo={application.personalInfo} />
                    )}
                    {activeTab === 'contact' && (
                        <ContactInfoView contactInfo={application.contactInfo} />
                    )}
                    {activeTab === 'visa' && (
                        <VisaDetailsView visaDetails={application.visaDetails} />
                    )}
                    {activeTab === 'travel' && (
                        <TravelDetailsView travelDetails={application.travelDetails} />
                    )}
                    {activeTab === 'documents' && (
                        <DocumentsView 
                            documents={application.documents} 
                            onDownload={onDownloadDocument}
                        />
                    )}
                    {activeTab === 'status' && (
                        <StatusView 
                            status={application.status}
                            comments={application.reviewComments}
                            submittedAt={application.submittedAt}
                            lastUpdated={application.lastUpdated}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

// View Components
const PersonalInfoView = ({ personalInfo }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoField label="First Name" value={personalInfo.firstName} icon={FaUser} />
        <InfoField label="Last Name" value={personalInfo.lastName} icon={FaUser} />
        <InfoField label="Date of Birth" value={new Date(personalInfo.dateOfBirth).toLocaleDateString()} icon={FaCalendarAlt} />
        <InfoField label="Nationality" value={personalInfo.nationality} icon={FaGlobe} />
        <InfoField label="Passport Number" value={personalInfo.passportNumber} icon={FaPassport} />
        <InfoField label="Passport Expiry" value={new Date(personalInfo.passportExpiry).toLocaleDateString()} icon={FaCalendarAlt} />
        <InfoField label="Marital Status" value={personalInfo.maritalStatus} icon={FaHeart} />
        <InfoField label="Education" value={personalInfo.education} icon={FaGraduationCap} />
        <InfoField label="Occupation" value={personalInfo.occupation} icon={FaBriefcase} />
    </div>
);

const ContactInfoView = ({ contactInfo }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoField label="Email" value={contactInfo.email} icon={FaEnvelope} />
        <InfoField label="Phone Number" value={contactInfo.phoneNumber} icon={FaPhone} />
        <InfoField label="Address" value={contactInfo.address} icon={FaHome} className="md:col-span-2" />
        <InfoField label="City" value={contactInfo.city} icon={FaMapMarkerAlt} />
        <InfoField label="Country" value={contactInfo.country} icon={FaGlobe} />
        <InfoField label="Postal Code" value={contactInfo.postalCode} icon={FaIdCard} />
    </div>
);

const VisaDetailsView = ({ visaDetails }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoField label="Purpose of Visit" value={visaDetails.purposeOfVisit} icon={FaInfoCircle} />
        <InfoField label="Intended Duration" value={visaDetails.intendedDuration} icon={FaClock} />
        <InfoField label="Entry Date" value={new Date(visaDetails.entryDate).toLocaleDateString()} icon={FaCalendarAlt} />
        <InfoField label="Exit Date" value={new Date(visaDetails.exitDate).toLocaleDateString()} icon={FaCalendarAlt} />
        <InfoField label="Previous Visits" value={visaDetails.previousVisits ? 'Yes' : 'No'} icon={FaInfoCircle} />
        <InfoField label="Sponsor Info" value={visaDetails.sponsorInfo} icon={FaUser} className="md:col-span-2" />
    </div>
);

const TravelDetailsView = ({ travelDetails }) => (
    <div className="space-y-4">
        <InfoField label="Flight Details" value={travelDetails.flightDetails} icon={FaPlane} />
        <InfoField label="Accommodation Info" value={travelDetails.accommodationInfo} icon={FaHome} />
        <InfoField label="Travel Itinerary" value={travelDetails.travelItinerary} icon={FaMapMarkerAlt} />
        <InfoField label="Emergency Contact" value={travelDetails.emergencyContact} icon={FaPhone} />
    </div>
);

const DocumentsView = ({ documents, onDownload }) => (
    <div className="space-y-4">
        {documents.length === 0 ? (
            <div className="text-center py-8">
                <FaFileAlt className="text-4xl text-base-content/30 mx-auto mb-4" />
                <p className="text-base-content/70">No documents uploaded</p>
            </div>
        ) : (
            documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                        <FaFileAlt className="text-primary mr-3" />
                        <div>
                            <p className="font-medium">{doc.fileName}</p>
                            <p className="text-sm text-base-content/70">
                                Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <button
                        className="btn btn-sm btn-outline"
                        onClick={() => onDownload(doc.id, doc.fileName)}
                    >
                        <FaDownload />
                    </button>
                </div>
            ))
        )}
    </div>
);

const StatusView = ({ status, comments, submittedAt, lastUpdated }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoField 
                label="Current Status" 
                value={status.replace('_', ' ')} 
                icon={statusIcons[status]} 
            />
            <InfoField 
                label="Last Updated" 
                value={new Date(lastUpdated).toLocaleString()} 
                icon={FaClock} 
            />
            {submittedAt && (
                <InfoField 
                    label="Submitted At" 
                    value={new Date(submittedAt).toLocaleString()} 
                    icon={FaCalendarAlt} 
                />
            )}
        </div>

        {comments && comments.length > 0 && (
            <div>
                <h3 className="text-lg font-semibold mb-4">Review Comments</h3>
                <div className="space-y-3">
                    {comments.map((comment) => (
                        <div key={comment.id} className="bg-base-200 p-4 rounded-lg">
                            <p className="mb-2">{comment.comment}</p>
                            <div className="flex items-center justify-between text-sm text-base-content/70">
                                <span>By: {comment.createdBy}</span>
                                <span>{new Date(comment.createdAt).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);

const InfoField = ({ label, value, icon: Icon, className = "" }) => (
    <div className={`form-control ${className}`}>
        <label className="label">
            <span className="label-text flex items-center">
                <Icon className="mr-2 text-primary" />
                {label}
            </span>
        </label>
        <div className="input input-bordered bg-base-200 cursor-default">
            {value || 'Not provided'}
        </div>
    </div>
);

// Application Edit Component (simplified - would need full form implementation)
const ApplicationEdit = ({ application, onSave, onCancel }) => {
    // This would contain the full edit form similar to visa-form.jsx
    // For brevity, showing a simplified version
    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">Edit Application</h2>
                <p className="text-base-content/70 mb-6">
                    This would contain the full editable form similar to the visa application form.
                    For now, redirecting to the visa form with pre-filled data.
                </p>
                <div className="flex gap-4">
                    <button 
                        className="btn btn-primary"
                        onClick={() => {
                            // Redirect to visa form with application data
                            window.location.href = `/visitor/visa-form?edit=${application.id}`;
                        }}
                    >
                        Open in Form Editor
                    </button>
                    <button className="btn btn-outline" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VisitorApplications;