import { useState, useCallback, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import Users from "./users/pages/Users";
import NewPlace from "./places/pages/NewPlace";
import MainNavigation from "./shared/components/Navigation/MainNavigation";
import UserPlaces from "./places/pages/UserPlaces";
import UpdatePlace from "./places/pages/UpdatePlace";
import Auth from "./users/pages/Auth";
import { AuthContext } from "./shared/context/auth-context";

//do wylogowania gdy token wygaśnie
let logoutTimer;

const App = () => {
  const [token, setToken] = useState(false);
  const [userId, setUserId] = useState(false);
  const [tokenExpirationDate, setTokenExpirationDate] = useState();

  const login = useCallback((userId, token, expirationDate) => {
    setToken(token);
    setUserId(userId);
    //zapisuje do local storage aby zapamiętywać logowanie
    const tokenExpirationDate =
      expirationDate || new Date(new Date().getTime() + 1000 * 60 * 30);
    setTokenExpirationDate(tokenExpirationDate);
    localStorage.setItem(
      "userData",
      JSON.stringify({
        userId: userId,
        token: token,
        expiration: tokenExpirationDate.toISOString(),
      })
    );
    //[] zapobiega rekreacji funkcji przy rerenderowaniach
  }, []);

  useEffect(() => {
    //sprawdzanie czy użytkownik jest zalogowany
    const storedData = JSON.parse(localStorage.getItem("userData"));
    if (
      storedData &&
      storedData.token &&
      //sprawdzenie czy token nie wygasł
      new Date(storedData.expiration) > new Date()
    ) {
      login(
        storedData.userId,
        storedData.token,
        new Date(storedData.expiration)
      );
    }
  }, [login]);

  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
    //usuwa token ze storage
    localStorage.removeItem("userData");
    setTokenExpirationDate(null);
  }, []);

  useEffect(() => {
    if (token && tokenExpirationDate) {
      //obliczam pozostały czas
      const remainingTime = tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate]);

  let routes;

  //różne routy w zależności cd uwierzytelnienia użytkownika
  if (token) {
    routes = (
      <Routes>
        <Route path="/" element={<Users />} />
        {/* dynamiczny segment */}
        <Route path="/:userId/places" element={<UserPlaces />} />
        <Route path="/places/new" element={<NewPlace />} />
        <Route path="/places/:placeId" element={<UpdatePlace />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  } else {
    routes = (
      <Routes>
        <Route path="/" element={<Users />} />
        <Route path="/:userId/places" element={<UserPlaces />} />
        <Route path="*" element={<Navigate to="/auth" />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    );
  }

  return (
    //przekazywanie danych między komponentami bez użycia props
    //każdy komponent w AuthContext.Provider ma dostęp do AuthContext
    //każdy słuchający komponent będzie się automatycznie rerenderował
    <AuthContext.Provider
      //value jest przekazywane do słuchających komponentów
      value={{
        isLoggedIn: !!token, //!! truthy - operator
        token: token,
        userId: userId,
        login: login,
        logout: logout,
      }}
    >
      <Router>
        <MainNavigation />
        <main>{routes}</main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
