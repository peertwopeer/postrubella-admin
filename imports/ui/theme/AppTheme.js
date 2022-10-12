import { createTheme } from '@material-ui/core/styles';
import "/imports/ui/theme/assets/css/material-dashboard.css";
import "/imports/ui/theme/assets/css/material-dashboard-react.css";


const AppTheme = createTheme({
    palette: {
        primary: {
            main: '#9c27b0',
        }
    }
});

export default AppTheme;
