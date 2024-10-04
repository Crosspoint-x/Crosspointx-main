import React from 'react'; // Import React to use JSX
import ReactDOM from 'react-dom'; // Import ReactDOM to render the app
import App from './App'; // Import the main App component
import './index.css'; // Import any necessary CSS files

// Render the App wrapped in the Router
ReactDOM.render(
  <React.StrictMode>
          <App />
     </React.StrictMode>,
  document.getElementById('root')
);
