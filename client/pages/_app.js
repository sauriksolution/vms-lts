import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { transitions, positions, Provider as AlertProvider } from 'react-alert'
import AlertTemplate from 'react-alert-template-basic';

import Alert from "../components/Alert";
import Layout from "../components/Layout";

import useAuth from "../store/authStore";

import "../styles/globals.css";
import "react-custom-alert/dist/index.css";

function MyApp({ Component, pageProps }) {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    const options = {
      position: positions.TOP_CENTER,
      timeout: 10000,
      offset: '30px',
      transition: transitions.SCALE
    }

    const access_token = useAuth((state) => {
        return state.access_token;
    });

    const getPermission = useAuth((state) => {
        return state.permission;
    });

    // Only get permission on client side to prevent hydration mismatch
    const permission = isClient ? getPermission() : -999;

    const httpLink = createHttpLink({
        uri: process.env.BACKEND_GRAPHQL_URL,
    });

    const authLink = setContext((_, { headers }) => {
        return {
            headers: {
                ...headers,
                authorization: access_token ? `Bearer ${access_token}` : "",
            }
        }
    });

    const client = new ApolloClient({
        link: authLink.concat(httpLink),
        cache: new InMemoryCache(),
    });

    const isPublicPath = (url) => {
        const publicPaths = [
            "/login",
            "/",
            "/expire",
            "/resident/signUp",
            "/receptionist/signUp",
            "/signUp",
            "/verify",
            "/authorize",
            "/adminSignup",
            "/visitor/register",
        ];
        const path = url.split("?")[0];
        return publicPaths.includes(path);
    };

    useEffect(() => {
        // Set client flag to true after component mounts
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return; // Don't run on server side
        
        if (!isPublicPath(router.asPath) && permission === -999) {
            router.push("/expire");
            return;
        } else if (
            !isPublicPath(router.asPath) &&
            (permission === -1 || permission === -2 || permission === -3)
        ) {
            router.push("/authorize");
            return;
        }
    }, [router, permission, isClient]);

    // Show loading state during hydration to prevent mismatch
    if (!isClient) {
        return (
            <ApolloProvider client={client}>
                <AlertProvider template={Alert} {...options}>
                    <Head>
                        <title>Nullexa</title>
                        <meta
                            name="viewport"
                            content="width=device-width, initial-scale=1.0, user-scalable = no"
                        />
                    </Head>
                    <Layout>
                        <div className="flex items-center justify-center min-h-screen">
                            <div className="loading loading-spinner loading-lg"></div>
                        </div>
                    </Layout>
                </AlertProvider>
            </ApolloProvider>
        );
    }

    if (pageProps.protected && (permission === -1 || permission === -2 || permission === -3)) {
        return <Layout> Your account is not authorized yet. </Layout>;
    }

    if (
        (pageProps.protected && permission < 0) ||
        (pageProps.permission < permission && permission !== -999)
    ) {
        return <Layout> Woops: you are not supposed to be here </Layout>;
    }

    return (
        <ApolloProvider client={client}>
            <AlertProvider template={Alert} {...options}>
                <Head>
                    <title>Nullexa</title>
                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0, user-scalable = no"
                    />
                </Head>
                <Component {...pageProps} />
            </AlertProvider>
        </ApolloProvider>
    );
}

export default MyApp;
