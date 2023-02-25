import React, { useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import {
  CardActionArea,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import API from '../../api';
import { useHouse } from '../../context/House';
import { useHistory } from 'react-router-dom';

export default function Dashboard() {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [{ houses }] = useHouse();
  const [selected, setSelected] = useState(null);

  async function init() {
    try {
      const mStatuses = await API.getHouseStatuses();
      console.log({ mStatuses });
      setStatuses([{ name: 'INITIAL' }, ...mStatuses]);
    } catch (error) {
      console.error('Dashboard Error:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(name) {
    return () => {
      setSelected(name);
    };
  }

  useEffect(() => {
    init();
  }, []);

  const report = houses
    .filter(house => house.status)
    .reduce((acc, house) => {
      const { status } = house;
      const currentCount = (acc[status] || {}).count || 0;
      const currentData = (acc[status] || {}).data || [];
      return {
        ...acc,
        [status]: { data: [...currentData, house], count: currentCount + 1 },
      };
    }, {});
  console.log({ statuses, report });
  const selectedReport = (report[selected] || {}).data || [];
  return (
    <Grid container justify={'center'} spacing={2}>
      {loading && <CircularProgress sx={{ mt: 12 }} size={80} />}
      {!loading &&
        statuses.map(status => {
          const { name } = status;
          const statusReport = report[name] || {};
          return (
            <Grid key={name} item className='container-card-box'>
              <Card width={'100%'} className="card-items-container">
                <CardActionArea onClick={handleSelect(name)}>
                  <CardContent className='title-text-container'>
                    <Typography variant={'h3'} align={'center'}>
                      {statusReport.count || 0}
                    </Typography>
                    <Typography variant={'subtitle1'} align={'center'}>
                      {name}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      <Grid item md={12}>
        {!!selected && !!selectedReport.length && (
          <HouseList data={selectedReport} />
        )}
        {!!selected && !selectedReport.length && (
          <Typography align={'center'}>
            There are no Houses with this status
          </Typography>
        )}
      </Grid>
    </Grid>
  );
}

const columns = [
  { name: 'idHr', label: 'ID HR' },
  { name: 'address', label: 'ADDRESS' },
  { name: 'lastName', label: 'LAST NAME' },
  { name: 'model', label: 'MODEL' },
  // { name: 'drywall', label: 'DRYWALL' },
  // { name: 'footage', label: 'FOOTAGE' },
  // { name: 'foot_house', label: 'FOOT HOUSE' },
  // { name: 'foot_garage', label: 'FOOT GARAGE' },
  // { name: 'foot_exterior', label: 'FOOT EXTERIOR' },
  { name: 'builder', label: 'BUILDER' },
  { name: 'zone', label: 'ZONE' },
  { name: 'files', label: 'FILES' },
];

function HouseList({ data }) {
  
  const history = useHistory();
  const [{ houses }, { setHouses, setHouseSelected }] = useHouse();

  //eveent click
  let handleClick = (e) => {

    let id_house = (e.currentTarget.id).split('-')[1];
    const data_house = data.filter((house) => house.idHouse === Number(id_house));
    history.push(`/update/${id_house}`);
    setHouseSelected(data_house[0]);
       
  };  

  return (
    <TableContainer component={Paper} sx={{ m: 2, width: '100%' }}>
      <Table sx={{ maxWidth: 640 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            {columns.map(({ name, label }) => (
              <TableCell key={name}>
                <strong>{label}</strong>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {(data || []).map((row, index) => (
           
              <TableRow
                key={index}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                style={{ cursor: "pointer" }}
                id={`home-${row.idHouse}`}
                onClick={handleClick}
              >
                {columns.map(({ name } , index_j) => (
                  <TableCell key={name}> 
                          {row[name]}
                  </TableCell>
                ))}
              </TableRow>
           
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
