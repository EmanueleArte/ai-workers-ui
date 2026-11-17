import EgyptScene from './egypt.jsx';
import SpaceScene from './space.jsx';
import MedievalScene from './medieval.jsx';

// Add a skin: create a component ({ state, now }) => <svg/> and register it here.
export const skins = [
  { id: 'egypt', label: 'Egitto', Scene: EgyptScene },
  { id: 'space', label: 'Spazio', Scene: SpaceScene },
  { id: 'medieval', label: 'Medioevo', Scene: MedievalScene },
];
