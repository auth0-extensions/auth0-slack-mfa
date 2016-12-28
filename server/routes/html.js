import ejs from 'ejs';
import view from '../views/html';

export default () => (req, res) => res.end(ejs.render(view()));
