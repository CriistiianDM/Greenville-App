import React from 'react';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import useStyles from './styles';

const formatOptions = {
  weekday: 'short',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
};

function Comment({ comment }) {
  if (!comment) return null;
  const date = new Date(comment.date).toLocaleString('en-US', formatOptions);
  const classes = useStyles();
  return (
    <Grid
      item
      md={12}
      container
      spacing={2}
      className={classes.commentContainer}
    >
      <Grid item md={6}>
        <Typography align="left" className={classes.userBox}>
          {comment.user}
        </Typography>
      </Grid>
      <Grid item md={6}>
        <Typography align="right">{date}</Typography>
      </Grid>
      <Grid item md={12}>
        <Box width="100%" className={classes.commentBox}>
          <Typography align="left">{comment.description}</Typography>
        </Box>
      </Grid>
      {comment.files ? (
        <Grid item md={12}>
          <Link align="right" href={comment.files} target="_blank">
            Attachments
          </Link>
        </Grid>
      ) : null}
      <Grid item md={12}>
        <Divider variant="middle" flexItem />
      </Grid>
    </Grid>
  );
}

export default Comment;
