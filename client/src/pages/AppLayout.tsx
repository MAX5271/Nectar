import { Outlet, useNavigation } from "react-router-dom";
import Loader from "../components/Loader";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function AppLayout(){
    const navigation = useNavigation();
    const isLoading = navigation.state==='loading';
    return (<div>
        {isLoading&&<Loader/>}
        <Header/>
        <div>
            <main>
                <Outlet/>
            </main>
        </div>
        <Footer/>
    </div>)
}