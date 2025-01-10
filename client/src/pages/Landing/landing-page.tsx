import Feature from "../../components/landing/feature";
import Hero from "../../components/landing/hero";
import Marquee from "../../components/landing/marquee";
import Navbar from "../../components/landing/navbar";

const LandingPaage = () => {
    return ( 
        <div className="w-auto  h-auto bg-black">
            <Navbar/>
            <Hero/>
            <Marquee/>
            <Feature/>
        </div>
     );
}
 
export default LandingPaage;