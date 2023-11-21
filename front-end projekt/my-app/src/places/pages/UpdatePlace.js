import React, { useCallback, useReducer, useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import Card from "../../shared/components/UIElements/Card";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../shared/context/auth-context";

const formReducer = (state, action) => {
  switch (action.type) {
    case "INPUT_CHANGE":
      let formIsValid = true;
      for (const inputId in state.inputs) {
        if (inputId === action.inputId) {
          formIsValid = formIsValid && action.isValid;
        } else {
          formIsValid = formIsValid && state.inputs[inputId].isValid;
        }
      }
      return {
        ...state,
        inputs: {
          ...state.inputs,
          [action.inputId]: { value: action.value, isValid: action.isValid },
        },
        isValid: formIsValid,
      };
    default:
      return state;
  }
};

const UpdatePlace = () => {
  //sprawdza stan walidacji

  const [formState, dispatch] = useReducer(formReducer, {
    //inicjalny stan całkowitej walidacji
    isValid: false,
  });

  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const inputHandler = useCallback((id, value, isValid) => {
    dispatch({
      type: "INPUT_CHANGE",
      value: value,
      isValid: isValid,
      inputId: id,
    });
  }, []);

  const placeSubmitHandler = async (event) => {
    //zapobiega domyślnemu odświeżaniu js
    event.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/places/${placeId}`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          title: formState.inputs.title.value,
          description: formState.inputs.description.value,
        }),
      });
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message);
      }
      navigate(`/http://localhost:5000/places/user/${auth.userId}/`);
    } catch (err) {
      console.log(err);
    }
  };

  const [loadedPlace, setLoadedPlace] = useState();
  const placeId = useParams().placeId;

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const response = await fetch(`http://localhost:5000/places/${placeId}/`);
        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.message);
        }
        setLoadedPlace(responseData.place);
      } catch (err) {
        console.log(err);
      }
    };
    fetchPlace();
    //userId się nie zmienia - bez reloadu
  }, [placeId]);

  if (!loadedPlace) {
    return (
      <div className="center">
        <Card>
          <h2>Not existing place!</h2>
        </Card>
      </div>
    );
  }

  return (
    loadedPlace && (
      <form className="place-form" onSubmit={placeSubmitHandler}>
        <Input
          id="title"
          element="input"
          type="text"
          label="Title"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Enter valid title"
          onInput={inputHandler}
          value={loadedPlace.title}
          valid={true}
        />
        <Input
          id="description"
          element="textarea"
          label="Description"
          validators={[VALIDATOR_MINLENGTH(10)]}
          errorText="Enter valid description (min 10 chars)!"
          onInput={inputHandler}
          value={loadedPlace.description}
          valid={true}
        />
        <Button type="submit" disabled={!formState.isValid}>
          UPDATE PLACE
        </Button>
      </form>
    )
  );
};

export default UpdatePlace;
