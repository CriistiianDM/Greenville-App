import React, { useCallback, useState, useEffect } from 'react';
import Dropzone from 'react-dropzone';
import { fade, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { getFile } from '../utils';
import PreviewList from './PreviewList';

const useStyles = makeStyles(() => ({
  text: {
    textAlign: 'center',
  },
  container: {
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    borderStyle: 'dashed',
    backgroundColor: fade('#555', 0.2),
  },
  default: {
    borderColor: 'black',
  },
  error: {
    borderColor: 'red',
  },
  disabled: {
    borderColor: 'gray',
  },
}));

export default function CustomDropzone({
  error,
  field,
  reset,
  helperText,
  setFieldValue,
  ...dropZoneProps
}) {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const { disabled } = dropZoneProps;
  const classes = useStyles();

  const dropzoneRef = React.useRef(null);

  const addFiles = (droppedFiles = []) =>
    setFiles(prevFiles => [...prevFiles, ...droppedFiles]);

  const onDrop = useCallback(async acceptedFiles => {
    if (!acceptedFiles.length) return;
    setLoading(true);
    addFiles(acceptedFiles);
    console.log(acceptedFiles , 'Acepted Files')
    const response = await Promise.all(acceptedFiles.map(getFile));
    console.log(response , 'Response')
    setFieldValue(field, response);
    setLoading(false);
  }, []);

  //sessionStorage.setItem('take_photo', 'false');

  useEffect(() => {
    if (reset) {
      setFiles([]);
    }
  }, [reset]);

  window.onload = function() {
    sessionStorage.removeItem('MT15');
  }

  var video_ = document.getElementById(`video_${field}`);
  var stream_ = null;

  const handle_click = () => {
     //obetener elemento por clase y quitar una clase para mostrarlo
     const _element_html_ = document.getElementById(`box_${field}`)
     _element_html_.classList.remove('_display_none_');

     navigator.mediaDevices.getUserMedia({ video: true })
     .then(function(stream) {
         stream_ = stream;
         video_.srcObject = stream;
         video_.play();

     })
     .catch(function(err) {
         console.log("Ocurrió un error al acceder a la cámara: " + err);
     });

  }

  const handle_close = () => {
      //obetener elemento por clase y add una clase para mostrarlo
      document.getElementById(`box_${field}`)
      .classList.add('_display_none_');  
      
      if (stream_) {
        var tracks = stream_.getTracks();
        tracks.forEach(function(track) {
            track.stop();
        });
        video_.pause();
        video_.srcObject = null;
        stream_ = null;
    }
  }

  return (
    <>
      <Dropzone ref={dropzoneRef} onDrop={onDrop} {...dropZoneProps}>
        {({ getRootProps, getInputProps, isDragActive }) => (
          <>
          <div
            className={clsx(classes.container, {
              [classes.error]: error,
              [classes.disabled]: disabled,
              [classes.default]: !disabled && !error,
            })}
            {...getRootProps()}
          >
            <input id={field} name={field} {...getInputProps()} />
            <p className={classes.text}>
              {error && helperText}
              {isDragActive && !error && 'Drop Files here ...'}
              {!files.length && !error && 'Drop files here or click to upload'}
            </p>
            {!!files.length && <PreviewList files={files} loading={loading} />}
          </div>
           {
                PhotoComponent(setFiles, handle_close, field) 
           }
          <div>
              <a className='_take_photo_action_' onClick={handle_click} >Tomar foto</a>
          </div>
          </>
        )}
      </Dropzone>
    </>
    
  );
}

function PhotoComponent(setFiles,handle_close,field) {
      
          return (
              <div id={`box_${field}`} className='_container_photo_mobile_ _display_none_'>
                <a onClick={handle_close} className='_close_take_photo_' /> 
                <div video="true" >
                    <video style={{
                      position: 'relative',
                      height: '10em',
                      width: '100%',
                      zIndex: 9999,
                    }} id={`video_${field}`} ></video>
                    <canvas style={{
                      display: 'none'
                    }} id="canvas"></canvas>
                    <a style={{
                      position: 'relative',
                      zIndex: 9999,
                    }} onClick={() => logic_take_photop(setFiles,field)}>Tomar foto</a>
                  </div>
              </div>
          )
    //}

}


async function logic_take_photop(setFiles,field) {
    console.log('Tomar foto', setFiles , field)
    var video = document.getElementById(`video_${field}`);
    console.log(video, 'Video')
    var canvas = document.getElementById("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    var dataURL = canvas.toDataURL("image/png");
  
       
    var file = dataURLtoFile(dataURL, 'filename.png');
    var array_file = [];
    array_file.push(file);
    console.log(file , 'file' , field )
    setFiles(prevFiles => [...prevFiles, file]);
    const response = await Promise.all(array_file.map(getFile));
    setFieldValue(field, response);

    document.getElementById(`box_${field}`)
    .classList.add('_display_none_');    
     
}


function dataURLtoFile(dataURL, filename) {
  var arr = dataURL.split(',');
  var mime = arr[0].match(/:(.*?);/)[1];
  var bstr = atob(arr[1]);
  var n = bstr.length;
  var u8arr = new Uint8Array(n);

  while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });

}
