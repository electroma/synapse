const isValid = require('../src/js/helpers/isValid');
const should = require('chai').should();

describe('Data validity checker', () => {
  it('Rejects when projectDate property is missing from a data point', () => {
    const data = [
      {
        projectDate: '2015-10-29',
        status: {
          Backlog: 23,
        },
      },
      {
        projectDate: '',
        status: {
          Backlog: 34,
        },
      },
    ];
    should.equal(isValid(data, 'demand-status-data'), false);
  });

  it('Rejects when projectDate does not conform to expected date format', () => {
    const data = [
      {
        projectDate: '2015-10-29',
        status: {
          Backlog: 23,
        },
      },
      {
        projectDate: 'x2015-10-30',
        status: {
          Backlog: 34,
        },
      },
    ];
    should.equal(isValid(data, 'demand-status-data'), false);
  });

  it('Does not reject when projectDate has slashes instead of dashes', () => {
    const data = [
      {
        projectDate: '2015-10-29',
        status: {
          Backlog: 23,
        },
      },
      {
        projectDate: '2015/10/30',
        status: {
          Backlog: 34,
        },
      },
    ];
    should.equal(isValid(data, 'demand-status-data'), true);
  });

  it('Rejects when a demand status point does not contain a "status" key', () => {
    const data = [
      {
        projectDate: '2015-10-29',
        status: {
          Backlog: 23,
        },
      },
      {
        projectDate: '2015-10-30',
        platypus: {
          Backlog: 34,
        },
      },
    ];
    should.equal(isValid(data, 'demand-status-data'), false);
  });

  it('Rejects when a defect status point does not contain a "severity" key', () => {
    const data = [
      {
        projectDate: '2015-10-29',
        severity: {
          0: 1,
        },
      },
      {
        projectDate: '2015-10-30',
        kangaroo: {
          0: 2,
        },
      },
    ];
    should.equal(isValid(data, 'defect-status-data'), false);
  });

  it('Rejects when an effort status point does not contain an "activity" key', () => {
    const data = [
      {
        projectDate: '2015-10-29',
        activity: {
          Delivery: 1,
        },
      },
      {
        projectDate: '2015-10-30',
        mustard: {
          Delivery: 2,
        },
      },
    ];
    should.equal(isValid(data, 'effort-status-data'), false);
  });
});
