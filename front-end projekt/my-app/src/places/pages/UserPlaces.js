import React, { useEffect, useState } from "react";
import PlaceList from "../components/PlaceList";
import { useParams } from "react-router-dom";

const UserPlaces = () => {
  const [loadedPlaces, setLoadedPlaces] = useState();

  //useParams() - pobiera parametry z dynamicznych segmentów url
  const userId = useParams().userId;

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/places/user/${userId}`
        );
        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.message);
        }
        setLoadedPlaces(responseData.places);
      } catch (err) {
        console.log(err);
      }
    };
    fetchPlaces();
    //userId się nie zmienia - bez reloadu
  }, [userId]);

  //usuwanie miejsca z frontu
  const placeDeletedHandler = (deletedPlaceId) => {
    setLoadedPlaces((prevPlaces) =>
      prevPlaces.filter((place) => place._id !== deletedPlaceId)
    );
  };

  return (
    loadedPlaces && (
      <PlaceList items={loadedPlaces} onDeletePlace={placeDeletedHandler} />
    )
  );
};

export default UserPlaces;
