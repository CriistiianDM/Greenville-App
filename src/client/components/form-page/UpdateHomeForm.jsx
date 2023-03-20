import React, { useCallback, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Formik } from 'formik';
import { updateValidationSchema, getInitialValues } from './form-settings';
import useStyles from './styles';
import { useAlertDispatch } from '../../context/Alert';
import { useHouse } from '../../context/House';
import HomeFields from './HomeFields';
import FilesFields from './FilesFields';
import useHouseForm, { getFormData } from '../../hooks/useHouseForm';
import CommentsSection from './CommentsSection';
import HouseStatuses from './HouseStatuses';
import { formatDate } from '../utils';

export default function UpdateHomeForm({ history }) {
  const classes = useStyles();
  const { openAlert } = useAlertDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [{ houseSelected }, { updateHouse }] = useHouse();
  const dependencies = useHouseForm();
  const initialValues = getInitialValues();
  console.log('houseSelected update 45', houseSelected,dependencies);

  const onSuccess = useCallback(resetForm => {
    openAlert({
      variant: 'success',
      message: 'House Updated Successfully!',
    });
    resetForm(initialValues);
    history.push('/');
  }, []);

  const onError = useCallback(e => {
    const message = 'Something went wrong creating the house';
    openAlert({
      message,
      variant: 'error',
    });
    console.error(`${message}: `, e);
  }, []);

  //useEffect(() => {
  React.useEffect(() => {
     //guardar en la session storage el id de la casa seleccionada
     sessionStorage.setItem('house_selected', JSON.stringify(houseSelected) );
  },[]);

  const onSubmit = useCallback(async (values, { setSubmitting, resetForm }) => {
    const { houseFiles, formData } = getFormData(values);
    try {
      setSubmitting(true);
      setIsLoading(true);
      
      await updateHouse({ files: houseFiles, house: formData });
      onSuccess(resetForm);
    } catch (e) {
      onError(e);
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  }, []);

  return (
    <div>
      {dependencies.loading && <LinearProgress />}
      <Formik
        enableReinitialize
        onSubmit={onSubmit}
        initialValues={houseSelected}
        validationSchema={updateValidationSchema}
      >
        {formikProps => {
          const {
            values,
            touched,
            errors,
            setFieldValue,
            handleBlur,
            handleChange,
            handleSubmit,
          } = formikProps;
          const inputProps = {
            classes,
            errors,
            touched,
            values,
            handleChange,
            handleBlur,
            isLoading,
          };
          return (
            <Paper className={classes.paper}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={4}>
                  {houseSelected.date && (
                    <Grid item xs={12} container justify="flex-end">
                      <Typography variant="caption">
                        {formatDate(houseSelected.date)}
                      </Typography>
                    </Grid>
                  )}
                  <HomeFields
                    showId
                    inputProps={inputProps}
                    setFieldValue={setFieldValue}
                    dependencies={dependencies}
                  />
                  {!!(dependencies.houseStatuses || []).length && (
                    <Grid item xs={12}>
                      <Typography variant="h5" component="h2">
                        House Status
                      </Typography>
                      <HouseStatuses
                        house={houseSelected}
                        statuses={dependencies.houseStatuses}
                      />
                    </Grid>
                  )}
                  <Divider variant="middle" />
                  <div className='_conatiner_date_group_'>
                        <span><b>Date change status:</b> {houseSelected.dateNextCall}</span>
                  </div>
                  <Divider variant="middle" />
                  <Grid item xs={12}>
                    <FilesFields
                      houseSelected={houseSelected}
                      {...{ values, isLoading, setFieldValue }}
                      filesGroups={dependencies.filesGroups}
                    />
                  </Grid>
                  <Divider variant="middle" />
                  <Grid item xs={12}>
                    <Button
                      disabled={isLoading}
                      className={classes.button}
                      variant="contained"
                      type="submit"
                      color="primary"
                    >
                      SAVE CHANGES
                    </Button>
                    {isLoading && <LinearProgress />}
                  </Grid>
                </Grid>
              </form>
            </Paper>
          );
        }}
      </Formik>
      <CommentsSection
        isLoading={isLoading}
        houseStatuses={dependencies.houseStatuses}
      />
    </div>
  );
}
