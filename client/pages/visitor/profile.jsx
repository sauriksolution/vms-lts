import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Formik } from "formik";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useAlert } from 'react-alert';

import { 
    FaUser, FaEdit, FaSave, FaArrowLeft, FaPhone, FaEnvelope, 
    FaMapMarkerAlt, FaPassport, FaCalendarAlt, FaGlobe, FaIdCard,
    FaLock, FaEye, FaEyeSlash, FaCamera, FaTrash
} from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsPersonFill } from "react-icons/bs";

import Layout from "../../components/Layout";
import { useAuth } from "../../store/authStore";

const VisitorProfile = () => {
    const router = useRouter();
    const alert = useAlert();
    const { decodedToken } = useAuth();
    
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [profileImage, setProfileImage] = useState(null);

    const countries = [
        "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria", "Bangladesh", 
        "Belgium", "Brazil", "Canada", "China", "Denmark", "Egypt", "France", "Germany", 
        "India", "Indonesia", "Italy", "Japan", "Mexico", "Netherlands", "Nigeria", "Pakistan", 
        "Philippines", "Russia", "Saudi Arabia", "South Africa", "Spain", "Sweden", "Switzerland", 
        "Thailand", "Turkey", "United Kingdom", "United States", "Vietnam"
    ];

    const maritalStatuses = ["Single", "Married", "Divorced", "Widowed", "Separated"];
    const educationLevels = ["High School", "Bachelor's Degree", "Master's Degree", "PhD", "Other"];

    // Queries and Mutations
    const { data: profileData, loading: profileLoading, refetch } = useQuery(gql`
        query GetVisitorProfile {
            visitorProfile {
                id
                firstName
                lastName
                email
                phoneNumber
                dateOfBirth
                nationality
                passportNumber
                passportExpiry
                maritalStatus
                education
                occupation
                address
                city
                country
                postalCode
                profileImage
                emergencyContact {
                    name
                    phone
                    relationship
                }
                createdAt
                updatedAt
            }
        }
    `);

    const [updateProfile] = useMutation(gql`
        mutation UpdateVisitorProfile($input: VisitorProfileInput!) {
            updateVisitorProfile(input: $input) {
                success
                message
                profile {
                    id
                    firstName
                    lastName
                    email
                }
            }
        }
    `);

    const [changePassword] = useMutation(gql`
        mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
            changePassword(currentPassword: $currentPassword, newPassword: $newPassword) {
                success
                message
            }
        }
    `);

    const [uploadProfileImage] = useMutation(gql`
        mutation UploadProfileImage($file: Upload!) {
            uploadProfileImage(file: $file) {
                success
                message
                imageUrl
            }
        }
    `);

    const [deleteAccount] = useMutation(gql`
        mutation DeleteVisitorAccount($password: String!) {
            deleteVisitorAccount(password: $password) {
                success
                message
            }
        }
    `);

    const handleImageUpload = async (file) => {
        try {
            const result = await uploadProfileImage({
                variables: { file }
            });

            if (result.data?.uploadProfileImage?.success) {
                setProfileImage(result.data.uploadProfileImage.imageUrl);
                alert.success("Profile image updated successfully");
                refetch();
            }
        } catch (error) {
            console.error("Image upload error:", error);
            alert.error("Failed to upload image");
        }
    };

    const getInitialValues = () => {
        if (profileData?.visitorProfile) {
            const profile = profileData.visitorProfile;
            return {
                firstName: profile.firstName || "",
                lastName: profile.lastName || "",
                email: profile.email || "",
                phoneNumber: profile.phoneNumber || "",
                dateOfBirth: profile.dateOfBirth || "",
                nationality: profile.nationality || "",
                passportNumber: profile.passportNumber || "",
                passportExpiry: profile.passportExpiry || "",
                maritalStatus: profile.maritalStatus || "",
                education: profile.education || "",
                occupation: profile.occupation || "",
                address: profile.address || "",
                city: profile.city || "",
                country: profile.country || "",
                postalCode: profile.postalCode || "",
                emergencyContactName: profile.emergencyContact?.name || "",
                emergencyContactPhone: profile.emergencyContact?.phone || "",
                emergencyContactRelationship: profile.emergencyContact?.relationship || "",
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            };
        }
        
        return {
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            dateOfBirth: "",
            nationality: "",
            passportNumber: "",
            passportExpiry: "",
            maritalStatus: "",
            education: "",
            occupation: "",
            address: "",
            city: "",
            country: "",
            postalCode: "",
            emergencyContactName: "",
            emergencyContactPhone: "",
            emergencyContactRelationship: "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        };
    };

    if (profileLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[80vh]">
                    <div className="text-center">
                        <AiOutlineLoading3Quarters className="text-4xl text-primary animate-spin mx-auto mb-4" />
                        <p className="text-lg">Loading profile...</p>
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
                        <button
                            className="btn btn-ghost mr-4"
                            onClick={() => router.push('/visitor/dashboard')}
                        >
                            <FaArrowLeft />
                        </button>
                        <div className="flex items-center">
                            <FaUser className="text-3xl text-primary mr-3" />
                            <div>
                                <h1 className="text-3xl font-bold text-primary">My Profile</h1>
                                <p className="text-base-content/70">Manage your personal information and settings</p>
                            </div>
                        </div>
                    </div>
                    <button
                        className={`btn ${isEditing ? 'btn-success' : 'btn-primary'}`}
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? (
                            <>
                                <FaSave className="mr-2" />
                                Save Changes
                            </>
                        ) : (
                            <>
                                <FaEdit className="mr-2" />
                                Edit Profile
                            </>
                        )}
                    </button>
                </div>

                {/* Profile Image Section */}
                <div className="card bg-base-100 shadow-xl mb-6">
                    <div className="card-body">
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <div className="avatar">
                                    <div className="w-24 h-24 rounded-full">
                                        {profileImage || profileData?.visitorProfile?.profileImage ? (
                                            <img 
                                                src={profileImage || profileData.visitorProfile.profileImage} 
                                                alt="Profile" 
                                                className="rounded-full"
                                            />
                                        ) : (
                                            <div className="bg-primary text-primary-content flex items-center justify-center text-2xl font-bold">
                                                {profileData?.visitorProfile?.firstName?.charAt(0) || 'V'}
                                                {profileData?.visitorProfile?.lastName?.charAt(0) || 'U'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {isEditing && (
                                    <label className="absolute bottom-0 right-0 btn btn-circle btn-sm btn-primary cursor-pointer">
                                        <FaCamera />
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    handleImageUpload(file);
                                                }
                                            }}
                                        />
                                    </label>
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">
                                    {profileData?.visitorProfile?.firstName} {profileData?.visitorProfile?.lastName}
                                </h2>
                                <p className="text-base-content/70">{profileData?.visitorProfile?.email}</p>
                                <p className="text-sm text-base-content/50">
                                    Member since {new Date(profileData?.visitorProfile?.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs tabs-boxed mb-6">
                    <button 
                        className={`tab ${activeTab === 'personal' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('personal')}
                    >
                        <BsPersonFill className="mr-2" />
                        Personal Info
                    </button>
                    <button 
                        className={`tab ${activeTab === 'contact' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('contact')}
                    >
                        <FaPhone className="mr-2" />
                        Contact Info
                    </button>
                    <button 
                        className={`tab ${activeTab === 'security' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        <FaLock className="mr-2" />
                        Security
                    </button>
                </div>

                <Formik
                    initialValues={getInitialValues()}
                    enableReinitialize={true}
                    onSubmit={async (values, { setSubmitting }) => {
                        try {
                            if (activeTab === 'security' && showPasswordFields) {
                                // Handle password change
                                if (values.newPassword !== values.confirmPassword) {
                                    alert.error("New passwords don't match");
                                    return;
                                }

                                const result = await changePassword({
                                    variables: {
                                        currentPassword: values.currentPassword,
                                        newPassword: values.newPassword
                                    }
                                });

                                if (result.data?.changePassword?.success) {
                                    alert.success("Password changed successfully");
                                    setShowPasswordFields(false);
                                    values.currentPassword = "";
                                    values.newPassword = "";
                                    values.confirmPassword = "";
                                }
                            } else {
                                // Handle profile update
                                const input = {
                                    firstName: values.firstName,
                                    lastName: values.lastName,
                                    email: values.email,
                                    phoneNumber: values.phoneNumber,
                                    dateOfBirth: values.dateOfBirth,
                                    nationality: values.nationality,
                                    passportNumber: values.passportNumber,
                                    passportExpiry: values.passportExpiry,
                                    maritalStatus: values.maritalStatus,
                                    education: values.education,
                                    occupation: values.occupation,
                                    address: values.address,
                                    city: values.city,
                                    country: values.country,
                                    postalCode: values.postalCode,
                                    emergencyContact: {
                                        name: values.emergencyContactName,
                                        phone: values.emergencyContactPhone,
                                        relationship: values.emergencyContactRelationship
                                    }
                                };

                                const result = await updateProfile({
                                    variables: { input }
                                });

                                if (result.data?.updateVisitorProfile?.success) {
                                    alert.success("Profile updated successfully");
                                    setIsEditing(false);
                                    refetch();
                                }
                            }
                        } catch (error) {
                            console.error("Update error:", error);
                            alert.error("Failed to update profile");
                        }
                        setSubmitting(false);
                    }}
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        setFieldValue,
                        isSubmitting,
                    }) => (
                        <motion.form
                            onSubmit={handleSubmit}
                            className="max-w-4xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    {/* Personal Information Tab */}
                                    {activeTab === 'personal' && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <h2 className="card-title mb-6">
                                                <BsPersonFill className="text-primary" />
                                                Personal Information
                                            </h2>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">First Name</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="firstName"
                                                        className="input input-bordered"
                                                        placeholder="Enter first name"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.firstName}
                                                        disabled={!isEditing}
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Last Name</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="lastName"
                                                        className="input input-bordered"
                                                        placeholder="Enter last name"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.lastName}
                                                        disabled={!isEditing}
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Date of Birth</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        name="dateOfBirth"
                                                        className="input input-bordered"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.dateOfBirth}
                                                        disabled={!isEditing}
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Nationality</span>
                                                    </label>
                                                    <select
                                                        name="nationality"
                                                        className="select select-bordered"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.nationality}
                                                        disabled={!isEditing}
                                                    >
                                                        <option value="">Select nationality</option>
                                                        {countries.map((country) => (
                                                            <option key={country} value={country}>
                                                                {country}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Passport Number</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="passportNumber"
                                                        className="input input-bordered"
                                                        placeholder="Enter passport number"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.passportNumber}
                                                        disabled={!isEditing}
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Passport Expiry Date</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        name="passportExpiry"
                                                        className="input input-bordered"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.passportExpiry}
                                                        disabled={!isEditing}
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Marital Status</span>
                                                    </label>
                                                    <select
                                                        name="maritalStatus"
                                                        className="select select-bordered"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.maritalStatus}
                                                        disabled={!isEditing}
                                                    >
                                                        <option value="">Select status</option>
                                                        {maritalStatuses.map((status) => (
                                                            <option key={status} value={status}>
                                                                {status}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Education Level</span>
                                                    </label>
                                                    <select
                                                        name="education"
                                                        className="select select-bordered"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.education}
                                                        disabled={!isEditing}
                                                    >
                                                        <option value="">Select education</option>
                                                        {educationLevels.map((level) => (
                                                            <option key={level} value={level}>
                                                                {level}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="form-control md:col-span-2">
                                                    <label className="label">
                                                        <span className="label-text">Occupation</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="occupation"
                                                        className="input input-bordered"
                                                        placeholder="Enter your occupation"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.occupation}
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Contact Information Tab */}
                                    {activeTab === 'contact' && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <h2 className="card-title mb-6">
                                                <FaPhone className="text-primary" />
                                                Contact Information
                                            </h2>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Email Address</span>
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        className="input input-bordered"
                                                        placeholder="Enter email address"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.email}
                                                        disabled={!isEditing}
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Phone Number</span>
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        name="phoneNumber"
                                                        className="input input-bordered"
                                                        placeholder="+1 (555) 123-4567"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.phoneNumber}
                                                        disabled={!isEditing}
                                                    />
                                                </div>

                                                <div className="form-control md:col-span-2">
                                                    <label className="label">
                                                        <span className="label-text">Address</span>
                                                    </label>
                                                    <textarea
                                                        name="address"
                                                        className="textarea textarea-bordered"
                                                        placeholder="Enter full address"
                                                        rows="3"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.address}
                                                        disabled={!isEditing}
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">City</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        className="input input-bordered"
                                                        placeholder="Enter city"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.city}
                                                        disabled={!isEditing}
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Country</span>
                                                    </label>
                                                    <select
                                                        name="country"
                                                        className="select select-bordered"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.country}
                                                        disabled={!isEditing}
                                                    >
                                                        <option value="">Select country</option>
                                                        {countries.map((country) => (
                                                            <option key={country} value={country}>
                                                                {country}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Postal Code</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="postalCode"
                                                        className="input input-bordered"
                                                        placeholder="Enter postal code"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.postalCode}
                                                        disabled={!isEditing}
                                                    />
                                                </div>

                                                {/* Emergency Contact */}
                                                <div className="md:col-span-2">
                                                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                                                        <FaPhone className="mr-2 text-primary" />
                                                        Emergency Contact
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="form-control">
                                                            <label className="label">
                                                                <span className="label-text">Name</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="emergencyContactName"
                                                                className="input input-bordered"
                                                                placeholder="Contact name"
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                value={values.emergencyContactName}
                                                                disabled={!isEditing}
                                                            />
                                                        </div>

                                                        <div className="form-control">
                                                            <label className="label">
                                                                <span className="label-text">Phone</span>
                                                            </label>
                                                            <input
                                                                type="tel"
                                                                name="emergencyContactPhone"
                                                                className="input input-bordered"
                                                                placeholder="Contact phone"
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                value={values.emergencyContactPhone}
                                                                disabled={!isEditing}
                                                            />
                                                        </div>

                                                        <div className="form-control">
                                                            <label className="label">
                                                                <span className="label-text">Relationship</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="emergencyContactRelationship"
                                                                className="input input-bordered"
                                                                placeholder="Relationship"
                                                                onChange={handleChange}
                                                                onBlur={handleBlur}
                                                                value={values.emergencyContactRelationship}
                                                                disabled={!isEditing}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Security Tab */}
                                    {activeTab === 'security' && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <h2 className="card-title mb-6">
                                                <FaLock className="text-primary" />
                                                Security Settings
                                            </h2>
                                            
                                            <div className="space-y-6">
                                                {/* Password Change Section */}
                                                <div className="card bg-base-200">
                                                    <div className="card-body">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div>
                                                                <h3 className="text-lg font-semibold">Change Password</h3>
                                                                <p className="text-sm text-base-content/70">
                                                                    Update your password to keep your account secure
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="btn btn-outline btn-sm"
                                                                onClick={() => setShowPasswordFields(!showPasswordFields)}
                                                            >
                                                                {showPasswordFields ? 'Cancel' : 'Change Password'}
                                                            </button>
                                                        </div>

                                                        {showPasswordFields && (
                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                                <div className="form-control">
                                                                    <label className="label">
                                                                        <span className="label-text">Current Password</span>
                                                                    </label>
                                                                    <div className="relative">
                                                                        <input
                                                                            type={showCurrentPassword ? "text" : "password"}
                                                                            name="currentPassword"
                                                                            className="input input-bordered pr-10"
                                                                            placeholder="Enter current password"
                                                                            onChange={handleChange}
                                                                            onBlur={handleBlur}
                                                                            value={values.currentPassword}
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                                        >
                                                                            {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <div className="form-control">
                                                                    <label className="label">
                                                                        <span className="label-text">New Password</span>
                                                                    </label>
                                                                    <div className="relative">
                                                                        <input
                                                                            type={showNewPassword ? "text" : "password"}
                                                                            name="newPassword"
                                                                            className="input input-bordered pr-10"
                                                                            placeholder="Enter new password"
                                                                            onChange={handleChange}
                                                                            onBlur={handleBlur}
                                                                            value={values.newPassword}
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                                                        >
                                                                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <div className="form-control">
                                                                    <label className="label">
                                                                        <span className="label-text">Confirm Password</span>
                                                                    </label>
                                                                    <input
                                                                        type="password"
                                                                        name="confirmPassword"
                                                                        className="input input-bordered"
                                                                        placeholder="Confirm new password"
                                                                        onChange={handleChange}
                                                                        onBlur={handleBlur}
                                                                        value={values.confirmPassword}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Account Deletion Section */}
                                                <div className="card bg-error/10 border border-error/20">
                                                    <div className="card-body">
                                                        <h3 className="text-lg font-semibold text-error">Danger Zone</h3>
                                                        <p className="text-sm text-base-content/70 mb-4">
                                                            Once you delete your account, there is no going back. Please be certain.
                                                        </p>
                                                        <button
                                                            type="button"
                                                            className="btn btn-error btn-outline btn-sm w-fit"
                                                            onClick={() => {
                                                                if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                                                                    const password = prompt("Please enter your password to confirm:");
                                                                    if (password) {
                                                                        deleteAccount({ variables: { password } })
                                                                            .then(() => {
                                                                                alert.success("Account deleted successfully");
                                                                                router.push('/login');
                                                                            })
                                                                            .catch(() => {
                                                                                alert.error("Failed to delete account");
                                                                            });
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            <FaTrash className="mr-2" />
                                                            Delete Account
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Submit Button */}
                                    {isEditing && activeTab !== 'security' && (
                                        <div className="flex justify-end mt-8">
                                            <button
                                                type="submit"
                                                className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <span className="loading loading-spinner"></span>
                                                ) : (
                                                    <>
                                                        <FaSave className="mr-2" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}

                                    {showPasswordFields && (
                                        <div className="flex justify-end mt-8">
                                            <button
                                                type="submit"
                                                className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <span className="loading loading-spinner"></span>
                                                ) : (
                                                    <>
                                                        <FaLock className="mr-2" />
                                                        Update Password
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.form>
                    )}
                </Formik>
            </div>
        </Layout>
    );
};

export default VisitorProfile;