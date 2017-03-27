import {React, ReactDOM} from 'react'
import {Slider} from 'react-slick'
import 'slick/slick/slick.css'
import 'slick/slick/slick-theme.css'

// First, checks if it isn't implemented yet.
if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : match;
        });
    };
}

function getHighestMatch(format) {
    const regex = /\{(.*?)\}/g;
    const string = format;
    let m;
    while ((m = regex.exec(str)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        console.log(m)
        // The result can be accessed through the `m`-variable.
        console.log(format.replace(m[0],'yes'))
    }
}
class Carousel extends React.Component {
    render : function() {
        const settings = this.props.settings
        let format = this.props.format

        return (
            <Slider {...settings}>

                ) } function carousel(slice,payload){const d3token = d3.select(slice.selector);
                d3token.selectAll('*').remove();
                // filter box should ignore the dashboard's filters
                // const url = slice.jsonEndpoint({ extraFilters: false });
                const fd = slice.formData;
                const filtersChoices = {};
                ReactDOM.render(<)
            }}