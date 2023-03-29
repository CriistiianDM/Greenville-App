import React from 'react';
// import Typography from '@material-ui/core/Typography';
// import TextField from '@material-ui/core/TextField';
// import { Typography } from '@material-ui/core/styles/createTypography';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { Button , Typography , TextField  } from '@material-ui/core';


//estilos de los componentes
const useStyles = makeStyles((theme) => ({

    textField: {
        width: '100%',
        height: '8em',
    },
    title_menssage: {
        fontSize: '1.5em', 
        fontWeight: 'bold',
        color: '#373737',
        textAlign: 'center',
    },
    button_styles: {
        width: '80%',
        height: '3em',
    }

}));


export default function CalendarEvent(props) {

  const classes = useStyles();
  const { on_calendar_event_click,  set_on_calendar_event_click } = props.properties;
  console.log('CalendarEvent', props.properties, props);
  const date_today = new Date();
  const dia = date_today.getDate().toString().padStart(2, '0');
  const mes = (date_today.getMonth() + 1).toString().padStart(2, '0');
  const anio = date_today.getFullYear().toString();

  const fechaFormateada = anio + "-" + mes + "-" + dia;
  const date_today_format = `${date_today.getFullYear()}-${date_today.getMonth() + 1}-${date_today.getDate()}`;

  const handle_close_click = () => {

        const date_element = document.getElementById('date_calendar');
        //sacar el valor del input
        const date_value = date_element.value;
        set_on_calendar_event_click({
            ...on_calendar_event_click,
            checked: false,
            date: date_value
        });

  }

  const handle_open_click = () => {
    set_on_calendar_event_click({
        ...on_calendar_event_click,
        checked: false,
        date: 'aaaa-dd-mm'
    });

  }

  //console.log('CalendarEvent', data);
  console.log('CalendarEvent', on_calendar_event_click.checked);
  if (on_calendar_event_click.checked) {
    return (
        <>
            <div className='_container_menssage_calendar_'>
                <div>
                        <Typography class={classes.title_menssage} variant="h3" component="h3">
                            Select a date to create a new event
                        </Typography>
                        <TextField
                            id="date_calendar"
                            label="Reservation date"
                            type="date"
                            defaultValue={fechaFormateada}
                            className={classes.textField}
                            InputLabelProps={{
                            shrink: true,
                            }}
                        />
                        <div className='_container_button_calendar_'>
                            <Button onClick={handle_open_click} className={classes.button_styles}>
                                Cancel
                            </Button>
                            <Button onClick={handle_close_click} className={classes.button_styles}>
                                OK 
                            </Button>
                        </div>
                </div>

            </div>
        </>
    );
  }

  return (
    <></>
  )

}