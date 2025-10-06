import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { gql, useQuery, useApolloClient } from "@apollo/client";
import { Field, Formik } from "formik";
import { motion } from "framer-motion";
import { useAlert } from "react-alert";
import axios from "axios";

import Layout from "../../components/Layout";

import useAuth from "../../store/authStore";

const SignUp = () => {
    const alert = useAlert();
    const permission = useAuth((state) => {
        return state.permission;
    })();
    const verify = useAuth((state) => {
        return state.setVerify;
    });
    const verified = useAuth((state) => {
        return state.verified;
    });

    const BACKEND_URL = process.env.BACKEND_URL;

    const flyEmojiAway = {
        initial: {
            y: 0,
            x: 0,
        },
        hover: {
            y: -100,
            x: 200,
            transition: {
                ease: "linear",
                duration: 1.2,
            },
        },
    };

    const client = useApolloClient();
    const router = useRouter();

    useEffect(() => {
        if (verified && permission === -999) {
            router.push("/verify");
        } else if (permission >= 0) {
            router.push("/");
        }
    }, [router, verified, permission]);
    
    const submitData = async (signupData, setSubmitting) => {
        const formData = new FormData();
        formData.append("file", signupData.file);
        formData.append("name", signupData.name);
        formData.append("email", signupData.email);
        formData.append("type", "resident");
        formData.append("idNumber", signupData.idNumber);
        formData.append("IDDocType", signupData.idDoc);
        formData.append("password", signupData.password);

        const response = await axios.post(`${BACKEND_URL}/user/signup`, formData);

        if(response.data.result) {
            verify();
            router.push("/verify?email=" + signupData.email);
        } else {
            alert.show(
            response.data.error,
            {
                type: "error"
            });
        }

        setSubmitting(false);
    };

    return (
        <Layout>
            <div className="relative mb-4 flex h-full min-h-[80vh] w-full flex-col items-center justify-center overflow-hidden">
                <ul className="steps mb-3 mt-2 text-xs md:text-base">
                    <li className="step step-primary">
                        Tell Us About Yourself
                    </li>
                    <li className="step">Verify Email</li>
                    <li className="step">Authorize Account</li>
                </ul>

                <Formik
                    initialValues={{
                        email: "",
                        file: undefined,
                        password: "",
                        confirmPassword: "",
                        idDoc: "Citizenship-ID",
                        idNumber: "",
                        name: "",
                    }}
                    validate={(values) => {
                        const errors = {};
                        
                        // Email validation
                        if (!values.email) {
                            errors.email = "Required";
                        } else if (
                            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
                                values.email
                            )
                        ) {
                            errors.email = "Invalid email address";
                        }
                        
                        // Name validation
                        if (!values.name) {
                            errors.name = "Name required";
                        } else if (!/[A-Za-z]+/i.test(values.name)) {
                            errors.name = "Invalid name";
                        }
                        
                        // ID Number validation
                        if (
                            (values.idDoc === "Citizenship-ID" ||
                                values.idDoc === "Drivers-License") &&
                            !/^[A-Za-z0-9\/-]{6,15}$/i.test(
                                values.idNumber
                            )
                        ) {
                            errors.idNumber = "Invalid Citizenship ID Number. Must be 6-15 characters and can contain letters, numbers, / and -";
                        }
                        
                        // Password validation
                        if (!values.password) {
                            errors.password = "Required";
                        } else if (
                            !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/i.test(
                                values.password
                            )
                        ) {
                            errors.password =
                                "Password needs minimum of 8 characters with one number and one special character";
                        }
                        
                        // Confirm password validation
                        if (!values.confirmPassword) {
                            errors.confirmPassword = "Required";
                        } else if (values.confirmPassword !== values.password) {
                            errors.confirmPassword = "Passwords do not match";
                        }
                        
                        // File validation
                        if(!values.file) {
                            errors.file = "Required";
                        }

                        return errors;
                    }}
                    onSubmit={(values, { setSubmitting }) => {
                        submitData(values, setSubmitting);
                    }}
                >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleBlur,
                        setFieldValue,
                        handleSubmit,
                        isSubmitting,
                    }) => {
                        return (
                            <form
                                onSubmit={handleSubmit}
                                className="form-control space-y-4 rounded-xl border p-14"
                            >
                                <h1 className="font-bold text-xl md:text-4xl">Let&apos;s Get Started ✨</h1>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Your Email"
                                    autoComplete="username"
                                    className="input input-bordered w-full"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.email}
                                ></input>
                                <span className="text-sm text-error md:text-base">
                                    {errors.email &&
                                        touched.email &&
                                        errors.email}
                                </span>

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter Name"
                                    className="input input-bordered w-full"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.name}
                                />
                                <span className="text-error">
                                    {errors.name && touched.name && errors.name}
                                </span>

                                <Field
                                    as="select"
                                    className="select select-primary w-full"
                                    name="idDoc"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                >
                                    <option value="Citizenship-ID">Citizenship ID</option>
                                    <option value="Drivers-License">
                                        Driver&apos;s License
                                    </option>
                                </Field>

                                <input
                                    type="text"
                                    name="idNumber"
                                    placeholder="Enter Citizenship ID number"
                                    className="input input-bordered w-full"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.idNumber}
                                />
                                <span className="text-error">
                                    {errors.idNumber &&
                                        touched.idNumber &&
                                        errors.idNumber}
                                </span>

                                <input
                                    type="password"
                                    name="password"
                                    autoComplete="current-password"
                                    placeholder="Password"
                                    className="input input-bordered w-full"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.password}
                                ></input>

                                <span className="max-w-xs text-sm text-error md:text-base">
                                    {errors.password &&
                                        touched.password &&
                                        errors.password}
                                </span>

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    className="input input-bordered w-full"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.confirmPassword}
                                ></input>

                                <span className="text-sm text-error md:text-base">
                                    {errors.confirmPassword &&
                                        touched.confirmPassword &&
                                        errors.confirmPassword}
                                </span>

                                <p>Add image of yourself</p>
                                <input data-testid="fileupload" accept="image/png, image/jpeg" id="file" name="file" type="file" onChange={(event) => {
                                  setFieldValue("file", event.currentTarget.files[0]);
                                }} />

                                <span className="text-sm text-error md:text-base">
                                    {errors.file &&
                                        touched.file &&
                                        errors.file}
                                </span>

                                <p className="text-sm md:text-lg lg:text-xl">
                                    You are signing up as a resident
                                </p>

                                <motion.button
                                    className="btn btn-primary space-x-4 overflow-y-hidden"
                                    type="submit"
                                    disabled={isSubmitting}
                                    initial="initial"
                                    whileHover="hover"
                                    whileFocus="hover"
                                >
                                    Let&apos;s Go{" "}
                                    <motion.span
                                        className="ml-3"
                                        variants={flyEmojiAway}
                                    >
                                        {" "}
                                        🚀
                                    </motion.span>
                                </motion.button>
                            </form>
                        );
                    }}
                </Formik>

            </div>
        </Layout>
    );
};

export default SignUp;
