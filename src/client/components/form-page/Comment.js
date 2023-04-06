import React from 'react';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import useStyles from './styles';
import { formatDate } from '../utils';

function Comment({ comment }) {
  
  if (!comment) return null;
  const date = formatDate(comment.date);
  const classes = useStyles();
  const [files, setFiles] = React.useState({
      url_file: ''
  });

  const url_file = async () => {
    const response = await comment.files;

    setFiles({
      ...files,
      url_file: response
    });

  };
  
  React.useEffect(() => {
    url_file();
  }, []);

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
        <Grid item md={6}>
          <Link align="right" href={files.url_file} target="_blank">
            Attachments
          </Link>
        </Grid>
      ) : null}
      {comment.status ? (
        <Grid item md={comment.files ? 6 : 12} container justify="flex-end">
          <Typography variant="caption" align="right">
            Updated to {comment.status}
          </Typography>
        </Grid>
      ) : null}
    </Grid>
  );
}

export default Comment;
