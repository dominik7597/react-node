import React, { useCallback, useReducer, useState, useContext } from "react";
import Input from "../../shared/components/FormElements/Input";
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_EMAIL,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import Card from "../../shared/components/UIElements/Card";
import "./Auth.css";
import Button from "../../shared/components/FormElements/Button";
import { AuthContext } from "../../shared/context/auth-context";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";

const formReducer = (state, action) => {
  switch (action.type) {
    case "INPUT_CHANGE":
      let formIsValid = true;
      for (const inputId in state.inputs) {
        if (!state.inputs[inputId]) {
          continue;
        }
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
    case "SET_DATA":
      return {
        inputs: action.inputs,
        isValid: action.formIsValid,
      };
    default:
      return state;
  }
};

const Auth = () => {
  const auth = useContext(AuthContext);

  const [isLogin, setIsLogin] = useState(true);

  const [formState, dispatch] = useReducer(formReducer, {});

  const [error, setError] = useState();

  const inputHandler = useCallback((id, value, isValid) => {
    dispatch({
      type: "INPUT_CHANGE",
      value: value,
      isValid: isValid,
      inputId: id,
    });
  }, []);

  //metoda przekazująca dane do reducera
  const setFormData = useCallback((inputData, formValidity) => {
    dispatch({
      type: "SET_DATA",
      inputs: inputData,
      formIsValid: formValidity,
    });
  }, []);

  const switchModeHandler = () => {
    if (!isLogin) {
      //ustawiam wartości dla sign up
      setFormData(
        {
          ...formState.inputs,
          name: undefined,
          image: undefined,
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      //ustawiam wartości dla log in
      setFormData(
        {
          ...formState.inputs,
          name: {
            name: "",
            isValid: false,
          },
          image: {
            value: null,
            isValid: false,
          },
        },
        false
      );
    }
    setIsLogin((prevMode) => !prevMode);
  };

  const authSubmitHandler = async (event) => {
    //zapobiega domyślnemu odświeżaniu js
    event.preventDefault();
    if (isLogin) {
      try {
        const response = await fetch("http://localhost:5000/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          //konwertuje js na json
          body: JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value,
          }),
        });

        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.message);
        }
        auth.login(responseData.userId, responseData.token);
      } catch (err) {
        setError(err.message || "Something went wrong!");
      }
    } else {
      try {
        //wbudowane w przeglądarkę
        const formData = new FormData();
        formData.append("email", formState.inputs.email.value);
        formData.append("name", formState.inputs.name.value);
        formData.append("password", formState.inputs.password.value);
        formData.append("image", formState.inputs.image.value);
        const response = await fetch("http://localhost:5000/users/signup", {
          method: "POST",
          //nagłówki niepotrzebne w formData
          // headers: {
          //   "Content-Type": "application/json",
          // },
          //konwertuje js na json
          body: formData,
        });

        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(responseData.error);
        }
        auth.login(responseData.userId, responseData.token);
      } catch (err) {
        setError(err.message || "Something went wrong!");
      }
    }
  };

  const errorHandler = () => {
    setError(null);
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={errorHandler} />
      <Card className="authentication">
        <form onSubmit={authSubmitHandler}>
          {/* name input tylko dla sing in */}
          {!isLogin && (
            <Input
              id="name"
              element="input"
              type="text"
              label="Username"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="Enter valid username"
              onInput={inputHandler}
            />
          )}
          {!isLogin && (
            <ImageUpload
              center
              id="image"
              onInput={inputHandler}
              errorText="Add an image"
            />
          )}
          <Input
            id="email"
            element="input"
            type="email"
            label="E-Mail"
            validators={[VALIDATOR_EMAIL()]}
            errorText="Enter valid email address"
            onInput={inputHandler}
          />
          <Input
            id="password"
            element="input"
            type="password"
            label="Password"
            validators={[VALIDATOR_MINLENGTH(8)]}
            errorText="Enter valid password (min 8 chars)"
            onInput={inputHandler}
          />
          <Button type="submit" disabled={!formState.isValid}>
            {isLogin ? "Log in" : "Sign up"}
          </Button>
        </form>
        <Button onClick={switchModeHandler}>
          Switch to {isLogin ? "Sign up" : "Log in"}
        </Button>
      </Card>
    </React.Fragment>
  );
};

export default Auth;
