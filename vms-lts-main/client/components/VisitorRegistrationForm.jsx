import { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { Formik, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import { useAlert } from "react-alert";
import { useRouter } from "next/router";

const CREATE_VISITOR_REGISTRATION = gql`
    mutation CreateVisitorRegistration(
        $email: String!
        $firstName: String!
        $lastName: String!
        $passportNumber: String!
        $nationality: String!
        $dateOfBirth: String!
        $phoneNumber: String!
        $purpose: String!
        $duration: String!
        $arrivalDate: String!
        $departureDate: String!
        $emergencyContactName: String!
        $emergencyContactPhone: String!
        $sponsorEmail: String!
        $sponsorType: String!
    ) {
        createVisitorRegistration(
            email: $email
            firstName: $firstName
            lastName: $lastName
            passportNumber: $passportNumber
            nationality: $nationality
            dateOfBirth: $dateOfBirth
            phoneNumber: $phoneNumber
            purpose: $purpose
            duration: $duration
            arrivalDate: $arrivalDate
            departureDate: $departureDate
            emergencyContactName: $emergencyContactName
            emergencyContactPhone: $emergencyContactPhone
            sponsorEmail: $sponsorEmail
            sponsorType: $sponsorType
        ) {
            id
            email
            status
        }
    }
`;

const VisitorRegistrationForm = ({ onClose, onSuccess }) => {
    const [createVisitorRegistration] = useMutation(CREATE_VISITOR_REGISTRATION);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const alert = useAlert();
    const router = useRouter();

    const countries = [
        "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria", "Bangladesh", 
        "Belgium", "Brazil", "Canada", "China", "Denmark", "Egypt", "France", "Germany", 
        "India", "Indonesia", "Italy", "Japan", "Mexico", "Netherlands", "Nigeria", "Pakistan", 
        "Philippines", "Russia", "Saudi Arabia", "South Africa", "Spain", "Sweden", "Switzerland", 
        "Thailand", "Turkey", "United Kingdom", "United States", "Vietnam"
    ];

    const purposeOptions = [
        "Tourism", "Business", "Education", "Medical", "Family Visit", "Conference", "Research", "Other"
    ];

    const durationOptions = [
        "1-7 days", "1-2 weeks", "2-4 weeks", "1-3 months", "3-6 months", "6+ months"
    ];

    const validationSchema = Yup.object({
        email: Yup.string()
            .email("Invalid email format")
            .required("Email is required"),
        firstName: Yup.string()
            .min(2, "First name must be at least 2 characters")
            .required("First name is required"),
        lastName: Yup.string()
            .min(2, "Last name must be at least 2 characters")
            .required("Last name is required"),
        passportNumber: Yup.string()
            .min(6, "Passport number must be at least 6 characters")
            .max(15, "Passport number must not exceed 15 characters")
            .required("Passport number is required"),
        nationality: Yup.string()
            .required("Nationality is required"),
        dateOfBirth: Yup.date()
            .max(new Date(), "Date of birth cannot be in the future")
            .required("Date of birth is required"),
        phoneNumber: Yup.string()
            .matches(/^[+]?[\d\s\-()]+$/, "Invalid phone number format")
            .min(10, "Phone number must be at least 10 digits")
            .required("Phone number is required"),
        purpose: Yup.string()
            .required("Purpose of visit is required"),
        duration: Yup.string()
            .required("Duration of stay is required"),
        arrivalDate: Yup.date()
            .min(new Date(), "Arrival date cannot be in the past")
            .required("Arrival date is required"),
        departureDate: Yup.date()
            .min(Yup.ref('arrivalDate'), "Departure date must be after arrival date")
            .required("Departure date is required"),
        emergencyContactName: Yup.string()
            .min(2, "Emergency contact name must be at least 2 characters")
            .required("Emergency contact name is required"),
        emergencyContactPhone: Yup.string()
            .matches(/^[+]?[\d\s\-()]+$/, "Invalid phone number format")
            .min(10, "Phone number must be at least 10 digits")
            .required("Emergency contact phone is required"),
        sponsorEmail: Yup.string()
            .email("Invalid sponsor email format")
            .required("Sponsor email is required"),
        sponsorType: Yup.string()
            .oneOf(["admin", "receptionist", "resident"], "Invalid sponsor type")
            .required("Sponsor type is required"),
    });

    const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
        setIsSubmitting(true);
        try {
            const { data } = await createVisitorRegistration({
                variables: {
                    email: values.email,
                    firstName: values.firstName,
                    lastName: values.lastName,
                    passportNumber: values.passportNumber,
                    nationality: values.nationality,
                    dateOfBirth: values.dateOfBirth,
                    phoneNumber: values.phoneNumber,
                    purpose: values.purpose,
                    duration: values.duration,
                    arrivalDate: values.arrivalDate,
                    departureDate: values.departureDate,
                    emergencyContactName: values.emergencyContactName,
                    emergencyContactPhone: values.emergencyContactPhone,
                    sponsorEmail: values.sponsorEmail,
                    sponsorType: values.sponsorType,
                },
            });

            if (data?.createVisitorRegistration) {
                alert.show("Visitor registration submitted successfully! Awaiting approval from sponsor.", {
                    type: "success"
                });
                onSuccess && onSuccess(data.createVisitorRegistration);
                router.push("/login");
            }
        } catch (error) {
            console.error("Error creating visitor registration:", error);
            if (error.message.includes("email")) {
                setFieldError("email", "Email already exists");
            } else if (error.message.includes("passport")) {
                setFieldError("passportNumber", "Passport number already registered");
            } else {
                alert.show("Failed to submit registration. Please try again.", {
                    type: "error"
                });
            }
        } finally {
            setIsSubmitting(false);
            setSubmitting(false);
        }
    };

    const flyEmojiAway = {
        initial: { x: 0 },
        hover: { x: 10, transition: { duration: 0.3 } }
    };

    return (
        <div className="min-h-screen bg-base-200 py-8">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-primary mb-2">Visitor Registration</h1>
                        <p className="text-lg text-base-content/70">
                            Please fill out all required information. Your registration will be reviewed by your sponsor.
                        </p>
                    </div>

                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <Formik
                                initialValues={{
                                    email: "",
                                    firstName: "",
                                    lastName: "",
                                    passportNumber: "",
                                    nationality: "",
                                    dateOfBirth: "",
                                    phoneNumber: "",
                                    purpose: "",
                                    duration: "",
                                    arrivalDate: "",
                                    departureDate: "",
                                    emergencyContactName: "",
                                    emergencyContactPhone: "",
                                    sponsorEmail: "",
                                    sponsorType: "",
                                }}
                                validationSchema={validationSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ handleSubmit, isSubmitting, errors, touched }) => (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Personal Information Section */}
                                        <div className="divider">
                                            <span className="text-lg font-semibold">Personal Information</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">Email Address *</span>
                                                </label>
                                                <Field
                                                    name="email"
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    className="input input-bordered"
                                                />
                                                <ErrorMessage name="email" component="div" className="text-error text-sm mt-1" />
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">Phone Number *</span>
                                                </label>
                                                <Field
                                                    name="phoneNumber"
                                                    type="tel"
                                                    placeholder="Enter your phone number"
                                                    className="input input-bordered"
                                                />
                                                <ErrorMessage name="phoneNumber" component="div" className="text-error text-sm mt-1" />
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">First Name *</span>
                                                </label>
                                                <Field
                                                    name="firstName"
                                                    type="text"
                                                    placeholder="Enter your first name"
                                                    className="input input-bordered"
                                                />
                                                <ErrorMessage name="firstName" component="div" className="text-error text-sm mt-1" />
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">Last Name *</span>
                                                </label>
                                                <Field
                                                    name="lastName"
                                                    type="text"
                                                    placeholder="Enter your last name"
                                                    className="input input-bordered"
                                                />
                                                <ErrorMessage name="lastName" component="div" className="text-error text-sm mt-1" />
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">Passport Number *</span>
                                                </label>
                                                <Field
                                                    name="passportNumber"
                                                    type="text"
                                                    placeholder="Enter your passport number"
                                                    className="input input-bordered"
                                                />
                                                <ErrorMessage name="passportNumber" component="div" className="text-error text-sm mt-1" />
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">Nationality *</span>
                                                </label>
                                                <Field as="select" name="nationality" className="select select-bordered">
                                                    <option value="">Select your nationality</option>
                                                    {countries.map((country) => (
                                                        <option key={country} value={country}>
                                                            {country}
                                                        </option>
                                                    ))}
                                                </Field>
                                                <ErrorMessage name="nationality" component="div" className="text-error text-sm mt-1" />
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">Date of Birth *</span>
                                                </label>
                                                <Field
                                                    name="dateOfBirth"
                                                    type="date"
                                                    className="input input-bordered"
                                                />
                                                <ErrorMessage name="dateOfBirth" component="div" className="text-error text-sm mt-1" />
                                            </div>
                                        </div>

                                        {/* Visit Information Section */}
                                        <div className="divider">
                                            <span className="text-lg font-semibold">Visit Information</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">Purpose of Visit *</span>
                                                </label>
                                                <Field as="select" name="purpose" className="select select-bordered">
                                                    <option value="">Select purpose</option>
                                                    {purposeOptions.map((purpose) => (
                                                        <option key={purpose} value={purpose}>
                                                            {purpose}
                                                        </option>
                                                    ))}
                                                </Field>
                                                <ErrorMessage name="purpose" component="div" className="text-error text-sm mt-1" />
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">Duration of Stay *</span>
                                                </label>
                                                <Field as="select" name="duration" className="select select-bordered">
                                                    <option value="">Select duration</option>
                                                    {durationOptions.map((duration) => (
                                                        <option key={duration} value={duration}>
                                                            {duration}
                                                        </option>
                                                    ))}
                                                </Field>
                                                <ErrorMessage name="duration" component="div" className="text-error text-sm mt-1" />
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">Arrival Date *</span>
                                                </label>
                                                <Field
                                                    name="arrivalDate"
                                                    type="date"
                                                    className="input input-bordered"
                                                />
                                                <ErrorMessage name="arrivalDate" component="div" className="text-error text-sm mt-1" />
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">Departure Date *</span>
                                                </label>
                                                <Field
                                                    name="departureDate"
                                                    type="date"
                                                    className="input input-bordered"
                                                />
                                                <ErrorMessage name="departureDate" component="div" className="text-error text-sm mt-1" />
                                            </div>
                                        </div>

                                        {/* Emergency Contact Section */}
                                        <div className="divider">
                                            <span className="text-lg font-semibold">Emergency Contact</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">Emergency Contact Name *</span>
                                                </label>
                                                <Field
                                                    name="emergencyContactName"
                                                    type="text"
                                                    placeholder="Enter emergency contact name"
                                                    className="input input-bordered"
                                                />
                                                <ErrorMessage name="emergencyContactName" component="div" className="text-error text-sm mt-1" />
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">Emergency Contact Phone *</span>
                                                </label>
                                                <Field
                                                    name="emergencyContactPhone"
                                                    type="tel"
                                                    placeholder="Enter emergency contact phone"
                                                    className="input input-bordered"
                                                />
                                                <ErrorMessage name="emergencyContactPhone" component="div" className="text-error text-sm mt-1" />
                                            </div>
                                        </div>

                                        {/* Sponsor Information Section */}
                                        <div className="divider">
                                            <span className="text-lg font-semibold">Sponsor Information</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">Sponsor Email *</span>
                                                </label>
                                                <Field
                                                    name="sponsorEmail"
                                                    type="email"
                                                    placeholder="Enter sponsor's email"
                                                    className="input input-bordered"
                                                />
                                                <ErrorMessage name="sponsorEmail" component="div" className="text-error text-sm mt-1" />
                                                <label className="label">
                                                    <span className="label-text-alt">The person who will authorize your visit</span>
                                                </label>
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">Sponsor Type *</span>
                                                </label>
                                                <Field as="select" name="sponsorType" className="select select-bordered">
                                                    <option value="">Select sponsor type</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="receptionist">Receptionist</option>
                                                    <option value="resident">Resident</option>
                                                </Field>
                                                <ErrorMessage name="sponsorType" component="div" className="text-error text-sm mt-1" />
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="form-control mt-8">
                                            <motion.button
                                                className="btn btn-primary btn-lg"
                                                type="submit"
                                                disabled={isSubmitting}
                                                initial="initial"
                                                whileHover="hover"
                                                whileFocus="hover"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <span className="loading loading-spinner"></span>
                                                        Submitting Registration...
                                                    </>
                                                ) : (
                                                    <>
                                                        Submit Registration
                                                        <motion.span
                                                            className="ml-2"
                                                            variants={flyEmojiAway}
                                                        >
                                                            📝
                                                        </motion.span>
                                                    </>
                                                )}
                                            </motion.button>
                                        </div>

                                        <div className="text-center text-sm text-base-content/60 mt-4">
                                            <p>
                                                By submitting this form, you agree to our terms and conditions.
                                                Your registration will be reviewed by your designated sponsor.
                                            </p>
                                        </div>
                                    </form>
                                )}
                            </Formik>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisitorRegistrationForm;