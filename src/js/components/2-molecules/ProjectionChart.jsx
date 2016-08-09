const d3 = require('d3');
import React from 'react';
const makePoints = require('../../helpers/makePoints');
import moment from 'moment';

const TRANSITION_DURATION = 100;

export default class ProjectionChart extends React.Component {
  constructor() {
    super();
    this.points = null;
    this.chart = null;
    this.vis = null;
    this.startDate = moment().format('DD-MMM-YY');
    this.parseTime = d3.timeParse('%d-%b-%y');
  }

  componentDidMount() {
    this.setVis();
    this.setDateAxis();
    this.setYAxis();
    this.update();
  }

  componentDidUpdate() {
    this.setDateAxis();
    this.setYAxis();
    this.update();
  }

  componentWillUnmount() {
    this.vis.remove();
  }

  getSize() {
    return {
      width: 800 - this.props.padding.left - this.props.padding.right,
      height: this.chart.clientHeight - this.props.padding.top - this.props.padding.bottom,
    };
  }

  getScale() {
    const size = this.getSize();
    const parseTime = this.parseTime;

    const dateMin =
      this.points ? parseTime(this.points[0].date) : parseTime('01-Jan-01');
    const dateMax =
      parseTime(
        moment(this.props.zoom.xAxisMaxDate).format('DD-MMM-YY')
      );

    return {
      x: d3.scaleLinear()
        .domain([0, this.props.zoom.xAxisMax])
        .range([0, size.width]),

      date: d3.scaleTime()
        .domain([dateMin, dateMax])
        .range([0, size.width]),

      y: d3.scaleLinear()
        .domain([this.props.zoom.yAxisMax, 0])
        .range([0, size.height]),
    };
  }

  setVis() {
    const size = this.getSize();
    this.vis = d3.select(this.chart).append('svg')
      .attr('class', 'chart')
      .attr('width', this.chart.clientWidth)
      .attr('height', this.chart.clientHeight)
      .append('g')
      .attr('transform', `translate(${this.props.padding.left}, ${this.props.padding.top})`);

    this.vis.append('svg')
      .attr('top', 0)
      .attr('left', 0)
      .attr('width', size.width)
      .attr('height', size.height)
      .attr('viewBox', `0 0 ${size.width} ${size.height}`)
      .attr('class', 'line');

    this.vis.append('path')
      .attr('class', 'area');

    this.vis.append('path')
      .attr('class', 'backlog');

    this.vis.append('path')
      .attr('class', 'dark-matter');
  }

  setYAxis() {
    d3.select('.axis--y').remove();

    const yScale = this.getScale().y;
    this.vis.append('g')
      .attr('class', 'axis axis--y')
      .attr('transform', 'translate(-20, 0)')
      .call(d3.axisLeft(yScale));
  }

  setXAxis() {
    d3.select('.axis--x').remove();

    const xScale = this.getScale().x;
    const height = this.getSize().height;

    this.vis.append('g')
      .attr('class', 'axis-container')
      .attr('transform', `translate(0, ${height + 10})`)
        .append('g')
        .attr('class', 'axis axis--x')
        .call(d3.axisBottom(xScale));
  }

  setDateAxis() {
    d3.select('.axis--date').remove();

    const dateScale = this.getScale().date;
    const height = this.getSize().height;

    this.vis.append('g')
      .attr('class', 'axis-container')
      .attr('transform', `translate(0, ${height - 6})`)
        .append('g')
        .attr('class', 'axis axis--date')
        .call(d3.axisBottom(dateScale));
  }


  setYAxisLabel(label) {
    this.vis.append('text')
      .attr('class', 'y label')
      .attr('text-anchor', 'end')
      .attr('y', 30)
      .attr('transform', 'rotate(-90)')
      .text(label);
  }

  update() {
    const { projection } = this.props;
    const { backlogSize, darkMatter, iterationLength } = projection;
    this.points = makePoints(projection, this.startDate, iterationLength);
    this.updateCurve();
    this.updateBacklog(backlogSize);
    this.updateDarkMatter(backlogSize, darkMatter);
  }

  updateCurve() {
    const parseTime = this.parseTime;
    const scale = this.getScale();
    const size = this.getSize();

    const area = d3.area()
      .x(d => scale.date(parseTime(d.date)))
      .y0(size.height)
      .y1(d => scale.y(d.y));

    this.vis.select('path.area')
      .transition()
      .duration(TRANSITION_DURATION)
      .attr('d', area(this.points));
  }

  updateBacklog(backlogSize) {
    const parseTime = this.parseTime;
    const scale = this.getScale();

    const area = d3.area()
      .x(d => scale.date(parseTime(d.date)))
      .y0(scale.y(backlogSize))
      .y1(d => scale.y(d.y));

    this.vis.select('path.backlog')
      .transition()
      .duration(TRANSITION_DURATION)
      .attr('d', area(this.points));
  }

  updateDarkMatter(backlogSize, darkMatter) {
    const parseTime = this.parseTime;
    const scale = this.getScale();

    const backlogSizeWithDarkMatter = backlogSize + backlogSize * (darkMatter / 100);

    const area = d3.area()
      .x(d => scale.date(parseTime(d.date)))
      .y0(scale.y(backlogSizeWithDarkMatter))
      .y1(scale.y(backlogSize));

    this.vis.select('path.dark-matter')
      .transition()
      .duration(TRANSITION_DURATION)
      .attr('d', area(this.points));
  }

  testDot(points) {
    if (points) {

      const parseTime = this.parseTime;

      const dateScale = this.getScale().date;

      this.vis.append('circle')
      .attr('cx', dateScale(parseTime(points[0].date)))
      .attr('cy', 50)
      .attr('r', 10)
      .style('opacity', 0.1)
      .style('fill', 'aqua');
    }
  }

  render() {
    return (
      <div
        ref={(c) => { this.chart = c; return false; }}
        className="projection-chart"
      />);
  }
}

ProjectionChart.propTypes = {
  projection: React.PropTypes.object.isRequired,
  padding: React.PropTypes.object,
  zoom: React.PropTypes.object.isRequired,
};

ProjectionChart.defaultProps = {
  padding: { top: 40, right: 30, bottom: 60, left: 60 },
};
