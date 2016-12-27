import ejs from 'ejs';
import { Router as router } from 'express';
import view from '../views/html';

export default () => {
  console.log('hereo.');
  return (req, res) => {
    console.log("here");
    return res.end(ejs.render(view()));
  };
};
