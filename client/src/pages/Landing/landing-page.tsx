import Feature from "../../components/landing/feature";
import Footer from "../../components/landing/footer";
import Hero from "../../components/landing/hero";
import Navbar from "../../components/landing/navbar";

const LandingPage = () => {
    return ( 
        <div className="w-auto  h-auto bg-black">
            <Navbar/>
            <Hero/>
            <Feature/>
            <Footer/>
        </div>
     );
}
 
export default LandingPage;