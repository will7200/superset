import React from 'react';
import Header from './Header.jsx'
import GridLayout from './GridLayout'
const propTypes = {
    dashboard: React.PropTypes.object
};
const defaultProps = {};

class Dash extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        const dashboard = this.props.dashboard;
        return (
            <div>
                <div id="dashboard-header">
                    <Header dashboard={dashboard}/>
                </div>
                <div id="grid-container" className="slice-grid gridster">
                    <GridLayout dashboard={dashboard} ref="GridLayout"/>
                </div>
            </div>
        );
    }
}
Dash.propTypes = propTypes;
Dash.defaultProps = defaultProps;

export default Dash;
