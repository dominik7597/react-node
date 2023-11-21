//bardziej zaawansowane niż useState
import React, { useReducer, useEffect } from "react";
import "./Input.css";
import { validate } from "../../util/validators";

//rerenderuję komponent
const inputReducer = (state, action) => {
  switch (action.type) {
    case "CHANGE":
      return {
        //przekazuję wszystko z poprzedniego stanu
        ...state,
        value: action.val,
        //logika walidacji
        isValid: validate(action.val, action.validators),
      };
    case "TOUCH":
      return {
        ...state,
        isTouched: true,
      };
    default:
      return state;
  }
};

const Input = (props) => {
  const [inputState, dispatch] = useReducer(inputReducer, {
    //stan inicjalny, props.value/valid w przypadku update
    value: props.value || "",
    isTouched: false,
    isValid: props.valid || false,
  });

  const { id, onInput } = props;
  const { value, isValid } = inputState;

  //przekazuję informacje o walidacji do rodzica - newplace
  useEffect(() => {
    onInput(id, value, isValid);
  }, [id, value, isValid, onInput]);

  const changeHandler = (event) => {
    //dispatch wywołuje reducer
    dispatch({
      type: "CHANGE",
      val: event.target.value,
      validators: props.validators,
    });
  };

  const touchHandler = () => {
    dispatch({
      type: "TOUCH",
    });
  };

  //wybór między renderowaniem inputu, a textarea
  const element =
    props.element === "input" ? (
      <input
        id={props.id}
        type={props.type}
        placeholder={props.placeholder}
        //po każdym naciśnięciu klawisza uruchom handler
        onChange={changeHandler}
        //wyświetla tylko gdy jest focus na elemencie
        onBlur={touchHandler}
        value={inputState.value}
      />
    ) : (
      <textarea
        id={props.id}
        rows={props.rows || 4}
        onChange={changeHandler}
        onBlur={touchHandler}
        value={inputState.value}
      />
    );

  return (
    <div
      //dodaję klase invalid w wypadku niepowodzenia walidacji
      className={`form-control ${
        !inputState.isValid && inputState.isTouched && "form-control--invalid"
      }`}
    >
      <label htmlFor={props.id}>{props.label}</label>
      {element}
      {/* dodaję tekst w wypadku niepowodzenia walidacji*/}
      {!inputState.isValid && <p>{props.errorText}</p>}
    </div>
  );
};

export default Input;
