import React from "react";
import Modal from "./Modal";
import Button from "../FormElements/Button";

const ErrorModal = (props) => {
  return (
    <Modal
      //zamykam prompt
      onCancel={props.onClear}
      header="Error"
      //!! - jeśli nie puste - zwraca true
      show={!!props.error}
      footer={<Button onClick={props.onClear}>OK</Button>}
    >
      <p>{props.error}</p>
    </Modal>
  );
};

export default ErrorModal;
