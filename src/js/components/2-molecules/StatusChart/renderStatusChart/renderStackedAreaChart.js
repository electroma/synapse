const d3 = require('d3');
const removeElement = require('./removeElement');
import parseTime from './parseTime';

module.exports = (
  containerElement,
  data,
  categories,
  yScale,
  dateScale,
  chartID
) => {
  removeElement(chartID);

  const area = d3.area()
    .x(d => dateScale(parseTime(d.data.date)))
    .y0(d => yScale(d[0] || 0))
    .y1(d => yScale(d[1] || 0));

  const stack = d3.stack()
    .keys(categories)
    .order(d3.stackOrderReverse)
    .offset(d3.stackOffsetNone);

  const stackContainer = containerElement.append('g')
    .attr('id', chartID);

  if (data.length > 0) {
    stackContainer
      .attr('class', 'stack');

    const layer = stackContainer.selectAll('.layer')
      .data(stack(data))
      .enter()
      .append('g')
      .attr('class', 'layer');

    layer.append('path')
      .attr('class', 'area')
      .style('fill', (d, i) => d3.schemeCategory20[i])
      .attr('d', area);
  }

  return stackContainer;
};
