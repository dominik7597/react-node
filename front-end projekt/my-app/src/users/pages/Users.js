import React, { useEffect, useState } from "react";
import UsersList from "../components/UsersList";

const Users = () => {
  const [loadedUsers, setLoadedUsers] = useState();

  useEffect(() => {
    //funkcja iffy
    const sendRequest = async () => {
      try {
        const response = await fetch("http://localhost:5000/users");
        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.message);
        }
        setLoadedUsers(responseData.users);
      } catch (err) {
        console.log(err);
      }
    };
    sendRequest();
  }, []);
  return loadedUsers && <UsersList items={loadedUsers} />;
};

export default Users;
