import EgyptScene from './egypt/index.jsx';
import SpaceScene from './space/index.jsx';
import MedievalScene from './medieval/index.jsx';
import OfficeScene from './office/index.jsx';

// Add a skin: create skins/<id>/index.jsx exporting a component ({ state, now }) => <svg/> and register it here.
export const skins = [
  { id: 'egypt', label: 'Egitto', Scene: EgyptScene },
  { id: 'space', label: 'Spazio', Scene: SpaceScene },
  { id: 'medieval', label: 'Medioevo', Scene: MedievalScene },
  { id: 'office', label: 'Ufficio Maidaive', Scene: OfficeScene },
];
