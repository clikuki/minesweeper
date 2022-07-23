import { Grid } from './grid.js';

new Grid(10, 10, 10, document.querySelector('.container')!, () => {
	console.log('clicked!');
});
