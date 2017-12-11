import configuireStore from './store/configureStore';
import {wrapStore} from 'react-chrome-redux';

const store = configuireStore();
 
wrapStore(store, {portName: 'VKF'}); // make sure portName matches 