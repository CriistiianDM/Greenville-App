import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import {
  CustomSelect,
  CustomTextField,
  CustomInput,
  CustomSearchSelect,
} from './inputs';
import { useAlertDispatch } from '../../context/Alert';
import API from '../../api';

export default function HomeFields({
  inputProps,
  dependencies,
  setFieldValue,
  showId = false,
}) {
  let selectedZone = null;
  const { openAlert } = useAlertDispatch();

  const handleChangeAutocomplete = async (
    table,
    field,
    createMethod,
    lengthFields,
    reason
  ) => {
    let fieldValue = field || '';
    if (fieldValue && reason === 'create-option') {
      fieldValue = `Add ${table} "${field}"`;
    }

    if (fieldValue && fieldValue.startsWith(`Add ${table}`)) {
      fieldValue = fieldValue.substring(lengthFields).replaceAll('"', '');
      const { data: element } = await createMethod(
        JSON.stringify({ name: fieldValue })
      );
      const tablename = table.charAt(0).toUpperCase() + table.slice(1);
      const [variant, message] = element
        ? ['success', `${tablename} created correctly`]
        : ['error', `Error creating ${tablename}`];
      openAlert({
        variant,
        message,
      });
    }
    setFieldValue(table, fieldValue || '');
  };

  const handleChangeAutocompleteModel = (event, value, reason) => {
    console.log('{e,reason}', { value, reason });
    handleChangeAutocomplete('model', value, API.createModels, 9, reason);
  };
  const handleChangeAutocompleteBuilder = (event, value, reason) => {
    console.log('{e,reason}', { value, reason });
    handleChangeAutocomplete('builder', value, API.createBuilders, 12, reason);
  };

  const inputZone = inputProps.values.zone;
  if (inputZone) {
    selectedZone = dependencies.zones.find(z => z.name === inputZone);
  }

  React.useEffect(() => {
    //guardar el session storage
    sessionStorage.setItem('zone', JSON.stringify(selectedZone));
  });

  return (
    <>
      <Grid
        item
        md={12}
        container
        justify="space-between"
        style={{ backgroundColor: (selectedZone || {}).color, opacity: 0.6 }}
      >
        <Grid item xs={12} md={6}>
          <Typography variant="h6" color="primary">
            Address
          </Typography>
          <CustomInput
            name="address"
            label="Address"
            readOnly={showId}
            {...inputProps}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <CustomSelect
            name="zone"
            label="Zone"
            InputProps={{
              readOnly: showId,
            }}
            {...inputProps}
            style={{ marginTop: 25 }}
            options={dependencies.zones}
          />
        </Grid>
        {showId && (
          <Grid item xs={6} md={3}>
            <CustomTextField
              name="idHr"
              label="ID HR"
              type="number"
              isRequired={true}
              {...inputProps}
              InputProps={{
                readOnly: showId,
              }}
              style={{ margin: '25px 0px 0px 16px' }}
            />
          </Grid>
        )}
      </Grid>
      <Grid item xs={12} md={4}>
        <CustomTextField name="lastName" isRequired={true} label="Last Name" {...inputProps} />
      </Grid>
      <Grid item xs={12} md={4}>
        <CustomSearchSelect
          name="model"
          label="Model"
          {...inputProps}
          handleChange={handleChangeAutocompleteModel}
          options={dependencies.models}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <CustomSearchSelect
          name="builder"
          label="Builder"
          {...inputProps}
          handleChange={handleChangeAutocompleteBuilder}
          options={dependencies.builders}
        />
      </Grid>
      <Grid item xs={6} md={3}>
        <CustomTextField
          type="number"
          name="drywallFootage"
          label="Drywall Footage"
          isRequired={true}
          {...inputProps}
        />
      </Grid>
      <Grid item xs={6} md={3}>
        <CustomTextField
          type="number"
          name="footHouse"
          label="Foot House"
          isRequired={true}
          {...inputProps}
        />
      </Grid>
      <Grid item xs={6} md={3}>
        <CustomTextField
          type="number"
          name="footGarage"
          label="Foot Garage"
          isRequired={false}
          {...inputProps}
        />
      </Grid>
      <Grid item xs={6} md={3}>
        <CustomTextField
          type="number"
          name="footExterior"
          label="Foot Exterior"
          isRequired={false}
          {...inputProps}
        />
      </Grid>
      <Grid item xs={6} md={3}>
        <CustomTextField
          type="number"
          name="GadeCode"
          label="Gade Code"
          isRequired={false}
          {...inputProps}
        />
      </Grid>
      <Grid item xs={6} md={3}>
        <CustomTextField
          type="number"
          name="DorrCode"
          label="Dorr Code"
          isRequired={false}
          {...inputProps}
        />
      </Grid>
    </>
  );
}
