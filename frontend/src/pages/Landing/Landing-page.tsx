import Feature from "../../components/Landing/Feature";
import Footer from "../../components/Landing/Footer";
import Hero from "../../components/Landing/Hero";
import Navbar from "../../components/Landing/Navbar";

const LandingPage = () => {
    return (
        <div className="w-auto h-auto bg-black">
            <Navbar/>
            <Hero/>
            <Feature/>
            <Footer/>
        </div>
     )
}
export default LandingPage;