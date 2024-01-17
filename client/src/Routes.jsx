import { useContext } from "react";
import Chat from "./components/Chat";
import RegisterAndLogin from "./components/RegisterAndLogin";
import { UserContext } from "./context/UserContext";

const Routes = () => {
    const { username } = useContext(UserContext);
    if (username) {
        return <Chat />
    }
  return <RegisterAndLogin />
}

export default Routes