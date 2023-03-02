import React, { useCallback, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import LinearProgress from '@material-ui/core/LinearProgress';
import { Formik } from 'formik';
import useStyles from './styles';
import { createValidationSchema, getInitialValues } from './form-settings';
import { useAlertDispatch } from '../../context/Alert';
import { useHouseDispatch } from '../../context/House';
import HomeFields from './HomeFields';
import useHouseForm, { getFormData } from '../../hooks/useHouseForm';
import FilesFields from './FilesFields';

export default function CreateHomeForm() {
  const classes = useStyles();
  const HouseContext = useHouseDispatch();
  const { openAlert } = useAlertDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const {
    filesGroups = [],
    loading: loadingDependencies,
    ...dependencies
  } = useHouseForm();
  const initialFilesValues = filesGroups.map(g => g.name);
  const initialValues = getInitialValues(initialFilesValues);

  const onSuccess = useCallback(({ data, resetForm }) => {
    openAlert({
      variant: 'success',
      message: `House #${data.idHouse} created successfully!`,
    });
    resetForm(initialValues);
  }, []);

  const onError = useCallback((e, msg = '') => {
    const message = `Something went wrong creating the house. ${msg}`;
    openAlert({
      message,
      variant: 'error',
    });
    console.error(`${message}: `, e);
  }, []);

  const onSubmit = useCallback(async (values, { setSubmitting, resetForm }) => {
    const { houseFiles, formData } = getFormData(values);
    try {
      setSubmitting(true);
      setIsLoading(true);
      console.log('formData', formData , 'houseFiles', houseFiles);
      const data = await HouseContext.addHouse({
        files: houseFiles,
        house: formData,
      });
      if (data.error) {
        onError('error', data.error);
      } else {
        onSuccess({ data, resetForm });
      }
    } catch (e) {
      onError(e);
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  }, []);

  return (
    <div>
      <Formik
        onSubmit={onSubmit}
        initialValues={initialValues}
        validationSchema={createValidationSchema}
      >
        {formikProps => {
          const {
            values,
            touched,
            errors,
            handleBlur,
            handleChange,
            handleSubmit,
            setFieldValue,
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
              {loadingDependencies && <LinearProgress />}
              <Typography component="h1" variant="h4" gutterBottom>
                Create New House
              </Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={4}>
                  <HomeFields
                    setFieldValue={setFieldValue}
                    inputProps={inputProps}
                    dependencies={dependencies}
                  />
                  <Divider variant="middle" />
                  <FilesFields
                    {...{ values, isLoading, setFieldValue }}
                    filesGroups={filesGroups}
                  />
                  <Divider variant="middle" />
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      color="primary"
                      variant="contained"
                      className={classes.button}
                      disabled={isLoading || loadingDependencies}
                    >
                      Save
                    </Button>
                    {isLoading && <LinearProgress />}
                  </Grid>
                </Grid>
              </form>
            </Paper>
          );
        }}
      </Formik>
    </div>
  );
}
