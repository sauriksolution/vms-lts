import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import VisitorRegistrationForm from "../../components/VisitorRegistrationForm";

const VisitorRegister = () => {
    const router = useRouter();

    const handleRegistrationSuccess = (data) => {
        console.log("Registration successful:", data);
        // The form component handles the redirect to login
    };

    return (
        <Layout>
            <VisitorRegistrationForm onSuccess={handleRegistrationSuccess} />
        </Layout>
    );
};

export default VisitorRegister;