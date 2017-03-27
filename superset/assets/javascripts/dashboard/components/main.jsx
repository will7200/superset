import React from 'react';
import Header from './Header.jsx'
import GridLayout from './GridLayout'
import { connect } from 'react-redux';
const propTypes = {
    dashboard: React.PropTypes.object,
    update: React.PropTypes.bool
};
const defaultProps = {update : false};
const mapStateToProps = (state, ownProps) => ({
    update: state.update
})
class dash extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount(){
        this.props.dashboard.reactGridLayout = this.refs.GridLayout
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
dash.propTypes = propTypes;
dash.defaultProps = defaultProps;

const Dash = connect(mapStateToProps,)(dash)
export default Dash
