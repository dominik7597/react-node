import React, { useRef, useState, useEffect } from "react";
import "./ImageUpload.css";
import Button from "./Button";

const ImageUpload = (props) => {
  const [file, setFile] = useState();
  const [previewUrl, setPreviewUrl] = useState();
  const [isValid, setIsValid] = useState(false);

  //użyty do aktywacji niewidzialnego komponentu
  const fileChooserRef = useRef();

  useEffect(() => {
    if (!file) {
      return;
    }
    //fileReader wbudowany w przeglądarke
    const fileReader = new FileReader();
    //konwencja fileReader api
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  }, [file]);

  const chosenHandler = (event) => {
    let chosenFile;
    //setIsValid zmienia sie po wysłaniu onInput
    let fileIsValid = isValid;
    if (event.target.files && event.target.files.length === 1) {
      chosenFile = event.target.files[0];
      setFile(chosenFile);
      setIsValid(true);
      fileIsValid = true;
    } else {
      setIsValid(false);
      fileIsValid = false;
    }
    props.onInput(props.id, chosenFile, fileIsValid);
  };

  const chooseImageHandler = () => {
    fileChooserRef.current.click();
  };

  return (
    <div className="form-control">
      <input
        id={props.id}
        ref={fileChooserRef}
        style={{ display: "none" }}
        type="file"
        accept=".jpg,.png,jpeg"
        onChange={chosenHandler}
      />
      <div className={`image-upload ${props.center && "center"}`}>
        <div className="image-upload__preview">
          {previewUrl && <img src={previewUrl} alt="Preview" />}
          {!previewUrl && <p>Choose an image</p>}
        </div>
        <Button type="button" onClick={chooseImageHandler}>
          Choose Image
        </Button>
        {!isValid && <p>{props.errorText}</p>}
      </div>
    </div>
  );
};

export default ImageUpload;
