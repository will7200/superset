import React from 'react';
import ReactDOM from 'react-dom';
import Slider from 'react-slick'
import {connect} from 'react-redux'
import './../node_modules/slick-carousel/slick/slick.css'
import './carousel.css'
import moment from 'moment'
// First, checks if it isn't implemented yet.
if (!String.prototype.f) {
    String.prototype.f = function() {
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
    var index = -1
    while ((m = regex.exec(string)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        index += 1
    }
    return index
}
var defaultSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
}
const propTypes = {
    settings: React.PropTypes.object,
    format: React.PropTypes.string
};

const container = {
    margin: '0 auto',
    width: '90%',
    height: '94%'
}

const defaultProps = {
    settings: defaultSettings,
    format: 'Needs Format'
};
class Carousel extends React.Component {
    render() {
        const settings = this.props.settings
        const data = this.props.data
        let format = this.props.format
        return (
            <div style={container}>
                <Slider {...settings}>
                    {data && data.records.slice(0, 5).map((i, index) => {
                        let t = data.columns.map((j, index) => {
                            if(moment(i[j],'YYYY-MM-DDTHH:mm:ss.SSSSSS',true).isValid())
                                return moment(i[j]).format(dateFormat)
                            else
                                return i[j]
                            })
                        return <div key={index} dangerouslySetInnerHTML={{
                            __html: format.f(...t)
                        }}/>
                    })}
                </Slider>
            </div>
        );
    }
}
Carousel.propTypes = propTypes;
Carousel.defaultProps = defaultProps;
const dateFormat = 'DD/MM/YYYY H:mm:ss'
function carousel(slice, payload) {
    const fd = slice.formData;
    var settings
    var format
    const data = payload.data
    if (fd.extra) {
        settings = JSON.parse(fd.extra.settings)
        format = fd.extra.format_
    } else {
        settings = defaultSettings
        format = '<div>{0}</div>'
    }
    ReactDOM.render(
        <Carousel settings={settings} format={format} data={data}/>, document.getElementById(slice.containerId));
}

module.exports = carousel;