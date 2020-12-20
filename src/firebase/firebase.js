import firebaseConfig from './firebaseConfig';
import firebase from 'firebase/app';
import 'firebase/database';

firebase.initializeApp(firebaseConfig);
export const db = firebase.database();