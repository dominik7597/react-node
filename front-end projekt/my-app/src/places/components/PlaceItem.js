import React, { useContext, useState } from "react";
import "./PlaceItem.css";
import Card from "../../shared/components/UIElements/Card";
import Button from "../../shared/components/FormElements/Button";
import { AuthContext } from "../../shared/context/auth-context";
import Modal from "../../shared/components/UIElements/Modal";

const PlaceItem = (props) => {
  const auth = useContext(AuthContext);

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const showWarningHandler = () => {
    setShowConfirmModal(true);
  };

  const cancelWarningHandler = () => {
    setShowConfirmModal(false);
  };

  const placeDeleteHandler = async (event) => {
    event.preventDefault();
    const deletePlace = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/places/${props.id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );
        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.message);
        }
        //przekazanie id usuwanego miejsca do poprawnego renderowania frontu
        props.onDelete(props.id);
      } catch (err) {
        console.log(err);
      }
    };
    deletePlace();
    //userId się nie zmienia - bez reloadu
  };

  return (
    <React.Fragment>
      <Modal
        show={showConfirmModal}
        onCancel={cancelWarningHandler}
        headers="Are you sure?"
        footerClass="place-item__modal-actions"
        footer={
          <React.Fragment>
            <Button onClick={cancelWarningHandler}>CANCEL</Button>
            <Button onClick={placeDeleteHandler}>DELETE</Button>
          </React.Fragment>
        }
      >
        <p>Proceed?</p>
      </Modal>
      <li className="place-item">
        <Card className="place-item__content">
          <div className="place-item__image">
            <img
              src={`http://localhost:5000/${props.image}`}
              alt={props.title}
            />
          </div>
          <div className="place-item__info">
            <h2>{props.title}</h2>
            <h3>{props.address}</h3>
            <p>{props.description}</p>
          </div>
          {auth.userId === props.creatorId && (
            <div className="place-item__actions">
              <Button to={`/places/${props.id}`}>EDIT</Button>
              <Button onClick={showWarningHandler}>DELETE</Button>
            </div>
          )}
        </Card>
      </li>
    </React.Fragment>
  );
};

export default PlaceItem;
