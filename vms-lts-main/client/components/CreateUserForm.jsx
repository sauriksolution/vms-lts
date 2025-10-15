import { useState } from "react";
import { useMutation, gql } from "@apollo/client";
import { Formik } from "formik";
import * as Yup from "yup";

const CREATE_RECEPTIONIST = gql`
    mutation CreateReceptionist(
        $email: String!
        $password: String!
        $name: String!
        $idNumber: String!
        $idDocType: String!
        $pinNumber: String!
        $file: String!
    ) {
        createReceptionist(
            email: $email
            password: $password
            name: $name
            idNumber: $idNumber
            idDocType: $idDocType
            pinNumber: $pinNumber
            file: $file
        ) {
            email
            name
        }
    }
`;

const CREATE_RESIDENT = gql`
    mutation CreateResident(
        $email: String!
        $password: String!
        $name: String!
        $idNumber: String!
        $idDocType: String!
        $pinNumber: String!
        $file: String!
    ) {
        createResident(
            email: $email
            password: $password
            name: $name
            idNumber: $idNumber
            idDocType: $idDocType
            pinNumber: $pinNumber
            file: $file
        ) {
            email
            name
        }
    }
`;

const CreateUserForm = ({ userType, onClose, onSuccess }) => {
    const [createReceptionist] = useMutation(CREATE_RECEPTIONIST);
    const [createResident] = useMutation(CREATE_RESIDENT);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validationSchema = Yup.object({
        email: Yup.string()
            .email("Invalid email format")
            .required("Email is required"),
        name: Yup.string()
            .min(2, "Name must be at least 2 characters")
            .required("Name is required"),
        idNumber: Yup.string()
            .min(6, "Citizenship ID must be at least 6 characters")
            .max(15, "Citizenship ID must not exceed 15 characters")
            .matches(/^[A-Za-z0-9\/-]+$/, "Citizenship ID can contain letters, numbers, / and - only")
            .required("Citizenship ID is required"),
        password: Yup.string()
            .min(8, "Password must be at least 8 characters")
            .required("Password is required"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref("password"), null], "Passwords must match")
            .required("Confirm password is required"),
        pinNumber: Yup.string()
            .matches(/^\d{4}$/, "PIN must be 4 digits")
            .required("PIN is required"),
    });

    const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
        setIsSubmitting(true);
        try {
            const mutation = userType === "receptionist" ? createReceptionist : createResident;
            
            const { data } = await mutation({
                variables: {
                    email: values.email,
                    password: values.password,
                    name: values.name,
                    idNumber: values.idNumber,
                    idDocType: values.idDocType,
                    pinNumber: values.pinNumber,
                    file: values.file || "",
                },
            });

            if (data) {
                onSuccess && onSuccess(data);
                onClose && onClose();
            }
        } catch (error) {
            console.error("Error creating user:", error);
            if (error.message.includes("email")) {
                setFieldError("email", "Email already exists");
            } else {
                setFieldError("general", "Failed to create user. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
            setSubmitting(false);
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg capitalize">
                        Create {userType} Account
                    </h3>
                    <button
                        className="btn btn-sm btn-circle"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        ✕
                    </button>
                </div>

                <Formik
                    initialValues={{
                        email: "",
                        name: "",
                        idNumber: "",
                        idDocType: "Citizenship ID",
                        password: "",
                        confirmPassword: "",
                        pinNumber: "",
                        file: "",
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        handleSubmit,
                        isSubmitting: formSubmitting,
                    }) => (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {errors.general && (
                                <div className="alert alert-error">
                                    <span>{errors.general}</span>
                                </div>
                            )}

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Email</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter email address"
                                    className={`input input-bordered ${
                                        errors.email && touched.email ? "input-error" : ""
                                    }`}
                                    value={values.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    disabled={isSubmitting}
                                />
                                {errors.email && touched.email && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">
                                            {errors.email}
                                        </span>
                                    </label>
                                )}
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Full Name</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter full name"
                                    className={`input input-bordered ${
                                        errors.name && touched.name ? "input-error" : ""
                                    }`}
                                    value={values.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    disabled={isSubmitting}
                                />
                                {errors.name && touched.name && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">
                                            {errors.name}
                                        </span>
                                    </label>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">ID Document Type</span>
                                    </label>
                                    <select
                                        name="idDocType"
                                        className="select select-bordered"
                                        value={values.idDocType}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                    >
                                        <option value="Citizenship ID">Citizenship ID</option>
                                        <option value="Passport">Passport</option>
                                        <option value="Driver's License">Driver's License</option>
                                    </select>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Citizenship ID Number</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="idNumber"
                                        placeholder="Enter Citizenship ID number"
                                        className={`input input-bordered ${
                                            errors.idNumber && touched.idNumber ? "input-error" : ""
                                        }`}
                                        value={values.idNumber}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        disabled={isSubmitting}
                                    />
                                    {errors.idNumber && touched.idNumber && (
                                        <label className="label">
                                            <span className="label-text-alt text-error">
                                                {errors.idNumber}
                                            </span>
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Password</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Enter password"
                                        className={`input input-bordered ${
                                            errors.password && touched.password ? "input-error" : ""
                                        }`}
                                        value={values.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        disabled={isSubmitting}
                                    />
                                    {errors.password && touched.password && (
                                        <label className="label">
                                            <span className="label-text-alt text-error">
                                                {errors.password}
                                            </span>
                                        </label>
                                    )}
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Confirm Password</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm password"
                                        className={`input input-bordered ${
                                            errors.confirmPassword && touched.confirmPassword
                                                ? "input-error"
                                                : ""
                                        }`}
                                        value={values.confirmPassword}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        disabled={isSubmitting}
                                    />
                                    {errors.confirmPassword && touched.confirmPassword && (
                                        <label className="label">
                                            <span className="label-text-alt text-error">
                                                {errors.confirmPassword}
                                            </span>
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">PIN Number (4 digits)</span>
                                </label>
                                <input
                                    type="text"
                                    name="pinNumber"
                                    placeholder="Enter 4-digit PIN"
                                    className={`input input-bordered ${
                                        errors.pinNumber && touched.pinNumber ? "input-error" : ""
                                    }`}
                                    value={values.pinNumber}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    disabled={isSubmitting}
                                    maxLength={4}
                                />
                                {errors.pinNumber && touched.pinNumber && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">
                                            {errors.pinNumber}
                                        </span>
                                    </label>
                                )}
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Profile Image URL (Optional)</span>
                                </label>
                                <input
                                    type="url"
                                    name="file"
                                    placeholder="Enter image URL"
                                    className="input input-bordered"
                                    value={values.file}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="modal-action">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`btn btn-primary ${
                                        isSubmitting ? "loading" : ""
                                    }`}
                                    disabled={isSubmitting || formSubmitting}
                                >
                                    {isSubmitting ? "Creating..." : `Create ${userType}`}
                                </button>
                            </div>
                        </form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default CreateUserForm;