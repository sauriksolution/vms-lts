import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Formik } from "formik";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useAlert } from 'react-alert';

import { 
    FaPassport, FaPlane, FaCalendarAlt, FaUser, FaHome, FaBuilding,
    FaMoneyBillWave, FaFileUpload, FaSave, FaArrowLeft, FaGlobe,
    FaIdCard, FaPhone, FaEnvelope, FaMapMarkerAlt, FaUsers, FaHeart
} from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BsCalendarDate, BsPersonFill } from "react-icons/bs";

import Layout from "../../components/Layout";
import { useAuth } from "../../store/authStore";

const VisaForm = () => {
    const router = useRouter();
    const alert = useAlert();
    const { decodedToken } = useAuth();
    const { edit } = router.query;
    
    const [currentStep, setCurrentStep] = useState(1);
    const [uploadedFiles, setUploadedFiles] = useState({});
    const [isEditing, setIsEditing] = useState(false);

    const visaTypes = [
        { value: "tourist", label: "Tourist Visa", description: "For leisure and sightseeing" },
        { value: "business", label: "Business Visa", description: "For business meetings and conferences" },
        { value: "student", label: "Student Visa", description: "For educational purposes" },
        { value: "work", label: "Work Visa", description: "For employment opportunities" },
        { value: "transit", label: "Transit Visa", description: "For passing through the country" },
        { value: "medical", label: "Medical Visa", description: "For medical treatment" },
        { value: "family", label: "Family Visit Visa", description: "For visiting family members" }
    ];

    const countries = [
        "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria", "Bangladesh", 
        "Belgium", "Brazil", "Canada", "China", "Denmark", "Egypt", "France", "Germany", 
        "India", "Indonesia", "Italy", "Japan", "Mexico", "Netherlands", "Nigeria", "Pakistan", 
        "Philippines", "Russia", "Saudi Arabia", "South Africa", "Spain", "Sweden", "Switzerland", 
        "Thailand", "Turkey", "United Kingdom", "United States", "Vietnam"
    ];

    const maritalStatuses = ["Single", "Married", "Divorced", "Widowed", "Separated"];
    const educationLevels = ["High School", "Bachelor's Degree", "Master's Degree", "PhD", "Other"];
    const employmentStatuses = ["Employed", "Self-Employed", "Unemployed", "Student", "Retired"];

    // Queries and Mutations
    const { data: applicationData, loading: applicationLoading } = useQuery(gql`
        query GetVisaApplication($id: ID!) {
            visaApplication(id: $id) {
                id
                applicationType
                status
                personalInfo {
                    purpose
                    duration
                    arrivalDate
                    departureDate
                    accommodation
                    financialSupport
                    previousVisits
                    emergencyContact
                }
                travelDetails {
                    entryPoint
                    exitPoint
                    transportMode
                    flightDetails
                    travelItinerary
                }
                documents {
                    id
                    fileName
                    fileType
                    uploadedAt
                }
            }
        }
    `, {
        variables: { id: edit },
        skip: !edit
    });

    const [submitApplication] = useMutation(gql`
        mutation SubmitVisaApplication($input: VisaApplicationInput!) {
            submitVisaApplication(input: $input) {
                success
                message
                applicationId
            }
        }
    `);

    const [updateApplication] = useMutation(gql`
        mutation UpdateVisaApplication($id: ID!, $input: VisaApplicationInput!) {
            updateVisaApplication(id: $id, input: $input) {
                success
                message
            }
        }
    `);

    const [uploadDocument] = useMutation(gql`
        mutation UploadDocument($file: Upload!, $applicationId: ID!) {
            uploadDocument(file: $file, applicationId: $applicationId) {
                success
                message
                document {
                    id
                    fileName
                    fileType
                }
            }
        }
    `);

    useEffect(() => {
        if (edit && applicationData) {
            setIsEditing(true);
        }
    }, [edit, applicationData]);

    const handleFileUpload = async (file, fieldName, setFieldValue) => {
        try {
            const result = await uploadDocument({
                variables: {
                    file,
                    applicationId: edit || 'temp'
                }
            });

            if (result.data?.uploadDocument?.success) {
                const document = result.data.uploadDocument.document;
                setUploadedFiles(prev => ({
                    ...prev,
                    [fieldName]: document
                }));
                setFieldValue(fieldName, document.id);
                alert.success(`${document.fileName} uploaded successfully`);
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert.error("File upload failed");
        }
    };

    const validateStep = (values, step) => {
        const errors = {};
        
        switch (step) {
            case 1: // Personal Information
                if (!values.firstName) errors.firstName = "First name is required";
                if (!values.lastName) errors.lastName = "Last name is required";
                if (!values.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
                if (!values.nationality) errors.nationality = "Nationality is required";
                if (!values.passportNumber) errors.passportNumber = "Passport number is required";
                if (!values.passportExpiry) errors.passportExpiry = "Passport expiry is required";
                if (!values.maritalStatus) errors.maritalStatus = "Marital status is required";
                break;
                
            case 2: // Contact Information
                if (!values.email) errors.email = "Email is required";
                if (!values.phoneNumber) errors.phoneNumber = "Phone number is required";
                if (!values.address) errors.address = "Address is required";
                if (!values.city) errors.city = "City is required";
                if (!values.country) errors.country = "Country is required";
                break;
                
            case 3: // Visa Details
                if (!values.visaType) errors.visaType = "Visa type is required";
                if (!values.purpose) errors.purpose = "Purpose of visit is required";
                if (!values.duration) errors.duration = "Duration is required";
                if (!values.arrivalDate) errors.arrivalDate = "Arrival date is required";
                if (!values.departureDate) errors.departureDate = "Departure date is required";
                break;
                
            case 4: // Travel Details
                if (!values.entryPoint) errors.entryPoint = "Entry point is required";
                if (!values.accommodation) errors.accommodation = "Accommodation details are required";
                if (!values.financialSupport) errors.financialSupport = "Financial support information is required";
                break;
        }
        
        return errors;
    };

    const nextStep = (values) => {
        const errors = validateStep(values, currentStep);
        if (Object.keys(errors).length === 0) {
            setCurrentStep(prev => Math.min(prev + 1, 5));
        } else {
            alert.error("Please fill in all required fields");
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const getInitialValues = () => {
        if (isEditing && applicationData?.visaApplication) {
            const app = applicationData.visaApplication;
            return {
                // Personal Information
                firstName: "",
                lastName: "",
                dateOfBirth: "",
                nationality: "",
                passportNumber: "",
                passportExpiry: "",
                maritalStatus: "",
                education: "",
                occupation: "",
                
                // Contact Information
                email: "",
                phoneNumber: "",
                address: "",
                city: "",
                country: "",
                postalCode: "",
                emergencyContactName: app.personalInfo?.emergencyContact?.name || "",
                emergencyContactPhone: app.personalInfo?.emergencyContact?.phone || "",
                
                // Visa Details
                visaType: app.applicationType || "",
                purpose: app.personalInfo?.purpose || "",
                duration: app.personalInfo?.duration || "",
                arrivalDate: app.personalInfo?.arrivalDate || "",
                departureDate: app.personalInfo?.departureDate || "",
                previousVisits: app.personalInfo?.previousVisits || "",
                
                // Travel Details
                entryPoint: app.travelDetails?.entryPoint || "",
                exitPoint: app.travelDetails?.exitPoint || "",
                transportMode: app.travelDetails?.transportMode || "",
                flightDetails: app.travelDetails?.flightDetails || "",
                accommodation: app.personalInfo?.accommodation || "",
                financialSupport: app.personalInfo?.financialSupport || "",
                travelItinerary: app.travelDetails?.travelItinerary || "",
                
                // Documents
                passportCopy: "",
                photograph: "",
                financialDocuments: "",
                accommodationProof: "",
                travelInsurance: "",
                additionalDocuments: ""
            };
        }
        
        return {
            // Personal Information
            firstName: "",
            lastName: "",
            dateOfBirth: "",
            nationality: "",
            passportNumber: "",
            passportExpiry: "",
            maritalStatus: "",
            education: "",
            occupation: "",
            
            // Contact Information
            email: "",
            phoneNumber: "",
            address: "",
            city: "",
            country: "",
            postalCode: "",
            emergencyContactName: "",
            emergencyContactPhone: "",
            
            // Visa Details
            visaType: "",
            purpose: "",
            duration: "",
            arrivalDate: "",
            departureDate: "",
            previousVisits: "",
            
            // Travel Details
            entryPoint: "",
            exitPoint: "",
            transportMode: "air",
            flightDetails: "",
            accommodation: "",
            financialSupport: "",
            travelItinerary: "",
            
            // Documents
            passportCopy: "",
            photograph: "",
            financialDocuments: "",
            accommodationProof: "",
            travelInsurance: "",
            additionalDocuments: ""
        };
    };

    if (applicationLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[80vh]">
                    <div className="text-center">
                        <AiOutlineLoading3Quarters className="text-4xl text-primary animate-spin mx-auto mb-4" />
                        <p className="text-lg">Loading application...</p>
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
                            <FaPassport className="text-3xl text-primary mr-3" />
                            <div>
                                <h1 className="text-3xl font-bold text-primary">
                                    {isEditing ? 'Edit VISA Application' : 'VISA Application Form'}
                                </h1>
                                <p className="text-base-content/70">Complete all sections to submit your application</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="steps steps-horizontal w-full mb-8">
                    <div className={`step ${currentStep >= 1 ? 'step-primary' : ''}`}>Personal Info</div>
                    <div className={`step ${currentStep >= 2 ? 'step-primary' : ''}`}>Contact</div>
                    <div className={`step ${currentStep >= 3 ? 'step-primary' : ''}`}>Visa Details</div>
                    <div className={`step ${currentStep >= 4 ? 'step-primary' : ''}`}>Travel Info</div>
                    <div className={`step ${currentStep >= 5 ? 'step-primary' : ''}`}>Documents</div>
                </div>

                <Formik
                    initialValues={getInitialValues()}
                    onSubmit={async (values, { setSubmitting }) => {
                        try {
                            const input = {
                                applicationType: values.visaType,
                                personalInfo: {
                                    purpose: values.purpose,
                                    duration: values.duration,
                                    arrivalDate: values.arrivalDate,
                                    departureDate: values.departureDate,
                                    accommodation: values.accommodation,
                                    financialSupport: values.financialSupport,
                                    previousVisits: values.previousVisits,
                                    emergencyContact: {
                                        name: values.emergencyContactName,
                                        phone: values.emergencyContactPhone
                                    }
                                },
                                travelDetails: {
                                    entryPoint: values.entryPoint,
                                    exitPoint: values.exitPoint,
                                    transportMode: values.transportMode,
                                    flightDetails: values.flightDetails,
                                    travelItinerary: values.travelItinerary
                                },
                                applicantInfo: {
                                    firstName: values.firstName,
                                    lastName: values.lastName,
                                    dateOfBirth: values.dateOfBirth,
                                    nationality: values.nationality,
                                    passportNumber: values.passportNumber,
                                    passportExpiry: values.passportExpiry,
                                    maritalStatus: values.maritalStatus,
                                    education: values.education,
                                    occupation: values.occupation,
                                    email: values.email,
                                    phoneNumber: values.phoneNumber,
                                    address: values.address,
                                    city: values.city,
                                    country: values.country,
                                    postalCode: values.postalCode
                                }
                            };

                            let result;
                            if (isEditing) {
                                result = await updateApplication({
                                    variables: { id: edit, input }
                                });
                                if (result.data?.updateVisaApplication?.success) {
                                    alert.success("Application updated successfully");
                                    router.push('/visitor/dashboard');
                                }
                            } else {
                                result = await submitApplication({
                                    variables: { input }
                                });
                                if (result.data?.submitVisaApplication?.success) {
                                    alert.success("Application submitted successfully");
                                    router.push('/visitor/dashboard');
                                }
                            }
                        } catch (error) {
                            console.error("Submit error:", error);
                            alert.error("Failed to submit application");
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
                                    {/* Step 1: Personal Information */}
                                    {currentStep === 1 && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                        >
                                            <h2 className="card-title mb-6">
                                                <FaUser className="text-primary" />
                                                Personal Information
                                            </h2>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">First Name *</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="firstName"
                                                        className="input input-bordered"
                                                        placeholder="Enter first name"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.firstName}
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Last Name *</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="lastName"
                                                        className="input input-bordered"
                                                        placeholder="Enter last name"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.lastName}
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Date of Birth *</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        name="dateOfBirth"
                                                        className="input input-bordered"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.dateOfBirth}
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Nationality *</span>
                                                    </label>
                                                    <select
                                                        name="nationality"
                                                        className="select select-bordered"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.nationality}
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
                                                        <span className="label-text">Passport Number *</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="passportNumber"
                                                        className="input input-bordered"
                                                        placeholder="Enter passport number"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.passportNumber}
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Passport Expiry Date *</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        name="passportExpiry"
                                                        className="input input-bordered"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.passportExpiry}
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Marital Status *</span>
                                                    </label>
                                                    <select
                                                        name="maritalStatus"
                                                        className="select select-bordered"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.maritalStatus}
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
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 2: Contact Information */}
                                    {currentStep === 2 && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                        >
                                            <h2 className="card-title mb-6">
                                                <FaPhone className="text-primary" />
                                                Contact Information
                                            </h2>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Email Address *</span>
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        className="input input-bordered"
                                                        placeholder="Enter email address"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.email}
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Phone Number *</span>
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        name="phoneNumber"
                                                        className="input input-bordered"
                                                        placeholder="+1 (555) 123-4567"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.phoneNumber}
                                                    />
                                                </div>

                                                <div className="form-control md:col-span-2">
                                                    <label className="label">
                                                        <span className="label-text">Address *</span>
                                                    </label>
                                                    <textarea
                                                        name="address"
                                                        className="textarea textarea-bordered"
                                                        placeholder="Enter full address"
                                                        rows="3"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.address}
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">City *</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        className="input input-bordered"
                                                        placeholder="Enter city"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.city}
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Country *</span>
                                                    </label>
                                                    <select
                                                        name="country"
                                                        className="select select-bordered"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.country}
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
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Emergency Contact Name</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="emergencyContactName"
                                                        className="input input-bordered"
                                                        placeholder="Enter emergency contact name"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.emergencyContactName}
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Emergency Contact Phone</span>
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        name="emergencyContactPhone"
                                                        className="input input-bordered"
                                                        placeholder="Enter emergency contact phone"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.emergencyContactPhone}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 3: Visa Details */}
                                    {currentStep === 3 && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                        >
                                            <h2 className="card-title mb-6">
                                                <FaPassport className="text-primary" />
                                                Visa Details
                                            </h2>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="form-control md:col-span-2">
                                                    <label className="label">
                                                        <span className="label-text">Visa Type *</span>
                                                    </label>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {visaTypes.map((type) => (
                                                            <div
                                                                key={type.value}
                                                                className={`card cursor-pointer transition-all ${
                                                                    values.visaType === type.value
                                                                        ? 'bg-primary text-primary-content'
                                                                        : 'bg-base-200 hover:bg-base-300'
                                                                }`}
                                                                onClick={() => setFieldValue('visaType', type.value)}
                                                            >
                                                                <div className="card-body p-4">
                                                                    <h3 className="font-bold text-sm">{type.label}</h3>
                                                                    <p className="text-xs opacity-70">{type.description}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="form-control md:col-span-2">
                                                    <label className="label">
                                                        <span className="label-text">Purpose of Visit *</span>
                                                    </label>
                                                    <textarea
                                                        name="purpose"
                                                        className="textarea textarea-bordered"
                                                        placeholder="Describe the purpose of your visit"
                                                        rows="3"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.purpose}
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Duration (days) *</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="duration"
                                                        className="input input-bordered"
                                                        placeholder="Enter duration in days"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.duration}
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Previous Visits</span>
                                                    </label>
                                                    <select
                                                        name="previousVisits"
                                                        className="select select-bordered"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.previousVisits}
                                                    >
                                                        <option value="">Select option</option>
                                                        <option value="yes">Yes</option>
                                                        <option value="no">No</option>
                                                    </select>
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Arrival Date *</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        name="arrivalDate"
                                                        className="input input-bordered"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.arrivalDate}
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Departure Date *</span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        name="departureDate"
                                                        className="input input-bordered"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.departureDate}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 4: Travel Details */}
                                    {currentStep === 4 && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                        >
                                            <h2 className="card-title mb-6">
                                                <FaPlane className="text-primary" />
                                                Travel Details
                                            </h2>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Entry Point *</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="entryPoint"
                                                        className="input input-bordered"
                                                        placeholder="Enter entry point (airport/port)"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.entryPoint}
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Exit Point</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="exitPoint"
                                                        className="input input-bordered"
                                                        placeholder="Enter exit point (airport/port)"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.exitPoint}
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Mode of Transport</span>
                                                    </label>
                                                    <select
                                                        name="transportMode"
                                                        className="select select-bordered"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.transportMode}
                                                    >
                                                        <option value="air">Air</option>
                                                        <option value="sea">Sea</option>
                                                        <option value="land">Land</option>
                                                    </select>
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">Flight Details</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="flightDetails"
                                                        className="input input-bordered"
                                                        placeholder="Flight number, airline"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.flightDetails}
                                                    />
                                                </div>

                                                <div className="form-control md:col-span-2">
                                                    <label className="label">
                                                        <span className="label-text">Accommodation Details *</span>
                                                    </label>
                                                    <textarea
                                                        name="accommodation"
                                                        className="textarea textarea-bordered"
                                                        placeholder="Hotel name, address, or host details"
                                                        rows="3"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.accommodation}
                                                    />
                                                </div>

                                                <div className="form-control md:col-span-2">
                                                    <label className="label">
                                                        <span className="label-text">Financial Support *</span>
                                                    </label>
                                                    <textarea
                                                        name="financialSupport"
                                                        className="textarea textarea-bordered"
                                                        placeholder="How will you finance your trip? (self-funded, sponsored, etc.)"
                                                        rows="3"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.financialSupport}
                                                    />
                                                </div>

                                                <div className="form-control md:col-span-2">
                                                    <label className="label">
                                                        <span className="label-text">Travel Itinerary</span>
                                                    </label>
                                                    <textarea
                                                        name="travelItinerary"
                                                        className="textarea textarea-bordered"
                                                        placeholder="Brief description of your travel plans"
                                                        rows="4"
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        value={values.travelItinerary}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 5: Documents */}
                                    {currentStep === 5 && (
                                        <motion.div
                                            initial={{ opacity: 0, x: 50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -50 }}
                                        >
                                            <h2 className="card-title mb-6">
                                                <FaFileUpload className="text-primary" />
                                                Required Documents
                                            </h2>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {[
                                                    { name: 'passportCopy', label: 'Passport Copy', required: true },
                                                    { name: 'photograph', label: 'Passport Photograph', required: true },
                                                    { name: 'financialDocuments', label: 'Financial Documents', required: true },
                                                    { name: 'accommodationProof', label: 'Accommodation Proof', required: false },
                                                    { name: 'travelInsurance', label: 'Travel Insurance', required: false },
                                                    { name: 'additionalDocuments', label: 'Additional Documents', required: false }
                                                ].map((doc) => (
                                                    <div key={doc.name} className="form-control">
                                                        <label className="label">
                                                            <span className="label-text">
                                                                {doc.label} {doc.required && '*'}
                                                            </span>
                                                        </label>
                                                        <div className="border-2 border-dashed border-base-300 rounded-lg p-4 text-center">
                                                            <input
                                                                type="file"
                                                                className="file-input file-input-bordered w-full"
                                                                accept=".pdf,.jpg,.jpeg,.png"
                                                                onChange={(e) => {
                                                                    const file = e.target.files[0];
                                                                    if (file) {
                                                                        handleFileUpload(file, doc.name, setFieldValue);
                                                                    }
                                                                }}
                                                            />
                                                            {uploadedFiles[doc.name] && (
                                                                <div className="mt-2 text-success">
                                                                    ✓ {uploadedFiles[doc.name].fileName}
                                                                </div>
                                                            )}
                                                            <p className="text-xs text-base-content/50 mt-2">
                                                                PDF, JPG, PNG (Max 5MB)
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="alert alert-info mt-6">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                                <span>
                                                    Please ensure all documents are clear and legible. 
                                                    Required documents must be uploaded before submission.
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Navigation Buttons */}
                                    <div className="flex justify-between mt-8">
                                        <button
                                            type="button"
                                            className={`btn btn-outline ${currentStep === 1 ? 'btn-disabled' : ''}`}
                                            onClick={prevStep}
                                            disabled={currentStep === 1}
                                        >
                                            <FaArrowLeft className="mr-2" />
                                            Previous
                                        </button>

                                        {currentStep < 5 ? (
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={() => nextStep(values)}
                                            >
                                                Next
                                                <FaArrowLeft className="ml-2 rotate-180" />
                                            </button>
                                        ) : (
                                            <button
                                                type="submit"
                                                className={`btn btn-success ${isSubmitting ? 'loading' : ''}`}
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <span className="loading loading-spinner"></span>
                                                ) : (
                                                    <>
                                                        <FaSave className="mr-2" />
                                                        {isEditing ? 'Update Application' : 'Submit Application'}
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.form>
                    )}
                </Formik>
            </div>
        </Layout>
    );
};

export default VisaForm;